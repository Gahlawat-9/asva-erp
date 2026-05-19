import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Operation {
  operation: string;
  department: string;
  plannedHours: string;
  remarks: string;
}

interface ProductionPlan {
  planNo: string;
  date: string;
  productName: string;
  targetQty: string;
  priority: "Low" | "Medium" | "High";
  status: "Planned" | "Approved" | "In Production" | "Completed";
  startDate: string;
  endDate: string;
  createdBy: string;
  operations: Operation[];
  remarks: string;
}

const STORAGE = "factory_production_plans";

function loadPlans(): ProductionPlan[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
  } catch {
    return [];
  }
}

function savePlans(data: ProductionPlan[]) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

function nextPlanNo(existing: ProductionPlan[]) {
  const max = existing.reduce(
    (m, p) => Math.max(m, parseInt(p.planNo.replace("PP-", "")) || 0),
    0
  );

  return `PP-${String(max + 1).padStart(4, "0")}`;
}

function todayStr() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyOperation(): Operation {
  return {
    operation: "",
    department: "",
    plannedHours: "",
    remarks: "",
  };
}

export function ProductionPlanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [isExisting, setIsExisting] = useState(false);

  const [current, setCurrent] = useState<ProductionPlan>({
    planNo: "",
    date: todayStr(),
    productName: "",
    targetQty: "",
    priority: "Medium",
    status: "Planned",
    startDate: todayStr(),
    endDate: todayStr(),
    createdBy: "Production Manager",
    operations: [emptyOperation()],
    remarks: "",
  });

  useEffect(() => {

    if (open) {

      const loaded = loadPlans();

      setPlans(loaded);

      setCurrent({
        planNo: nextPlanNo(loaded),
        date: todayStr(),
        productName: "",
        targetQty: "",
        priority: "Medium",
        status: "Planned",
        startDate: todayStr(),
        endDate: todayStr(),
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

  const handleSave = () => {

    if (!current.productName.trim()) {
      toast.error("Enter product name");
      return;
    }

    if (!current.targetQty.trim()) {
      toast.error("Enter target quantity");
      return;
    }

    const next = isExisting
      ? plans.map((p) =>
          p.planNo === current.planNo ? current : p
        )
      : [...plans, current];

    savePlans(next);

    setPlans(next);
    setIsExisting(true);

    toast.success("Production plan saved");

  };

  const handleApprove = () => {

    const updated: ProductionPlan = {
      ...current,
      status: "Approved",
    };

    const next = plans.map((p) =>
      p.planNo === updated.planNo ? updated : p
    );

    savePlans(next);

    setPlans(next);
    setCurrent(updated);

    toast.success("Production plan approved");

  };

  const openExisting = (plan: ProductionPlan) => {
    setCurrent(plan);
    setIsExisting(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-7xl p-0 gap-0 bg-[oklch(0.96_0.005_230)]">

        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">

          <DialogTitle className="text-sm font-normal text-white">
            Production Planning
          </DialogTitle>

        </DialogHeader>

        <div className="grid grid-cols-[240px_1fr] min-h-[650px]">

          {/* Sidebar */}

          <aside className="border-r bg-white p-3 overflow-y-auto">

            <h3 className="font-semibold text-sm border-b pb-2 mb-2">
              Production Plans
            </h3>

            {plans.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No plans available
              </p>
            ) : (
              <ul className="space-y-1">

                {plans.map((plan) => (

                  <li key={plan.planNo}>

                    <button
                      onClick={() => openExisting(plan)}
                      className="w-full text-left text-xs px-2 py-2 rounded hover:bg-accent"
                    >

                      <div className="flex justify-between">

                        <span>
                          {plan.planNo}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            plan.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : plan.status === "In Production"
                              ? "bg-blue-100 text-blue-700"
                              : plan.status === "Approved"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {plan.status}
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
                Production Plan
              </h2>

              <span
                className={`text-xs px-3 py-1 rounded ${
                  current.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : current.status === "In Production"
                    ? "bg-blue-100 text-blue-700"
                    : current.status === "Approved"
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
                  Plan No
                </label>

                <Input
                  value={current.planNo}
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
                  Target Qty
                </label>

                <Input
                  type="number"
                  value={current.targetQty}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      targetQty: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="grid grid-cols-4 gap-4">

              <div>
                <label className="text-xs">
                  Priority
                </label>

                <select
                  value={current.priority}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full border rounded h-10 px-2 bg-white"
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>
              </div>

              <div>
                <label className="text-xs">
                  Start Date
                </label>

                <Input
                  type="date"
                  value={current.startDate}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs">
                  End Date
                </label>

                <Input
                  type="date"
                  value={current.endDate}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      endDate: e.target.value,
                    })
                  }
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

            {/* Operations Table */}

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
                      Planned Hours
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
                              operation: e.target.value,
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
                              department: e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-1">

                        <Input
                          type="number"
                          value={op.plannedHours}
                          onChange={(e) =>
                            updateOperation(i, {
                              plannedHours: e.target.value,
                            })
                          }
                          className="h-8"
                        />

                      </td>

                      <td className="p-1">

                        <Input
                          value={op.remarks}
                          onChange={(e) =>
                            updateOperation(i, {
                              remarks: e.target.value,
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
                current.status === "Planned" && (
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve Plan
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