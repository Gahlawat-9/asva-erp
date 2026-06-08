import axios from "axios";
import { useEffect, useState } from "react";

interface PRItem {
  itemCode: string;
  itemName: string;
  quantity: string;
  unit: string;
  rate: string;
}

interface PR {
  _id: string;
  prNo: string;
  dept: string;
  status: string;
  items: PRItem[];
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [selectedPR, setSelectedPR] =
    useState<PR | null>(null);

  const [vendor, setVendor] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (open) {
      loadApprovedPRs();
    }
  }, [open]);

  const loadApprovedPRs = async () => {
    try {
      const res = await axios.get(
        "https://asva-erp.onrender.com/api/pr/approved"
      );

      setPrs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const savePO = async () => {
    if (!selectedPR) return;

    if (!vendor.trim()) {
      alert("Enter Vendor Name");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        "https://asva-erp.onrender.com/api/po",
        {
          poNo: "PO" + Date.now(),

          prId: selectedPR._id,

          vendor,

          items: selectedPR.items,

          createdBy: "admin",
        }
      );

      alert("Purchase Order Created");

      setVendor("");
      setSelectedPR(null);

    } catch (err) {
      console.error(err);
      alert("Failed to create PO");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-auto">

        <h2 className="text-2xl font-bold mb-4">
          Purchase Order Entry
        </h2>

        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">PR No</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {prs.map((pr) => (
              <tr
                key={pr._id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  setSelectedPR(pr)
                }
              >
                <td className="border p-2">
                  {pr.prNo}
                </td>

                <td className="border p-2">
                  {pr.dept}
                </td>

                <td className="border p-2">
                  {pr.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedPR && (
          <div className="border rounded p-4">

            <h3 className="text-lg font-bold mb-3">
              Selected PR :
              {" "}
              {selectedPR.prNo}
            </h3>

            <input
              className="border p-2 w-full mb-4"
              placeholder="Vendor Name"
              value={vendor}
              onChange={(e) =>
                setVendor(
                  e.target.value
                )
              }
            />

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">
                    Item
                  </th>

                  <th className="border p-2">
                    Qty
                  </th>

                  <th className="border p-2">
                    Unit
                  </th>
                </tr>
              </thead>

              <tbody>
                {selectedPR.items.map(
                  (item, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        {item.itemName}
                      </td>

                      <td className="border p-2">
                        {item.quantity}
                      </td>

                      <td className="border p-2">
                        {item.unit}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <button
              onClick={savePO}
              disabled={saving}
              className="mt-4 border px-4 py-2"
            >
              {saving
                ? "Saving..."
                : "Create Purchase Order"}
            </button>

          </div>
        )}

        <button
          className="mt-6 border px-4 py-2"
          onClick={() =>
            onOpenChange(false)
          }
        >
          Close
        </button>

      </div>
    </div>
  );
}