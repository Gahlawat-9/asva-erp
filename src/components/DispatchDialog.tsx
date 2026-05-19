import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DispatchItem {
  itemName: string;
  qty: string;
  unit: string;
}

interface DispatchEntry {
  dispatchNo: string;
  date: string;
  customerName: string;
  vehicleNo: string;
  driverName: string;
  invoiceNo: string;
  items: DispatchItem[];
  remarks: string;
}

const STORAGE = "factory_dispatch_entries";

function loadDispatch(): DispatchEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE) ?? "[]"
    );
  } catch {
    return [];
  }
}

function saveDispatch(data: DispatchEntry[]) {
  localStorage.setItem(
    STORAGE,
    JSON.stringify(data)
  );
}

function nextDispatchNo(
  existing: DispatchEntry[]
) {
  const max = existing.reduce(
    (m, p) =>
      Math.max(
        m,
        parseInt(
          p.dispatchNo.replace(
            "DSP-",
            ""
          )
        ) || 0
      ),
    0
  );

  return `DSP-${String(
    max + 1
  ).padStart(4, "0")}`;
}

function todayStr() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function emptyItem(): DispatchItem {
  return {
    itemName: "",
    qty: "",
    unit: "NOS",
  };
}

export function DispatchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (
    value: boolean
  ) => void;
}) {
  const [entries, setEntries] =
    useState<DispatchEntry[]>([]);

  const [current, setCurrent] =
    useState<DispatchEntry>({
      dispatchNo: "",
      date: todayStr(),
      customerName: "",
      vehicleNo: "",
      driverName: "",
      invoiceNo: "",
      items: [emptyItem()],
      remarks: "",
    });

  useEffect(() => {
    if (open) {
      const loaded =
        loadDispatch();

      setEntries(loaded);

      setCurrent({
        dispatchNo:
          nextDispatchNo(loaded),
        date: todayStr(),
        customerName: "",
        vehicleNo: "",
        driverName: "",
        invoiceNo: "",
        items: [emptyItem()],
        remarks: "",
      });
    }
  }, [open]);

  const updateItem = (
    index: number,
    patch: Partial<DispatchItem>
  ) => {
    setCurrent({
      ...current,
      items: current.items.map(
        (it, i) =>
          i === index
            ? {
                ...it,
                ...patch,
              }
            : it
      ),
    });
  };

  const addRow = () => {
    setCurrent({
      ...current,
      items: [
        ...current.items,
        emptyItem(),
      ],
    });
  };

  const handleSave = () => {
    if (
      !current.customerName.trim()
    ) {
      toast.error(
        "Enter customer name"
      );
      return;
    }

    if (
      !current.items.some(
        (i) =>
          i.itemName.trim()
      )
    ) {
      toast.error(
        "Add at least one item"
      );
      return;
    }

    /* ---------- STOCK ---------- */

    const stock = JSON.parse(
      localStorage.getItem(
        "factory_stock_master"
      ) ?? "[]"
    );

    /* ---------- VALIDATE STOCK ---------- */

    for (const item of current.items) {
      const stockItem =
        stock.find(
          (s: any) =>
            s.itemName ===
            item.itemName
        );

      const available =
        Number(
          stockItem?.currentStock ||
            0
        );

      const required =
        Number(item.qty || 0);

      if (
        required > available
      ) {
        toast.error(
          `Insufficient stock for ${item.itemName}`
        );
        return;
      }
    }

    /* ---------- SAVE DISPATCH ---------- */

    const next = [
      ...entries,
      current,
    ];

    saveDispatch(next);

    setEntries(next);

    /* ---------- UPDATE STOCK ---------- */

    current.items.forEach(
      (item) => {
        const stockItem =
          stock.find(
            (s: any) =>
              s.itemName ===
              item.itemName
          );

        if (stockItem) {
          stockItem.currentStock =
            Number(
              stockItem.currentStock ||
                0
            ) -
            Number(
              item.qty || 0
            );
        }
      }
    );

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

    current.items.forEach(
      (item) => {
        const stockItem =
          stock.find(
            (s: any) =>
              s.itemName ===
              item.itemName
          );

        ledger.push({
          id: crypto.randomUUID(),
          date: current.date,
          itemCode:
            stockItem?.itemCode ||
            "",
          itemName:
            item.itemName,
          transactionType:
            "DISPATCH",

          /* NEGATIVE QTY */

          qty: -Number(
            item.qty
          ),

          balanceAfter:
            stockItem?.currentStock ||
            0,

          referenceNo:
            current.dispatchNo,

          remarks:
            "Material Dispatched",
        });
      }
    );

    localStorage.setItem(
      "factory_stock_ledger",
      JSON.stringify(ledger)
    );

    toast.success(
      "Dispatch saved successfully"
    );
  };

  const generateChallan =
    () => {
      const challanWindow =
        window.open(
          "",
          "_blank"
        );

      if (!challanWindow)
        return;

      challanWindow.document.write(`
      <html>

        <head>

          <title>
            Delivery Challan
          </title>

          <style>

            body {
              font-family: Arial;
              padding: 20px;
            }

            h2 {
              text-align: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }

          </style>

        </head>

        <body>

          <h2>
            DELIVERY CHALLAN
          </h2>

          <p>
            <strong>
              Dispatch No:
            </strong>
            ${
              current.dispatchNo
            }
          </p>

          <p>
            <strong>
              Date:
            </strong>
            ${current.date}
          </p>

          <p>
            <strong>
              Customer:
            </strong>
            ${
              current.customerName
            }
          </p>

          <p>
            <strong>
              Vehicle No:
            </strong>
            ${
              current.vehicleNo
            }
          </p>

          <p>
            <strong>
              Driver Name:
            </strong>
            ${
              current.driverName
            }
          </p>

          <p>
            <strong>
              Invoice No:
            </strong>
            ${
              current.invoiceNo
            }
          </p>

          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Unit
                </th>

              </tr>

            </thead>

            <tbody>

              ${current.items
                .map(
                  (
                    item
                  ) => `
                    <tr>

                      <td>
                        ${item.itemName}
                      </td>

                      <td>
                        ${item.qty}
                      </td>

                      <td>
                        ${item.unit}
                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

          <br />

          <p>
            <strong>
              Remarks:
            </strong>
            ${
              current.remarks
            }
          </p>

        </body>

      </html>
    `);

      challanWindow.document.close();

      challanWindow.print();
    };

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-w-6xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-white text-sm font-normal">
            Dispatch Entry
          </DialogTitle>

        </DialogHeader>

        <div className="p-4 flex flex-col gap-4">

          {/* Header */}

          <div className="grid grid-cols-3 gap-4">

            <div>

              <label className="text-xs">
                Dispatch No
              </label>

              <Input
                value={
                  current.dispatchNo
                }
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
                Invoice No
              </label>

              <Input
                value={
                  current.invoiceNo
                }
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    invoiceNo:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div className="grid grid-cols-3 gap-4">

            <div>

              <label className="text-xs">
                Customer Name
              </label>

              <Input
                value={
                  current.customerName
                }
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    customerName:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="text-xs">
                Vehicle No
              </label>

              <Input
                value={
                  current.vehicleNo
                }
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    vehicleNo:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="text-xs">
                Driver Name
              </label>

              <Input
                value={
                  current.driverName
                }
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    driverName:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          {/* Items */}

          <div className="border bg-white overflow-auto">

            <table className="w-full text-xs">

              <thead className="bg-muted">

                <tr>

                  <th className="p-2 text-left">
                    Product
                  </th>

                  <th className="p-2 text-left">
                    Qty
                  </th>

                  <th className="p-2 text-left">
                    Unit
                  </th>

                </tr>

              </thead>

              <tbody>

                {current.items.map(
                  (
                    it,
                    i
                  ) => (

                    <tr
                      key={i}
                      className="border-t"
                    >

                      <td className="p-1">

                        <Input
                          value={
                            it.itemName
                          }
                          onChange={(
                            e
                          ) =>
                            updateItem(
                              i,
                              {
                                itemName:
                                  e
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                      </td>

                      <td className="p-1">

                        <Input
                          value={it.qty}
                          onChange={(
                            e
                          ) =>
                            updateItem(
                              i,
                              {
                                qty:
                                  e
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                      </td>

                      <td className="p-1">

                        <Input
                          value={
                            it.unit
                          }
                          onChange={(
                            e
                          ) =>
                            updateItem(
                              i,
                              {
                                unit:
                                  e
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          <Button
            variant="outline"
            onClick={addRow}
            className="w-fit"
          >
            Add Item
          </Button>

          {/* Remarks */}

          <div>

            <label className="text-xs">
              Remarks
            </label>

            <textarea
              value={
                current.remarks
              }
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

          {/* Existing */}

          <div className="border bg-white overflow-auto">

            <table className="w-full text-xs">

              <thead className="bg-muted">

                <tr>

                  <th className="p-2 text-left">
                    Dispatch No
                  </th>

                  <th className="p-2 text-left">
                    Customer
                  </th>

                  <th className="p-2 text-left">
                    Invoice
                  </th>

                  <th className="p-2 text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {entries.map(
                  (e) => (

                    <tr
                      key={
                        e.dispatchNo
                      }
                      className="border-t"
                    >

                      <td className="p-2">
                        {
                          e.dispatchNo
                        }
                      </td>

                      <td className="p-2">
                        {
                          e.customerName
                        }
                      </td>

                      <td className="p-2">
                        {
                          e.invoiceNo
                        }
                      </td>

                      <td className="p-2">
                        {e.date}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-2 border-t pt-4">

            <Button
              variant="outline"
              onClick={
                generateChallan
              }
            >
              Delivery Challan
            </Button>

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