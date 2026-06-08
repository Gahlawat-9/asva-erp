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

/* ---------------- TYPES ---------------- */

interface PRItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  remarks: string;
  earliest: string;
  latest: string;
  rate: number;
}

interface PR {
  _id?: string;
  prNo: string;
  date: string;
  dept: string;
  indenter: string;
  closed: "Y" | "N";
  items: PRItem[];
  remarksCond: string;
  status?: "pending" | "approved";
  approvedBy?: string;
  approvedAt?: string;
}

/* ---------------- API ---------------- */

async function loadPRs(): Promise<PR[]> {
  const res = await axios.get("https://asva-erp.onrender.com/api/pr");
  return res.data;
}

/* ---------------- HELPERS ---------------- */

function emptyItem(): PRItem {
  return {
    itemCode: "",
    itemName: "",
    quantity: 0,
    unit: "",
    remarks: "",
    earliest: "",
    latest: "",
    rate: 0,
  };
}

function nextPrNo(existing: PR[]): string {
  const max = existing.reduce(
    (m, p) => Math.max(m, parseInt(p.prNo, 10) || 0),
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

function blankPR(existing: PR[], indenter: string): PR {
  return {
    prNo: nextPrNo(existing),
    date: todayStr(),
    dept: "",
    indenter,
    closed: "N",
    items: [emptyItem()],
    remarksCond: "",
    status: "pending",
  };
}

/* ---------------- COMPONENT ---------------- */

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

  const isAdmin = user?.username === "admin";
  const isApproved = current?.status === "approved";

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    const fetch = async () => {
      if (!open) return;

      const loaded = await loadPRs();
      setPrs(loaded);

      setCurrent(blankPR(loaded, user?.username ?? "admin"));
      setIsExisting(false);
      setTab("items");
    };

    fetch();
  }, [open, user]);

  if (!current) return null;

  /* ---------------- ITEM HANDLERS ---------------- */

  const updateItem = (i: number, patch: Partial<PRItem>) => {
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

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    try {
      if (isApproved) {
        toast.error("Approved P.R. cannot be modified");
        return;
      }

      if (!current.dept.trim()) {
        toast.error("Please enter Department");
        return;
      }

      if (!current.items.some((it) => it.itemName.trim())) {
        toast.error("Add at least one item");
        return;
      }

      const payload = {
        ...current,
        items: current.items.map((it) => ({
          ...it,
          quantity: Number(it.quantity),
          rate: Number(it.rate),
        })),
      };

      let saved;

      if (isExisting && current._id) {
        const res = await axios.put(
          `https://asva-erp.onrender.com/api/pr/${current._id}`,
          payload
        );
        saved = res.data;
      } else {
        const res = await axios.post(
          "https://asva-erp.onrender.com/api/pr",
          payload
        );
        saved = res.data;
      }

      const refreshed = await loadPRs();
      setPrs(refreshed);

      setCurrent(saved);
      setIsExisting(true);

      toast.success(`P.R. ${saved.prNo} saved`);
    } catch {
      toast.error("Failed to save P.R.");
    }
  };

  /* ---------------- APPROVE ---------------- */

  const handleApprove = async () => {
  try {
    const res = await axios.put(
      `https://asva-erp.onrender.com/api/pr/${current._id}/approve`,
      {
        approvedBy: user?.username,
      }
    );

    setCurrent(res.data);

    toast.success("P.R. approved");
  } catch (err) {
    console.error(err);

    toast.error("Approval failed");
  }
};

  /* ---------------- NEW ---------------- */

  const handleNew = async () => {
    const loaded = await loadPRs();
    setCurrent(blankPR(loaded, user?.username ?? "admin"));
    setIsExisting(false);
    setTab("items");
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    try {
      if (!current._id) return;

      await axios.delete(
        `https://asva-erp.onrender.com/api/pr/${current._id}`
      );

      const refreshed = await loadPRs();
      setPrs(refreshed);

      setCurrent(blankPR(refreshed, user?.username ?? "admin"));
      setIsExisting(false);

      toast.success("P.R. deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- OPEN EXISTING ---------------- */

  const openExisting = (pr: PR) => {
    setCurrent(pr);
    setIsExisting(true);
    setTab("items");
  };

  /* ---------------- UI (YOUR ORIGINAL UI KEPT) ---------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Purchase Requisition Entry</DialogTitle>
        </DialogHeader>

        {/* LIST */}
        <div className="max-h-32 overflow-auto border p-2 text-xs">
          <div className="font-semibold mb-1">
            {isAdmin ? "All P.R.s (Admin)" : "Saved P.R.s"}
          </div>

          {prs.length === 0 ? (
            <div>No records</div>
          ) : (
            prs.map((p) => (
              <button
                key={p._id}
                onClick={() => openExisting(p)}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-accent"
              >
                {p.prNo} — {p.dept || "(no dept)"}
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                    p.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {p.status === "approved" ? "Approved" : "Pending"}
                </span>
              </button>
            ))
          )}
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between mt-2">
          <h2 className="text-lg font-semibold underline">
            Purchase Requisition
          </h2>

          {isExisting && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isApproved ? "Approved" : "Pending approval"}
            </span>
          )}
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-3 gap-2">
          <Input value={current.prNo} readOnly />
          <Input
            value={current.dept}
            onChange={(e) =>
              setCurrent({ ...current, dept: e.target.value })
            }
            placeholder="Dept"
          />
          <Input
            value={current.indenter}
            onChange={(e) =>
              setCurrent({ ...current, indenter: e.target.value })
            }
            placeholder="Indenter"
          />
        </div>

        {/* ITEMS */}
        <div className="mt-3">
          <Button onClick={addRow} size="sm">
            <Plus className="w-4 h-4" /> Add row
          </Button>

          {current.items.map((it, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 mt-2">
              <Input
                placeholder="Item"
                value={it.itemName}
                onChange={(e) =>
                  updateItem(i, { itemName: e.target.value })
                }
              />
              <Input
                placeholder="Qty"
                value={it.quantity}
                onChange={(e) =>
                  updateItem(i, { quantity: Number(e.target.value) })
                }
              />
              <Input
                placeholder="Rate"
                value={it.rate}
                onChange={(e) =>
                  updateItem(i, { rate: Number(e.target.value) })
                }
              />
              <Button onClick={() => removeRow(i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleNew}>New</Button>
          <Button onClick={handleSave}>Save</Button>

          {isAdmin && isExisting && !isApproved && (
            <Button onClick={handleApprove} className="bg-green-600 text-white">
              Approve
            </Button>
          )}

          <Button onClick={handleDelete}>Delete</Button>

          <Button onClick={() => onOpenChange(false)} variant="destructive">
            Exit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}