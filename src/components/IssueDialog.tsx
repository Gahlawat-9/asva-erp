import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface IssueItem {
  itemCode: string;
  itemName: string;
  availableStock: number;
  issueQty: string;
  unit: string;
}

interface Issue {
  issueNo: string;
  date: string;
  department: string;
  issuedBy: string;
  status: "pending" | "completed";
  items: IssueItem[];
  remarks: string;
}

interface StockItem {
  itemCode: string;
  itemName: string;
  unit: string;
  category: string;
  currentStock: number;
  minStock: number;
}

const STORAGE = "factory_issues";

function loadIssues(): Issue[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function saveIssues(data: Issue[]) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

function loadStock(): StockItem[] {
  try {
    return JSON.parse(localStorage.getItem("factory_stock_master") ?? "[]");
  } catch {
    return [];
  }
}

function nextIssueNo(existing: Issue[]) {
  const max = existing.reduce(
    (m, p) => Math.max(m, parseInt(p.issueNo, 10) || 0),
    0
  );

  return String(max + 1).padStart(6, "0");
}

function todayStr() {
  const d = new Date();

  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function emptyItem(): IssueItem {
  return {
    itemCode: "",
    itemName: "",
    availableStock: 0,
    issueQty: "",
    unit: "",
  };
}

export function IssueDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isExisting, setIsExisting] = useState(false);

  const [current, setCurrent] = useState<Issue>({
    issueNo: "",
    date: todayStr(),
    department: "",
    issuedBy: "STORE MANAGER",
    status: "pending",
    items: [emptyItem()],
    remarks: "",
  });

  useEffect(() => {

    if (open) {

      const loadedIssues = loadIssues();

      setIssues(loadedIssues);
      setStock(loadStock());

      setCurrent({
        issueNo: nextIssueNo(loadedIssues),
        date: todayStr(),
        department: "",
        issuedBy: "STORE MANAGER",
        status: "pending",
        items: [emptyItem()],
        remarks: "",
      });

      setIsExisting(false);

    }

  }, [open]);

  const updateItem = (
    i: number,
    patch: Partial<IssueItem>
  ) => {

    setCurrent({
      ...current,
      items: current.items.map((it, idx) =>
        idx === i ? { ...it, ...patch } : it
      ),
    });

  };

  const addRow = () => {

    setCurrent({
      ...current,
      items: [...current.items, emptyItem()],
    });

  };

  const removeRow = (i: number) => {

    setCurrent({
      ...current,
      items:
        current.items.length > 1
          ? current.items.filter((_, idx) => idx !== i)
          : [emptyItem()],
    });

  };

  const handleItemSelect = (
    i: number,
    itemCode: string
  ) => {

    const item = stock.find(
      (s) => s.itemCode === itemCode
    );

    if (!item) return;

    updateItem(i, {
      itemCode: item.itemCode,
      itemName: item.itemName,
      availableStock: item.currentStock,
      unit: item.unit,
    });

  };

  const handleSave = () => {

    if (!current.department.trim()) {
      toast.error("Enter department");
      return;
    }

    if (!current.items.some((i) => i.itemCode)) {
      toast.error("Add at least one item");
      return;
    }

    const next = isExisting
      ? issues.map((p) =>
          p.issueNo === current.issueNo ? current : p
        )
      : [...issues, current];

    saveIssues(next);

    setIssues(next);
    setIsExisting(true);

    toast.success("Issue saved");

  };

  const handleComplete = () => {

    const updatedStock = [...stock];

    for (const item of current.items) {

      const qty = Number(item.issueQty || 0);

      const stockItem = updatedStock.find(
        (s) => s.itemCode === item.itemCode
      );

      if (!stockItem) continue;

      if (qty > stockItem.currentStock) {

        toast.error(
          `Insufficient stock for ${stockItem.itemName}`
        );

        return;
      }

    }

    current.items.forEach((item) => {

      const qty = Number(item.issueQty || 0);

      const stockItem = updatedStock.find(
        (s) => s.itemCode === item.itemCode
      );

      if (!stockItem) return;

      stockItem.currentStock -= qty;

    });

    localStorage.setItem(
      "factory_stock_master",
      JSON.stringify(updatedStock)
    );

    // =========================
    // LEDGER UPDATE
    // =========================

    const ledger = JSON.parse(
      localStorage.getItem("factory_stock_ledger") ?? "[]"
    );

    current.items.forEach((item) => {

      const qty = Number(item.issueQty || 0);

      if (!qty) return;

      const stockItem = updatedStock.find(
        (s) => s.itemCode === item.itemCode
      );

      ledger.push({
        id: crypto.randomUUID(),
        date: current.date,
        itemCode: item.itemCode,
        itemName: item.itemName,
        transactionType: "ISSUE",
        qty: -qty,
        balanceAfter: stockItem?.currentStock || 0,
        referenceNo: current.issueNo,
        remarks: `Issued to ${current.department}`,
      });

    });

    localStorage.setItem(
      "factory_stock_ledger",
      JSON.stringify(ledger)
    );

    // =========================

    const updated: Issue = {
      ...current,
      status: "completed",
    };

    const next = issues.map((i) =>
      i.issueNo === updated.issueNo ? updated : i
    );

    saveIssues(next);

    setIssues(next);
    setCurrent(updated);

    toast.success("Material issued successfully");

  };

  const openExisting = (issue: Issue) => {
    setCurrent(issue);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-sm font-normal text-white">
            Material Issue Entry
          </DialogTitle>

        </DialogHeader>

        <div className="grid grid-cols-[240px_1fr] min-h-[600px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">

            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              Saved Issues
            </h3>

            {issues.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No records
              </p>
            ) : (
              <ul className="space-y-1">

                {issues.map((issue) => (

                  <li key={issue.issueNo}>

                    <button
                      onClick={() => openExisting(issue)}
                      className="w-full text-left text-xs px-2 py-2 rounded hover:bg-accent"
                    >

                      <div className="flex justify-between">

                        <span>
                          {issue.issueNo}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            issue.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {issue.status}
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

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold underline">
                Material Issue
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  current.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {current.status}
              </span>

            </div>

            {/* Header */}

            <div className="grid grid-cols-4 gap-4">

              <div>
                <label className="text-xs">Issue No</label>

                <Input
                  value={current.issueNo}
                  readOnly
                />
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
                <label className="text-xs">
                  Department
                </label>

                <Input
                  value={current.department}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      department: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">
                  Issued By
                </label>

                <Input
                  value={current.issuedBy}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      issuedBy: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            {/* Table */}

            <div className="border bg-white overflow-auto">

              <table className="w-full text-xs">

                <thead className="bg-muted">

                  <tr>

                    <th className="p-2 text-left">
                      Item Code
                    </th>

                    <th className="p-2 text-left">
                      Item Name
                    </th>

                    <th className="p-2 text-left">
                      Available
                    </th>

                    <th className="p-2 text-left">
                      Issue Qty
                    </th>

                    <th className="p-2 text-left">
                      Unit
                    </th>

                    <th />

                  </tr>

                </thead>

                <tbody>

                  {current.items.map((item, i) => (

                    <tr key={i} className="border-t">

                      <td className="p-1">

                        <select
                          value={item.itemCode}
                          onChange={(e) =>
                            handleItemSelect(i, e.target.value)
                          }
                          className="w-full border rounded h-8 px-2"
                        >

                          <option value="">
                            Select Item
                          </option>

                          {stock.map((s) => (

                            <option
                              key={s.itemCode}
                              value={s.itemCode}
                            >
                              {s.itemCode}
                            </option>

                          ))}

                        </select>

                      </td>

                      <td className="p-2">
                        {item.itemName}
                      </td>

                      <td className="p-2 font-medium">
                        {item.availableStock}
                      </td>

                      <td className="p-1">

                        <Input
                          type="number"
                          value={item.issueQty}
                          onChange={(e) =>
                            updateItem(i, {
                              issueQty: e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-2">
                        {item.unit}
                      </td>

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
              <Button
                variant="outline"
                onClick={addRow}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
            </div>

            {/* Remarks */}

            <div>

              <label className="text-xs">
                Remarks
              </label>

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

            <div className="flex justify-end gap-2 border-t pt-4">

              <Button
                variant="outline"
                onClick={() => window.print()}
              >
                Print
              </Button>

              <Button
                onClick={handleSave}
                disabled={current.status === "completed"}
              >
                Save
              </Button>

              {isExisting &&
                current.status !== "completed" && (
                  <Button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Complete Issue
                  </Button>
                )}

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