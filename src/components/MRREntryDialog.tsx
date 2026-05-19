import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface MRRItem {
  itemCode: string;
  itemName: string;
  orderedQty: string;
  receivedQty: string;
  acceptedQty: string;
  rejectedQty: string;
  unit: string;
  remarks: string;
}

interface MRR {
  mrrNo: string;
  date: string;
  vendor: string;
  poNo: string;
  receivedBy: string;
  status: "pending" | "completed";
  items: MRRItem[];
  remarks: string;
}

const STORAGE = "factory_mrrs";

function loadMRRs(): MRR[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function saveMRRs(mrrs: MRR[]) {
  localStorage.setItem(STORAGE, JSON.stringify(mrrs));
}

function emptyItem(): MRRItem {
  return {
    itemCode: "",
    itemName: "",
    orderedQty: "",
    receivedQty: "",
    acceptedQty: "",
    rejectedQty: "",
    unit: "",
    remarks: "",
  };
}

function nextMRRNo(existing: MRR[]): string {
  const max = existing.reduce((m, p) => Math.max(m, parseInt(p.mrrNo, 10) || 0), 0);
  return String(max + 1).padStart(6, "0");
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function blankMRR(existing: MRR[], user: string): MRR {
  return {
    mrrNo: nextMRRNo(existing),
    date: todayStr(),
    vendor: "",
    poNo: "",
    receivedBy: user,
    status: "pending",
    items: [emptyItem()],
    remarks: "",
  };
}

export function MRREntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useAuth();

  const [mrrs, setMrrs] = useState<MRR[]>([]);
  const [current, setCurrent] = useState<MRR | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    if (open) {
      const loaded = loadMRRs();
      setMrrs(loaded);
      setCurrent(blankMRR(loaded, user?.username ?? "store"));
      setIsExisting(false);
    }
  }, [open, user]);

  if (!current) return null;

  const isCompleted = current.status === "completed";

  const updateItem = (i: number, patch: Partial<MRRItem>) => {
    if (isCompleted) return;

    setCurrent({
      ...current,
      items: current.items.map((it, idx) =>
        idx === i ? { ...it, ...patch } : it
      ),
    });
  };

  const addRow = () => {
    if (isCompleted) return;

    setCurrent({
      ...current,
      items: [...current.items, emptyItem()],
    });
  };

  const removeRow = (i: number) => {
    if (isCompleted) return;

    setCurrent({
      ...current,
      items:
        current.items.length > 1
          ? current.items.filter((_, idx) => idx !== i)
          : [emptyItem()],
    });
  };

  const handleSave = () => {
    if (!current.vendor.trim()) {
      toast.error("Please enter vendor name");
      return;
    }

    if (!current.poNo.trim()) {
      toast.error("Please enter PO number");
      return;
    }

    if (!current.items.some((it) => it.itemName.trim())) {
      toast.error("Please add at least one item");
      return;
    }

    const next = isExisting
      ? mrrs.map((m) => (m.mrrNo === current.mrrNo ? current : m))
      : [...mrrs, current];

    saveMRRs(next);
    setMrrs(next);
    setIsExisting(true);

    toast.success(`MRR ${current.mrrNo} saved`);
  };

  const handleComplete = () => {

  const updated: MRR = {
    ...current,
    status: "completed",
  };

  // SAVE MRR

  const next = mrrs.map((m) =>
    m.mrrNo === updated.mrrNo ? updated : m
  );

  saveMRRs(next);

  // =========================
  // STOCK MASTER UPDATE
  // =========================

  const stock = JSON.parse(
    localStorage.getItem("factory_stock_master") ?? "[]"
  );

  updated.items.forEach((item) => {

    const acceptedQty = Number(item.acceptedQty || 0);

    if (!acceptedQty) return;

    const existing = stock.find(
      (s: any) => s.itemCode === item.itemCode
    );

    if (existing) {

      existing.currentStock =
        Number(existing.currentStock || 0) + acceptedQty;

    } else {

      stock.push({
        itemCode: item.itemCode,
        itemName: item.itemName,
        unit: item.unit,
        category: "RAW MATERIAL",
        currentStock: acceptedQty,
        minStock: 0,
      });

    }

  });

  localStorage.setItem(
    "factory_stock_master",
    JSON.stringify(stock)
  );

  // =========================
  // STOCK LEDGER UPDATE
  // =========================

  const ledger = JSON.parse(
    localStorage.getItem("factory_stock_ledger") ?? "[]"
  );

  updated.items.forEach((item) => {

    const qty = Number(item.acceptedQty || 0);

    if (!qty) return;

    const stockItem = stock.find(
      (s: any) => s.itemCode === item.itemCode
    );

    ledger.push({
      id: crypto.randomUUID(),
      date: updated.date,
      itemCode: item.itemCode,
      itemName: item.itemName,
      transactionType: "MRR",
      qty: qty,
      balanceAfter: stockItem?.currentStock || qty,
      referenceNo: updated.mrrNo,
      remarks: "Material Receipt",
    });

  });

  localStorage.setItem(
    "factory_stock_ledger",
    JSON.stringify(ledger)
  );


  // =========================

  setMrrs(next);
  setCurrent(updated);

  toast.success("Material received & stock updated");

};

  const handleNew = () => {
    const loaded = loadMRRs();

    setCurrent(blankMRR(loaded, user?.username ?? "store"));
    setIsExisting(false);
  };

  const handleDelete = () => {
    if (isCompleted) {
      toast.error("Completed MRR cannot be deleted");
      return;
    }

    const next = mrrs.filter((m) => m.mrrNo !== current.mrrNo);

    saveMRRs(next);
    setMrrs(next);

    toast.success("MRR deleted");

    handleNew();
  };

  const openExisting = (mrr: MRR) => {
    setCurrent(mrr);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">
        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-sm font-normal text-white">
            Material Receipt Report (MRR Entry)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[240px_1fr] min-h-[520px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">
            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              Saved MRRs
            </h3>

            {mrrs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No records
              </p>
            ) : (
              <ul className="space-y-1">
                {mrrs.map((m) => (
                  <li key={m.mrrNo}>
                    <button
                      onClick={() => openExisting(m)}
                      className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-accent ${
                        current.mrrNo === m.mrrNo && isExisting
                          ? "bg-accent font-semibold"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{m.mrrNo}</span>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            m.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Main */}

          <section className="p-4 flex flex-col gap-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold underline">
                Material Receipt Report
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isCompleted ? "Completed" : "Pending"}
              </span>
            </div>

            {/* Header */}

            <div className="grid grid-cols-4 gap-3">

              <div>
                <label className="text-xs">MRR No.</label>
                <Input value={current.mrrNo} readOnly />
              </div>

              <div>
                <label className="text-xs">Date</label>
                <Input
                  value={current.date}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Vendor</label>
                <Input
                  value={current.vendor}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      vendor: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">PO Number</label>
                <Input
                  value={current.poNo}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      poNo: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            {/* Table */}

            <div className="border bg-white overflow-auto max-h-[300px]">

              <table className="w-full text-xs">

                <thead className="bg-muted">
                  <tr>
                    <th className="p-1">Sno</th>
                    <th className="p-1 text-left">Item Code</th>
                    <th className="p-1 text-left">Item Name</th>
                    <th className="p-1 text-left">Ordered Qty</th>
                    <th className="p-1 text-left">Received Qty</th>
                    <th className="p-1 text-left">Accepted Qty</th>
                    <th className="p-1 text-left">Rejected Qty</th>
                    <th className="p-1 text-left">Unit</th>
                    <th className="p-1 text-left">Remarks</th>
                    <th />
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
                          "orderedQty",
                          "receivedQty",
                          "acceptedQty",
                          "rejectedQty",
                          "unit",
                          "remarks",
                        ] as const
                      ).map((field) => (
                        <td key={field} className="p-0.5">
                          <Input
                            value={it[field]}
                            onChange={(e) =>
                              updateItem(i, {
                                [field]: e.target.value,
                              } as Partial<MRRItem>)
                            }
                            className="h-7 text-xs"
                          />
                        </td>
                      ))}

                      <td className="text-center">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

            <div>
              <label className="text-xs">Remarks</label>

              <textarea
                value={current.remarks}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    remarks: e.target.value,
                  })
                }
                className="w-full border rounded p-2 text-sm min-h-[80px]"
              />
            </div>

            {/* Footer */}

            <div className="flex justify-between border-t pt-3">

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleNew}>
                  New
                </Button>

                <Button
                  variant="outline"
                  onClick={addRow}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Row
                </Button>
              </div>

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Print
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isCompleted}
                >
                  Save
                </Button>

                {isExisting && !isCompleted && (
                  <Button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Complete Receipt
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isCompleted}
                >
                  Delete
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => onOpenChange(false)}
                >
                  Exit
                </Button>

              </div>

            </div>

          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}