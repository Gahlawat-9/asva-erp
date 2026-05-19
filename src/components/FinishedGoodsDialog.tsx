import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WorkOrder {
  woNo: string;
  productName: string;
  qty: string;
  status: string;
}

interface FGEntry {
  fgNo: string;
  date: string;
  workOrderNo: string;
  productName: string;
  producedQty: string;
  remarks: string;
}

const STORAGE = "factory_finished_goods";

function loadFG(): FGEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE) ?? "[]"
    );
  } catch {
    return [];
  }
}

function saveFG(data: FGEntry[]) {
  localStorage.setItem(
    STORAGE,
    JSON.stringify(data)
  );
}

function loadWorkOrders(): WorkOrder[] {
  try {
    return JSON.parse(
      localStorage.getItem(
        "factory_work_orders"
      ) ?? "[]"
    );
  } catch {
    return [];
  }
}

function saveWorkOrders(data: WorkOrder[]) {
  localStorage.setItem(
    "factory_work_orders",
    JSON.stringify(data)
  );
}

function nextFGNo(existing: FGEntry[]) {

  const max = existing.reduce(
    (m, p) =>
      Math.max(
        m,
        parseInt(
          p.fgNo.replace("FG-", "")
        ) || 0
      ),
    0
  );

  return `FG-${String(max + 1).padStart(4, "0")}`;

}

function todayStr() {

  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

}

export function FinishedGoodsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [entries, setEntries] =
    useState<FGEntry[]>([]);

  const [workOrders, setWorkOrders] =
    useState<WorkOrder[]>([]);

  const [current, setCurrent] =
    useState<FGEntry>({
      fgNo: "",
      date: todayStr(),
      workOrderNo: "",
      productName: "",
      producedQty: "",
      remarks: "",
    });

  useEffect(() => {

    if (open) {

      const loaded = loadFG();

      setEntries(loaded);
      setWorkOrders(loadWorkOrders());

      setCurrent({
        fgNo: nextFGNo(loaded),
        date: todayStr(),
        workOrderNo: "",
        productName: "",
        producedQty: "",
        remarks: "",
      });

    }

  }, [open]);

  const handleWOSelect = (
    woNo: string
  ) => {

    const wo = workOrders.find(
      (w) => w.woNo === woNo
    );

    if (!wo) return;

    setCurrent({
      ...current,
      workOrderNo: wo.woNo,
      productName: wo.productName,
      producedQty: wo.qty,
    });

  };

  const handleSave = () => {

    if (!current.workOrderNo) {
      toast.error(
        "Select work order"
      );
      return;
    }

    const next = [
      ...entries,
      current,
    ];

    saveFG(next);

    setEntries(next);

    /* ---------- FG STOCK ---------- */

    const stock = JSON.parse(
      localStorage.getItem(
        "factory_stock_master"
      ) ?? "[]"
    );

    const existingItem =
      stock.find(
        (s: any) =>
          s.itemName ===
          current.productName
      );

    if (existingItem) {

      existingItem.currentStock =
        Number(
          existingItem.currentStock || 0
        ) +
        Number(
          current.producedQty || 0
        );

    } else {

      stock.push({
        itemCode:
          "FG-" +
          crypto
            .randomUUID()
            .slice(0, 5),
        itemName:
          current.productName,
        unit: "NOS",
        category:
          "Finished Goods",
        currentStock:
          Number(
            current.producedQty
          ),
        minStock: 0,
      });

    }

    localStorage.setItem(
      "factory_stock_master",
      JSON.stringify(stock)
    );

    /* ---------- STOCK LEDGER ---------- */

    const ledger = JSON.parse(
      localStorage.getItem(
        "factory_stock_ledger"
      ) ?? "[]"
    );

    ledger.push({
      id: crypto.randomUUID(),
      date: current.date,
      itemCode:
        existingItem?.itemCode ||
        "FG",
      itemName:
        current.productName,
      transactionType:
        "FG ENTRY",
      qty: Number(
        current.producedQty
      ),
      balanceAfter:
        existingItem?.currentStock ||
        Number(
          current.producedQty
        ),
      referenceNo:
        current.fgNo,
      remarks:
        "Finished Goods Added",
    });

    localStorage.setItem(
      "factory_stock_ledger",
      JSON.stringify(ledger)
    );

    /* ---------- UPDATE WO ---------- */

    const updatedWO =
      workOrders.map((w) =>
        w.woNo ===
        current.workOrderNo
          ? {
              ...w,
              status:
                "Completed",
            }
          : w
      );

    saveWorkOrders(updatedWO);

    setWorkOrders(updatedWO);

    toast.success(
      "Finished goods entry saved"
    );

  };

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >

      <DialogContent className="max-w-5xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-white text-sm font-normal">
            Finished Goods Entry
          </DialogTitle>

        </DialogHeader>

        <div className="p-4 flex flex-col gap-4">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold underline">
              Finished Goods
            </h2>

          </div>

          {/* Header */}

          <div className="grid grid-cols-3 gap-4">

            <div>

              <label className="text-xs">
                FG Entry No
              </label>

              <Input
                value={current.fgNo}
                readOnly
              />

            </div>

            <div>

              <label className="text-xs">
                Date
              </label>

              <Input
                type="date"
                value={current.date}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    date:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="text-xs">
                Work Order
              </label>

              <select
                value={
                  current.workOrderNo
                }
                onChange={(e) =>
                  handleWOSelect(
                    e.target.value
                  )
                }
                className="w-full border rounded h-10 px-2 bg-white"
              >

                <option value="">
                  Select WO
                </option>

                {workOrders
                  .filter(
                    (w) =>
                      w.status !==
                      "Completed"
                  )
                  .map((w) => (

                    <option
                      key={w.woNo}
                      value={w.woNo}
                    >
                      {w.woNo}
                    </option>

                  ))}

              </select>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="text-xs">
                Product Name
              </label>

              <Input
                value={
                  current.productName
                }
                readOnly
              />

            </div>

            <div>

              <label className="text-xs">
                Produced Qty
              </label>

              <Input
                value={
                  current.producedQty
                }
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    producedQty:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div>

            <label className="text-xs">
              Remarks
            </label>

            <textarea
              value={current.remarks}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  remarks:
                    e.target.value,
                })
              }
              className="w-full border rounded p-2 text-sm min-h-[120px]"
            />

          </div>

          {/* Existing Entries */}

          <div className="border bg-white overflow-auto">

            <table className="w-full text-xs">

              <thead className="bg-muted">

                <tr>

                  <th className="p-2 text-left">
                    FG No
                  </th>

                  <th className="p-2 text-left">
                    Date
                  </th>

                  <th className="p-2 text-left">
                    Product
                  </th>

                  <th className="p-2 text-left">
                    Qty
                  </th>

                  <th className="p-2 text-left">
                    WO No
                  </th>

                </tr>

              </thead>

              <tbody>

                {entries.map((e) => (

                  <tr
                    key={e.fgNo}
                    className="border-t"
                  >

                    <td className="p-2">
                      {e.fgNo}
                    </td>

                    <td className="p-2">
                      {e.date}
                    </td>

                    <td className="p-2">
                      {e.productName}
                    </td>

                    <td className="p-2">
                      {e.producedQty}
                    </td>

                    <td className="p-2">
                      {e.workOrderNo}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-2 border-t pt-4">

            <Button
              variant="outline"
              onClick={() =>
                window.print()
              }
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
              onClick={() =>
                onOpenChange(false)
              }
            >
              Exit
            </Button>

          </div>

        </div>

      </DialogContent>

    </Dialog>
  );
}