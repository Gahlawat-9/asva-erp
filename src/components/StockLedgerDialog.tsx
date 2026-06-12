import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const API = "https://asva-erp.onrender.com/api";

interface LedgerEntry {
  _id?: string;
  date: string;
  itemCode: string;
  itemName: string;
  transactionType: string;
  qty: number;
  balanceAfter: number;
  referenceNo: string;
  remarks?: string;
}

export function StockLedgerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [search, setSearch] = useState("");

  // ================= LOAD FROM BACKEND =================
  useEffect(() => {
    const load = () => {
    fetch("https://asva-erp.onrender.com/api/stockledger")
      .then(res => res.json())
      .then(setEntries);
  };

  if (open) load();

  window.addEventListener("ledger-updated", load);

  return () => window.removeEventListener("ledger-updated", load);
  }, [open]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      return (
        e.itemName.toLowerCase().includes(q) ||
        e.itemCode.toLowerCase().includes(q) ||
        e.transactionType.toLowerCase().includes(q) ||
        e.referenceNo.toLowerCase().includes(q)
      );
    });
  }, [entries, search]);

  const totalInward = filtered
    .filter((e) => e.qty > 0)
    .reduce((a, b) => a + b.qty, 0);

  const totalOutward = filtered
    .filter((e) => e.qty < 0)
    .reduce((a, b) => a + Math.abs(b.qty), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        {/* UI SAME */}
        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-sm font-normal text-white">
            Stock Ledger
          </DialogTitle>
        </DialogHeader>

        <section className="p-4 flex flex-col gap-4 min-h-[600px]">

          <div className="flex justify-between">

            <input
              className="border p-2 w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="border bg-white overflow-auto flex-1">

            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Balance</th>
                  <th>Ref</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((e) => (
                  <tr key={e._id}>
                    <td>{e.date}</td>
                    <td>{e.itemName}</td>
                    <td>{e.transactionType}</td>
                    <td>{e.qty}</td>
                    <td>{e.balanceAfter}</td>
                    <td>{e.referenceNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button onClick={() => window.print()}>Print</Button>
            <Button onClick={() => onOpenChange(false)}>Exit</Button>
          </div>

        </section>
      </DialogContent>
    </Dialog>
  );
}