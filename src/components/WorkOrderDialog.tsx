import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Operation {
  operation: string;
  department: string;
  status: "Pending" | "Started" | "Completed";
  remarks: string;
}

interface ProductionPlan {
  planNo: string;
  productName: string;
  targetQty: string;
}

interface BOM {
  bomNo: string;
  productName: string;
}

interface WorkOrder {
  woNo: string;
  date: string;
  productionPlanNo: string;
  bomNo: string;
  productName: string;
  qty: string;
  status: "Created" | "Released" | "In Production" | "Completed";
  createdBy: string;
  operations: Operation[];
  remarks: string;
}

const STORAGE = "factory_work_orders";

function loadWorkOrders(): WorkOrder[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function saveWorkOrders(data: WorkOrder[]) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

function loadProductionPlans(): ProductionPlan[] {
  try {
    return JSON.parse(
      localStorage.getItem("factory_production_plans") ?? "[]"
    );
  } catch {
    return [];
  }
}

function loadBOMs(): BOM[] {
  try {
    return JSON.parse(
      localStorage.getItem("factory_boms") ?? "[]"
    );
  } catch {
    return [];
  }
}

function nextWONo(existing: WorkOrder[]) {

  const max = existing.reduce(
    (m, p) =>
      Math.max(
        m,
        parseInt(p.woNo.replace("WO-", "")) || 0
      ),
    0
  );

  return `WO-${String(max + 1).padStart(4, "0")}`;

}

function todayStr() {

  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

}

function emptyOperation(): Operation {
  return {
    operation: "",
    department: "",
    status: "Pending",
    remarks: "",
  };
}

export function WorkOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [isExisting, setIsExisting] = useState(false);

  const [current, setCurrent] = useState<WorkOrder>({
    woNo: "",
    date: todayStr(),
    productionPlanNo: "",
    bomNo: "",
    productName: "",
    qty: "",
    status: "Created",
    createdBy: "Production Manager",
    operations: [emptyOperation()],
    remarks: "",
  });

  useEffect(() => {

    if (open) {

      const loadedWO = loadWorkOrders();

      setWorkOrders(loadedWO);
      setPlans(loadProductionPlans());
      setBoms(loadBOMs());

      setCurrent({
        woNo: nextWONo(loadedWO),
        date: todayStr(),
        productionPlanNo: "",
        bomNo: "",
        productName: "",
        qty: "",
        status: "Created",
        createdBy: "Production Manager",
        operations: [emptyOperation()],
        remarks: "",
      });

      setIsExisting(false);

    }

  }, [open]);

  const updateOperation = (
    i: number,
    patch: Partial<Operation>
  ) => {

    setCurrent({
      ...current,
      operations: current.operations.map((op, idx) =>
        idx === i ? { ...op, ...patch } : op
      ),
    });

  };

  const addRow = () => {

    setCurrent({
      ...current,
      operations: [
        ...current.operations,
        emptyOperation(),
      ],
    });

  };

  const removeRow = (i: number) => {

    setCurrent({
      ...current,
      operations:
        current.operations.length > 1
          ? current.operations.filter((_, idx) => idx !== i)
          : [emptyOperation()],
    });

  };

  const handlePlanSelect = (planNo: string) => {

    const plan = plans.find(
      (p) => p.planNo === planNo
    );

    if (!plan) return;

    setCurrent({
      ...current,
      productionPlanNo: plan.planNo,
      productName: plan.productName,
      qty: plan.targetQty,
    });

  };

  const handleBOMSelect = (bomNo: string) => {

    const bom = boms.find(
      (b) => b.bomNo === bomNo
    );

    if (!bom) return;

    setCurrent({
      ...current,
      bomNo: bom.bomNo,
      productName: bom.productName,
    });

  };

  const handleSave = () => {

    if (!current.productName.trim()) {
      toast.error("Select product");
      return;
    }

    const next = isExisting
      ? workOrders.map((w) =>
          w.woNo === current.woNo ? current : w
        )
      : [...workOrders, current];

    saveWorkOrders(next);

    setWorkOrders(next);
    setIsExisting(true);

    toast.success("Work order saved");

  };

  const handleRelease = () => {

    const updated: WorkOrder = {
      ...current,
      status: "Released",
    };

    const next = workOrders.map((w) =>
      w.woNo === updated.woNo ? updated : w
    );

    saveWorkOrders(next);

    setWorkOrders(next);
    setCurrent(updated);

    toast.success("Work order released");

  };

  const openExisting = (wo: WorkOrder) => {
    setCurrent(wo);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-sm font-normal text-white">
            Work Order Management
          </DialogTitle>

        </DialogHeader>

        <div className="grid grid-cols-[240px_1fr] min-h-[650px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">

            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              Work Orders
            </h3>

            {workOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No work orders
              </p>
            ) : (
              <ul className="space-y-1">

                {workOrders.map((wo) => (

                  <li key={wo.woNo}>

                    <button
                      onClick={() => openExisting(wo)}
                      className="w-full text-left text-xs px-2 py-2 rounded hover:bg-accent"
                    >

                      <div className="flex justify-between">

                        <span>
                          {wo.woNo}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            wo.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : wo.status === "In Production"
                              ? "bg-blue-100 text-blue-700"
                              : wo.status === "Released"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {wo.status}
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
                Work Order
              </h2>

              <span
                className={`text-xs px-3 py-1 rounded ${
                  current.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : current.status === "In Production"
                    ? "bg-blue-100 text-blue-700"
                    : current.status === "Released"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {current.status}
              </span>

            </div>

            {/* Header */}

            <div className="grid grid-cols-4 gap-4">

              <div>

                <label className="text-xs">
                  Work Order No
                </label>

                <Input
                  value={current.woNo}
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
                      date: e.target.value,
                    })
                  }
                />

              </div>

              <div>

                <label className="text-xs">
                  Production Plan
                </label>

                <select
                  value={current.productionPlanNo}
                  onChange={(e) =>
                    handlePlanSelect(
                      e.target.value
                    )
                  }
                  className="w-full border rounded h-10 px-2 bg-white"
                >

                  <option value="">
                    Select Plan
                  </option>

                  {plans.map((p) => (

                    <option
                      key={p.planNo}
                      value={p.planNo}
                    >
                      {p.planNo}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="text-xs">
                  BOM No
                </label>

                <select
                  value={current.bomNo}
                  onChange={(e) =>
                    handleBOMSelect(
                      e.target.value
                    )
                  }
                  className="w-full border rounded h-10 px-2 bg-white"
                >

                  <option value="">
                    Select BOM
                  </option>

                  {boms.map((b) => (

                    <option
                      key={b.bomNo}
                      value={b.bomNo}
                    >
                      {b.bomNo}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            <div className="grid grid-cols-4 gap-4">

              <div>

                <label className="text-xs">
                  Product Name
                </label>

                <Input
                  value={current.productName}
                  readOnly
                />

              </div>

              <div>

                <label className="text-xs">
                  Qty
                </label>

                <Input
                  value={current.qty}
                  readOnly
                />

              </div>

              <div>

                <label className="text-xs">
                  Created By
                </label>

                <Input
                  value={current.createdBy}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      createdBy: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            {/* Operations */}

            <div className="border bg-white overflow-auto">

              <table className="w-full text-xs">

                <thead className="bg-muted">

                  <tr>

                    <th className="p-2 text-left">
                      Operation
                    </th>

                    <th className="p-2 text-left">
                      Department
                    </th>

                    <th className="p-2 text-left">
                      Status
                    </th>

                    <th className="p-2 text-left">
                      Remarks
                    </th>

                    <th />

                  </tr>

                </thead>

                <tbody>

                  {current.operations.map((op, i) => (

                    <tr key={i} className="border-t">

                      <td className="p-1">

                        <Input
                          value={op.operation}
                          onChange={(e) =>
                            updateOperation(i, {
                              operation:
                                e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-1">

                        <Input
                          value={op.department}
                          onChange={(e) =>
                            updateOperation(i, {
                              department:
                                e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-1">

                        <select
                          value={op.status}
                          onChange={(e) =>
                            updateOperation(i, {
                              status:
                                e.target
                                  .value as any,
                            })
                          }
                          className="w-full border rounded h-8 px-2 bg-white"
                        >

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Started">
                            Started
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                        </select>

                      </td>

                      <td className="p-1">

                        <Input
                          value={op.remarks}
                          onChange={(e) =>
                            updateOperation(i, {
                              remarks:
                                e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="text-center">

                        <button
                          onClick={() =>
                            removeRow(i)
                          }
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
                Add Operation
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

              {isExisting &&
                current.status === "Created" && (
                  <Button
                    onClick={handleRelease}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Release WO
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