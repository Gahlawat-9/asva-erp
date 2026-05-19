import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface StockItem {
  itemCode: string;
  itemName: string;
  unit: string;
  category: string;
  currentStock: number;
  minStock: number;
}

const STORAGE = "factory_stock_master";

function loadStock(): StockItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function saveStock(stock: StockItem[]) {
  localStorage.setItem(STORAGE, JSON.stringify(stock));
}

function emptyItem(): StockItem {
  return {
    itemCode: "",
    itemName: "",
    unit: "",
    category: "",
    currentStock: 0,
    minStock: 0,
  };
}

export function StockMasterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [stock, setStock] = useState<StockItem[]>([]);
  const [current, setCurrent] = useState<StockItem>(emptyItem());
  const [search, setSearch] = useState("");
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    if (open) {
      const loaded = loadStock();
      setStock(loaded);
      setCurrent(emptyItem());
      setIsExisting(false);
    }
  }, [open]);

  const filtered = stock.filter(
    (s) =>
      s.itemName.toLowerCase().includes(search.toLowerCase()) ||
      s.itemCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {

    if (!current.itemCode.trim()) {
      toast.error("Please enter item code");
      return;
    }

    if (!current.itemName.trim()) {
      toast.error("Please enter item name");
      return;
    }

    const exists = stock.find(
      (s) =>
        s.itemCode === current.itemCode &&
        s !== current
    );

    if (exists && !isExisting) {
      toast.error("Item code already exists");
      return;
    }

    let next: StockItem[];

    if (isExisting) {
      next = stock.map((s) =>
        s.itemCode === current.itemCode ? current : s
      );
    } else {
      next = [...stock, current];
    }

    saveStock(next);
    setStock(next);
    setIsExisting(true);

    toast.success("Stock item saved");
  };

  const handleDelete = () => {

    const next = stock.filter(
      (s) => s.itemCode !== current.itemCode
    );

    saveStock(next);
    setStock(next);

    toast.success("Item deleted");

    handleNew();
  };

  const handleNew = () => {
    setCurrent(emptyItem());
    setIsExisting(false);
  };

  const openExisting = (item: StockItem) => {
    setCurrent(item);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-6xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-sm font-normal text-white">
            Stock Master
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[260px_1fr] min-h-[520px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">

            <div className="flex items-center gap-2 border rounded px-2 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />

              <input
                placeholder="Search item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 outline-none text-sm"
              />
            </div>

            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              Inventory Items
            </h3>

            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No items found
              </p>
            ) : (
              <ul className="space-y-1">

                {filtered.map((item) => (

                  <li key={item.itemCode}>

                    <button
                      onClick={() => openExisting(item)}
                      className={`w-full text-left text-xs px-2 py-2 rounded hover:bg-accent ${
                        current.itemCode === item.itemCode && isExisting
                          ? "bg-accent font-semibold"
                          : ""
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>
                          <div>{item.itemName}</div>

                          <div className="text-[10px] text-muted-foreground">
                            {item.itemCode}
                          </div>
                        </div>

                        <div
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            item.currentStock <= item.minStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.currentStock}
                        </div>

                      </div>

                    </button>

                  </li>

                ))}

              </ul>
            )}

          </aside>

          {/* Main Section */}

          <section className="p-4 flex flex-col gap-4">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold underline">
                Inventory Stock Master
              </h2>

              <div
                className={`text-xs px-2 py-1 rounded ${
                  current.currentStock <= current.minStock
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Current Stock : {current.currentStock}
              </div>

            </div>

            {/* Form */}

            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="text-xs">Item Code</label>

                <Input
                  value={current.itemCode}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      itemCode: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Item Name</label>

                <Input
                  value={current.itemName}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      itemName: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Unit</label>

                <Input
                  placeholder="PCS / KG / NOS"
                  value={current.unit}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      unit: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Category</label>

                <Input
                  placeholder="RAW MATERIAL"
                  value={current.category}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      category: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Current Stock</label>

                <Input
                  type="number"
                  value={current.currentStock}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      currentStock: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">Minimum Stock</label>

                <Input
                  type="number"
                  value={current.minStock}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      minStock: Number(e.target.value),
                    })
                  }
                />
              </div>

            </div>

            {/* Table */}

            <div className="border bg-white overflow-auto max-h-[260px]">

              <table className="w-full text-xs">

                <thead className="bg-muted">

                  <tr>
                    <th className="p-2 text-left">Item Code</th>
                    <th className="p-2 text-left">Item Name</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Current Stock</th>
                    <th className="p-2 text-left">Min Stock</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>

                </thead>

                <tbody>

                  {filtered.map((item) => (

                    <tr
                      key={item.itemCode}
                      className="border-t hover:bg-muted/50 cursor-pointer"
                      onClick={() => openExisting(item)}
                    >

                      <td className="p-2">{item.itemCode}</td>
                      <td className="p-2">{item.itemName}</td>
                      <td className="p-2">{item.unit}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.currentStock}</td>
                      <td className="p-2">{item.minStock}</td>

                      <td className="p-2">

                        <span
                          className={`text-[10px] px-2 py-1 rounded ${
                            item.currentStock <= item.minStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.currentStock <= item.minStock
                            ? "LOW STOCK"
                            : "AVAILABLE"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Footer */}

            <div className="flex justify-between border-t pt-4">

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  onClick={handleNew}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>

              </div>

              <div className="flex gap-2">

                <Button
                  onClick={handleSave}
                >
                  Save
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={!isExisting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Print
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