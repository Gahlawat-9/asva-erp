import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface PRItem {
  itemCode: string;
  itemName: string;
  quantity: string;
  unit: string;
  remarks: string;
  earliest: string;
  latest: string;
  rate: string;
}

interface PR {
  prNo: string;
  date: string;
  dept: string;
  indenter: string;
  closed: "Y" | "N";
  items: PRItem[];
  remarksCond: string;
}

const STORAGE = "factory_prs";

function loadPRs(): PR[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}
function savePRs(prs: PR[]) {
  localStorage.setItem(STORAGE, JSON.stringify(prs));
}

function emptyItem(): PRItem {
  return { itemCode: "", itemName: "", quantity: "", unit: "", remarks: "", earliest: "", latest: "", rate: "" };
}

function nextPrNo(existing: PR[]): string {
  const max = existing.reduce((m, p) => Math.max(m, parseInt(p.prNo, 10) || 0), 0);
  return String(max + 1).padStart(6, "0");
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function blankPR(existing: PR[], indenter: string): PR {
  return {
    prNo: nextPrNo(existing),
    date: todayStr(),
    dept: "",
    indenter,
    closed: "N",
    items: [emptyItem()],
    remarksCond: "",
  };
}

export function PurchaseRequisitionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useAuth();
  const [prs, setPrs] = useState<PR[]>([]);
  const [current, setCurrent] = useState<PR | null>(null);
  const [tab, setTab] = useState<"items" | "remarks">("items");
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    if (open) {
      const loaded = loadPRs();
      setPrs(loaded);
      setCurrent(blankPR(loaded, user?.username ?? "admin"));
      setIsExisting(false);
      setTab("items");
    }
  }, [open, user]);

  if (!current) return null;

  const updateItem = (i: number, patch: Partial<PRItem>) => {
    setCurrent({ ...current, items: current.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  const addRow = () => setCurrent({ ...current, items: [...current.items, emptyItem()] });
  const removeRow = (i: number) =>
    setCurrent({
      ...current,
      items: current.items.length > 1 ? current.items.filter((_, idx) => idx !== i) : [emptyItem()],
    });

  const handleSave = () => {
    if (!current.dept.trim()) {
      toast.error("Please enter the Department");
      return;
    }
    if (!current.items.some((it) => it.itemName.trim())) {
      toast.error("Add at least one item");
      return;
    }
    const next = isExisting
      ? prs.map((p) => (p.prNo === current.prNo ? current : p))
      : [...prs, current];
    savePRs(next);
    setPrs(next);
    setIsExisting(true);
    toast.success(`P.R. ${current.prNo} saved`);
  };

  const handleNew = () => {
    const loaded = loadPRs();
    setCurrent(blankPR(loaded, user?.username ?? "admin"));
    setIsExisting(false);
    setTab("items");
  };

  const handleDelete = () => {
    if (!isExisting) {
      handleNew();
      return;
    }
    const next = prs.filter((p) => p.prNo !== current.prNo);
    savePRs(next);
    setPrs(next);
    toast.success("P.R. deleted");
    handleNew();
  };

  const openExisting = (pr: PR) => {
    setCurrent(pr);
    setIsExisting(true);
    setTab("items");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">
        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-white text-sm font-normal">Purchase Requisition Entry</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[220px_1fr] min-h-[480px]">
          <aside className="border-r bg-white p-3 overflow-y-auto">
            <h3 className="font-semibold text-sm border-b pb-2 mb-2">Saved P.R.s</h3>
            {prs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No records</p>
            ) : (
              <ul className="space-y-1">
                {prs.map((p) => (
                  <li key={p.prNo}>
                    <button
                      onClick={() => openExisting(p)}
                      className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-accent ${
                        current.prNo === p.prNo && isExisting ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      {p.prNo} — {p.dept || "(no dept)"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="p-4 flex flex-col gap-3">
            <h2 className="text-lg font-semibold underline">Purchase Requisition</h2>

            <div className="grid grid-cols-[80px_180px_60px_180px_1fr_60px_220px] items-center gap-2 text-sm">
              <label>P.R. No.</label>
              <Input value={current.prNo} readOnly className="h-8" />
              <label>Dated</label>
              <Input
                value={current.date}
                onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                className="h-8"
              />
              <div className="text-xs text-right text-muted-foreground">
                The Deptt Which is Raising the Purchase Request
              </div>
              <label>Dept.</label>
              <Input
                placeholder="e.g. PRODUCTION"
                value={current.dept}
                onChange={(e) => setCurrent({ ...current, dept: e.target.value.toUpperCase() })}
                className="h-8"
              />
            </div>

            <div className="flex items-center gap-2 border-b">
              <button
                onClick={() => setTab("items")}
                className={`px-3 py-1.5 text-sm rounded-t ${
                  tab === "items" ? "bg-[var(--erp-banner)] font-semibold" : "bg-transparent"
                }`}
              >
                Items in this indent
              </button>
              <button
                onClick={() => setTab("remarks")}
                className={`px-3 py-1.5 text-sm rounded-t border ${
                  tab === "remarks" ? "bg-[var(--erp-banner)] font-semibold" : "bg-white"
                }`}
              >
                Remarks & Conditions
              </button>
              {tab === "items" && (
                <Button variant="outline" size="sm" onClick={addRow} className="ml-auto h-7">
                  <Plus className="w-3 h-3 mr-1" /> Add row
                </Button>
              )}
            </div>

            {tab === "items" ? (
              <div className="border bg-white max-h-[260px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-1 w-10 text-left">Sno</th>
                      <th className="p-1 text-left">Item Code</th>
                      <th className="p-1 text-left">Item Name</th>
                      <th className="p-1 text-left w-24">Quantity</th>
                      <th className="p-1 text-left w-20">Unit</th>
                      <th className="p-1 text-left">Remarks</th>
                      <th className="p-1 text-left w-28">Earliest By</th>
                      <th className="p-1 text-left w-28">Latest Dt</th>
                      <th className="p-1 text-left w-24">Expec.Rate</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {current.items.map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1">{i + 1}</td>
                        {(
                          [
                            "itemCode",
                            "itemName",
                            "quantity",
                            "unit",
                            "remarks",
                            "earliest",
                            "latest",
                            "rate",
                          ] as const
                        ).map((field) => (
                          <td key={field} className="p-0.5">
                            <Input
                              value={it[field]}
                              onChange={(e) => updateItem(i, { [field]: e.target.value } as Partial<PRItem>)}
                              className="h-7 text-xs"
                            />
                          </td>
                        ))}
                        <td className="text-center">
                          <button onClick={() => removeRow(i)} className="text-[var(--erp-danger)]">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <textarea
                value={current.remarksCond}
                onChange={(e) => setCurrent({ ...current, remarksCond: e.target.value })}
                className="border bg-white rounded p-2 text-sm min-h-[260px]"
                placeholder="Add any remarks or conditions for this P.R."
              />
            )}

            <div className="grid grid-cols-[120px_220px_1fr_140px_60px_120px] items-center gap-2 text-sm">
              <label>Indenter Ref.</label>
              <Input
                value={current.indenter}
                onChange={(e) => setCurrent({ ...current, indenter: e.target.value })}
                className="h-8"
              />
              <div />
              <label className="text-right">Close This P.R. (Y/N)</label>
              <select
                value={current.closed}
                onChange={(e) => setCurrent({ ...current, closed: e.target.value as "Y" | "N" })}
                className="h-8 border rounded px-2 bg-white"
              >
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>
              <span className="text-xs text-muted-foreground text-right">
                {isExisting ? "Existing record" : "New record"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={handleNew}>New</Button>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => window.print()}>Print</Button>
              <Button variant="outline" onClick={handleDelete}>Delete</Button>
              <Button
                variant="destructive"
                onClick={() => onOpenChange(false)}
              >
                Exit
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}