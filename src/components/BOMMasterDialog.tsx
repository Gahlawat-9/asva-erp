import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface BOMItem {
  itemCode: string;
  itemName: string;
  qtyRequired: string;
  unit: string;
  remarks: string;
}

interface BOM {
  bomNo: string;
  productName: string;
  revision: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdDate: string;
  items: BOMItem[];
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

const STORAGE = "factory_boms";

function loadBOMs(): BOM[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function saveBOMs(data: BOM[]) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

function loadStock(): StockItem[] {
  try {
    return JSON.parse(
      localStorage.getItem("factory_stock_master") ?? "[]"
    );
  } catch {
    return [];
  }
}

function nextBomNo(existing: BOM[]) {

  const max = existing.reduce(
    (m, p) =>
      Math.max(
        m,
        parseInt(p.bomNo.replace("BOM-", "")) || 0
      ),
    0
  );

  return `BOM-${String(max + 1).padStart(4, "0")}`;

}

function todayStr() {

  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

}

function emptyItem(): BOMItem {
  return {
    itemCode: "",
    itemName: "",
    qtyRequired: "",
    unit: "",
    remarks: "",
  };
}

export function BOMMasterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [boms, setBoms] = useState<BOM[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isExisting, setIsExisting] = useState(false);

  const [current, setCurrent] = useState<BOM>({
    bomNo: "",
    productName: "",
    revision: "REV-1",
    status: "Active",
    createdBy: "Production Manager",
    createdDate: todayStr(),
    items: [emptyItem()],
    remarks: "",
  });

  useEffect(() => {

    if (open) {

      const loaded = loadBOMs();

      setBoms(loaded);
      setStock(loadStock());

      setCurrent({
        bomNo: nextBomNo(loaded),
        productName: "",
        revision: "REV-1",
        status: "Active",
        createdBy: "Production Manager",
        createdDate: todayStr(),
        items: [emptyItem()],
        remarks: "",
      });

      setIsExisting(false);

    }

  }, [open]);

  const updateItem = (
    i: number,
    patch: Partial<BOMItem>
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
      unit: item.unit,
    });

  };

  const handleSave = () => {

    if (!current.productName.trim()) {
      toast.error("Enter product name");
      return;
    }

    if (
      !current.items.some((i) => i.itemCode)
    ) {
      toast.error("Add at least one material");
      return;
    }

    const next = isExisting
      ? boms.map((b) =>
          b.bomNo === current.bomNo ? current : b
        )
      : [...boms, current];

    saveBOMs(next);

    setBoms(next);
    setIsExisting(true);

    toast.success("BOM saved successfully");

  };

  const openExisting = (bom: BOM) => {
    setCurrent(bom);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-sm font-normal text-white">
            BOM Master
          </DialogTitle>

        </DialogHeader>

        <div className="grid grid-cols-[240px_1fr] min-h-[650px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">

            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              BOM Records
            </h3>

            {boms.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No BOMs available
              </p>
            ) : (
              <ul className="space-y-1">

                {boms.map((bom) => (

                  <li key={bom.bomNo}>

                    <button
                      onClick={() => openExisting(bom)}
                      className="w-full text-left text-xs px-2 py-2 rounded hover:bg-accent"
                    >

                      <div className="flex justify-between">

                        <span>
                          {bom.bomNo}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            bom.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bom.status}
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
                Bill of Materials
              </h2>

              <span
                className={`text-xs px-3 py-1 rounded ${
                  current.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {current.status}
              </span>

            </div>

            {/* Header */}

            <div className="grid grid-cols-4 gap-4">

              <div>

                <label className="text-xs">
                  BOM No
                </label>

                <Input
                  value={current.bomNo}
                  readOnly
                />

              </div>

              <div>

                <label className="text-xs">
                  Product Name
                </label>

                <Input
                  value={current.productName}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      productName: e.target.value,
                    })
                  }
                />

              </div>

              <div>

                <label className="text-xs">
                  Revision
                </label>

                <Input
                  value={current.revision}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      revision: e.target.value,
                    })
                  }
                />

              </div>

              <div>

                <label className="text-xs">
                  Created Date
                </label>

                <Input
                  type="date"
                  value={current.createdDate}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      createdDate: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            {/* Materials Table */}

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
                      Qty Required
                    </th>

                    <th className="p-2 text-left">
                      Unit
                    </th>

                    <th className="p-2 text-left">
                      Remarks
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
                            handleItemSelect(
                              i,
                              e.target.value
                            )
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

                      <td className="p-1">

                        <Input
                          type="number"
                          value={item.qtyRequired}
                          onChange={(e) =>
                            updateItem(i, {
                              qtyRequired:
                                e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-2">
                        {item.unit}
                      </td>

                      <td className="p-1">

                        <Input
                          value={item.remarks}
                          onChange={(e) =>
                            updateItem(i, {
                              remarks:
                                e.target.value,
                            })
                          }
                          className="h-8"
                        />

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
                Add Material
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
                className="w-full border rounded p-2 text-sm min-h-[100px]"
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
              >
                Save
              </Button>

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