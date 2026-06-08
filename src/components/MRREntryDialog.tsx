import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const API = "https://asva-erp.onrender.com/api";

/* ================= TYPES ================= */

interface POItem {
  itemCode: string;
  itemName: string;
  qty: number;
  unit: string;
}

interface PO {
  _id: string;
  poNo: string;
  vendor: string;
  items: POItem[];
}

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
  _id?: string;
  mrrNo: string;
  date: string;
  vendor: string;
  poNo: string;
  receivedBy: string;
  status: "pending" | "completed";
  items: MRRItem[];
  remarks: string;
}

/* ================= HELPERS ================= */

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

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function blankMRR(user: string): MRR {
  return {
    mrrNo: String(Date.now()),
    date: todayStr(),
    vendor: "",
    poNo: "",
    receivedBy: user,
    status: "pending",
    items: [emptyItem()],
    remarks: "",
  };
}

/* ================= COMPONENT ================= */

export function MRREntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useAuth();

  const [mrrs, setMrrs] = useState<MRR[]>([]);
  const [poList, setPOList] = useState<PO[]>([]);
  const [current, setCurrent] = useState<MRR | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [mrrRes, poRes] = await Promise.all([
          fetch(`${API}/mrr`),
          fetch(`${API}/po`),
        ]);

        const mrrData = await mrrRes.json();
        const poData = await poRes.json();

        setMrrs(mrrData);
        setPOList(poData);

        setCurrent(blankMRR(user?.username ?? "store"));
        setIsExisting(false);
      } catch {
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [open, user]);

  if (!current) return null;

  const isCompleted = current.status === "completed";

  /* ================= PO SELECT ================= */

  const handlePOSelect = (poNo: string) => {
    const po = poList.find((p) => p.poNo === poNo);
    if (!po) return;

    setCurrent({
      ...current,
      poNo: po.poNo,
      vendor: po.vendor,
      items: po.items.map((it) => ({
        itemCode: it.itemCode,
        itemName: it.itemName,
        orderedQty: String(it.qty),
        receivedQty: "",
        acceptedQty: "",
        rejectedQty: "",
        unit: it.unit,
        remarks: "",
      })),
    });
  };

  /* ================= ITEM HANDLERS ================= */

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
    setCurrent({ ...current, items: [...current.items, emptyItem()] });
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

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/mrr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });

      const saved = await res.json();

      setMrrs([...mrrs, saved]);
      setCurrent(saved);
      setIsExisting(true);

      toast.success("MRR Saved");
    } catch {
      toast.error("Save failed");
    }
  };

  /* ================= COMPLETE ================= */

  const handleComplete = async () => {
    try {
      if (!current._id) return toast.error("Save first");

      const res = await fetch(
        `${API}/mrr/${current._id}/complete`,
        { method: "PUT" }
      );

      const updated = await res.json();

      setMrrs(mrrs.map((m) => (m._id === updated._id ? updated : m)));
      setCurrent(updated);

      toast.success("Stock updated via PO → MRR");
    } catch {
      toast.error("Completion failed");
    }
  };

  window.dispatchEvent(new Event("stock-updated"));
window.dispatchEvent(new Event("ledger-updated"));

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0 gap-0">

        <DialogHeader className="px-4 py-2 bg-black text-white">
          <DialogTitle>MRR Entry</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">

          {/* PO SELECT (NEW ADDITION) */}
          <div>
            <label className="text-xs">Select PO</label>
            <select
              className="w-full border p-2 text-sm"
              value={current.poNo}
              onChange={(e) => handlePOSelect(e.target.value)}
            >
              <option value="">Select PO</option>
              {poList.map((po) => (
                <option key={po._id} value={po.poNo}>
                  {po.poNo}
                </option>
              ))}
            </select>
          </div>

          {/* BASIC FIELDS */}
          <div className="grid grid-cols-3 gap-2">
            <Input value={current.mrrNo} readOnly />
            <Input value={current.vendor} readOnly />
            <Input value={current.date} readOnly />
          </div>

          {/* ITEMS TABLE */}
          <div className="border">
            {current.items.map((it, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 p-2 border-b">

                <Input value={it.itemCode} readOnly />
                <Input value={it.itemName} readOnly />
                <Input value={it.orderedQty} readOnly />

                <Input
                  placeholder="Accepted"
                  value={it.acceptedQty}
                  onChange={(e) =>
                    updateItem(i, { acceptedQty: e.target.value })
                  }
                />

                <Input
                  placeholder="Rejected"
                  value={it.rejectedQty}
                  onChange={(e) =>
                    updateItem(i, { rejectedQty: e.target.value })
                  }
                />

                <button onClick={() => removeRow(i)}>
                  <Trash2 />
                </button>

              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>

            {isExisting && (
              <Button onClick={handleComplete}>
                Complete (Update Stock)
              </Button>
            )}

            <Button onClick={addRow}>
              <Plus /> Add Row
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}