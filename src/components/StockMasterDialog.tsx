import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

const API = "https://asva-erp.onrender.com/api";

interface StockItem {
  _id?: string;
  itemCode: string;
  itemName: string;
  unit: string;
  category: string;
  currentStock: number;
  minStock: number;
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

  // ================= LOAD FROM BACKEND =================
  useEffect(() => {
     const load = () => {
    fetch("https://asva-erp.onrender.com/api/stock")
      .then(res => res.json())
      .then(setStock);
  };

  if (open) load();

  window.addEventListener("stock-updated", load);

  return () => window.removeEventListener("stock-updated", load);
  }, [open]);

  const filtered = stock.filter(
    (s) =>
      s.itemName.toLowerCase().includes(search.toLowerCase()) ||
      s.itemCode.toLowerCase().includes(search.toLowerCase())
  );

  // ================= SAVE (UPSERT) =================
  const handleSave = async () => {
    if (!current.itemCode.trim()) return toast.error("Enter item code");
    if (!current.itemName.trim()) return toast.error("Enter item name");

    try {
      const res = await fetch(`${API}/stock/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });

      const saved = await res.json();

      const next = stock.filter(
        (s) => s.itemCode !== saved.itemCode
      );

      setStock([...next, saved]);
      setCurrent(saved);
      setIsExisting(true);

      toast.success("Stock saved");
    } catch {
      toast.error("Save failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      if (!current._id) return;

      await fetch(`${API}/stock/${current._id}`, {
        method: "DELETE",
      });

      const next = stock.filter(
        (s) => s.itemCode !== current.itemCode
      );

      setStock(next);
      setCurrent(emptyItem());
      setIsExisting(false);

      toast.success("Item deleted");
    } catch {
      toast.error("Delete failed");
    }
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

        {/* UI SAME */}
        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-sm font-normal text-white">
            Stock Master
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[260px_1fr] min-h-[520px]">

          {/* Sidebar SAME UI */}
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

            <ul className="space-y-1">
              {filtered.map((item) => (
                <li key={item.itemCode}>
                  <button
                    onClick={() => openExisting(item)}
                    className="w-full text-left text-xs px-2 py-2 rounded hover:bg-accent"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div>{item.itemName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.itemCode}
                        </div>
                      </div>

                      <div className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {item.currentStock}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* MAIN UI SAME */}
          <section className="p-4 flex flex-col gap-4">

            <div className="grid grid-cols-3 gap-4">

              <Input
                value={current.itemCode}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    itemCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Item Code"
              />

              <Input
                value={current.itemName}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    itemName: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Item Name"
              />

              <Input
                value={current.unit}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    unit: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Unit"
              />

              <Input
                value={current.category}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    category: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Category"
              />

              <Input
                type="number"
                value={current.currentStock}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    currentStock: Number(e.target.value),
                  })
                }
                placeholder="Current Stock"
              />

              <Input
                type="number"
                value={current.minStock}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    minStock: Number(e.target.value),
                  })
                }
                placeholder="Min Stock"
              />
            </div>

            {/* FOOTER SAME UI */}
            <div className="flex justify-between border-t pt-4">

              <Button variant="outline" onClick={handleNew}>
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>

              <div className="flex gap-2">

                <Button onClick={handleSave}>
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