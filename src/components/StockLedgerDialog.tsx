import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  transactionType: string;
  qty: number;
  balanceAfter: number;
  referenceNo: string;
  remarks?: string;
}

const STORAGE = "factory_stock_ledger";

function loadLedger(): LedgerEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
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

  useEffect(() => {
    if (open) {
      setEntries(loadLedger());
    }
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

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-sm font-normal text-white">
            Stock Ledger
          </DialogTitle>

        </DialogHeader>

        <section className="p-4 flex flex-col gap-4 min-h-[600px]">

          {/* Header */}

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold underline">
              Inventory Transaction Ledger
            </h2>

            <div className="flex items-center gap-3">

              <div className="text-xs px-3 py-1 rounded bg-green-100 text-green-700">
                Total Inward : {totalInward}
              </div>

              <div className="text-xs px-3 py-1 rounded bg-red-100 text-red-700">
                Total Outward : {totalOutward}
              </div>

            </div>

          </div>

          {/* Search */}

          <div className="flex items-center gap-2 border rounded px-3 bg-white">

            <Search className="w-4 h-4 text-muted-foreground" />

            <input
              placeholder="Search item / transaction / reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 outline-none text-sm bg-transparent"
            />

          </div>

          {/* Table */}

          <div className="border bg-white overflow-auto flex-1">

            <table className="w-full text-xs">

              <thead className="bg-muted sticky top-0 z-10">

                <tr>

                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Item Code</th>
                  <th className="p-2 text-left">Item Name</th>
                  <th className="p-2 text-left">Transaction</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Balance</th>
                  <th className="p-2 text-left">Reference No</th>
                  <th className="p-2 text-left">Remarks</th>

                </tr>

              </thead>

              <tbody>

                {filtered.length === 0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      No ledger entries found
                    </td>

                  </tr>

                ) : (

                  filtered.map((entry) => (

                    <tr
                      key={entry.id}
                      className="border-t hover:bg-muted/40"
                    >

                      <td className="p-2">{entry.date}</td>

                      <td className="p-2 font-medium">
                        {entry.itemCode}
                      </td>

                      <td className="p-2">
                        {entry.itemName}
                      </td>

                      <td className="p-2">

                        <span
                          className={`text-[10px] px-2 py-1 rounded ${
                            entry.transactionType === "MRR"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {entry.transactionType}
                        </span>

                      </td>

                      <td
                        className={`p-2 font-semibold ${
                          entry.qty >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {entry.qty >= 0 ? "+" : ""}
                        {entry.qty}
                      </td>

                      <td className="p-2">
                        {entry.balanceAfter}
                      </td>

                      <td className="p-2">
                        {entry.referenceNo}
                      </td>

                      <td className="p-2">
                        {entry.remarks || "-"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

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
              variant="destructive"
              onClick={() => onOpenChange(false)}
            >
              Exit
            </Button>

          </div>

        </section>

      </DialogContent>

    </Dialog>
  );
}