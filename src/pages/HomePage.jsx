import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavbarComponents";
import { fetchInventory, updateInventory } from "../slice/invetorySlice";

export default function HomePage() {
  const { role } = useSelector((state) => state.auth);
  const { inventory } = useSelector((state) => state.inventory);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isME = role === "me";
  const isAdmin = role === "admin";
  const isDist = role === "distributor";
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    status: "",
    size: "",
    remarks: ""
  });

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setForm({
      status: item.status,
      size: item.size,
      remarks: item.remarks || ""
    });
    setOpenModal(true);
  };

  const handleUpdate = async () => {
    await dispatch(
      updateInventory({
        id: selectedItem._id,
        ...form
      })
    );
    setOpenModal(false);
    dispatch(fetchInventory());
  };

  const sizeOrder = {
    "50gm": 1,
    "55gm": 2,
    "25gm": 3,
    "28gm": 4
  };

  const outOfStock = inventory?.filter(
    (item) => item.status === "Out of Stock"
  );

  const runningLow = inventory?.filter(
    (item) => item.status === "Running Low"
  );

  const inStockSorted = inventory
    ?.filter((item) => item.status === "In Stock")
    .sort(
      (a, b) =>
        (sizeOrder[a.size] || 99) - (sizeOrder[b.size] || 99)
    );

  const sortedInventory = [
    ...outOfStock,
    ...runningLow,
    ...inStockSorted
  ];
  const filteredInventory = sortedInventory?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-end md:justify-center mb-8">
        <Navbar />
      </div>

      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-center text-amber-700 mb-6">
          Welcome to Dumyum Chocolates
        </h1>

        {!isDist && (
          <div className="flex justify-center mt-10 mb-6 space-x-4">
            <button
              onClick={() => navigate("/shops_list")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold py-2 px-6 rounded-lg shadow-md transition min-w-[150px]"
            >
              Place Orders
            </button>

            <button
              onClick={() => navigate("/SR-report")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold py-2 px-6 rounded-lg shadow-md transition min-w-[150px]"
            >
              Performance Report
            </button>
          </div>
        )}

        {/* Inventory Section */}

        <h2 className="text-2xl font-bold mt-7 mb-4 text-center text-amber-700">Inventory Updates</h2>

        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-600"
        />

        <div className="space-y-3">
          {filteredInventory?.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center border px-3 py-2 rounded text-md"
            >
              <div className="leading-tight">
                <p
                  className={`font-semibold ${item.status === "Out of Stock"
                    ? "text-red-600"
                    : item.status === "Running Low"
                      ? "text-yellow-600"
                      : "text-green-800"
                    }`}
                >
                  {item.name}
                </p>

                <p className="text-sm text-gray-600">
                  {item.size} • {item.status}
                </p>

                {item.remarks && (
                  <p className="text-md text-gray-600">
                    Remarks: {item.remarks}
                  </p>
                )}
              </div>

              {isAdmin && <button
                onClick={() => openUpdateModal(item)}
                className="bg-amber-600 text-white text-sm px-3 py-1 rounded hover:bg-amber-700 whitespace-nowrap"
              >
                Update
              </button>}
            </div>
          ))}
        </div>

      </div>

      {/* Update Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Inventory</h3>

            <select
              className="w-full border p-2 mb-3"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="">Select Status</option>
              <option>In Stock</option>
              <option>Running Low</option>
              <option>Out of Stock</option>
            </select>

            <select
              className="w-full border p-2 mb-3"
              value={form.size}
              onChange={(e) =>
                setForm({ ...form, size: e.target.value })
              }
            >
              <option value="">Select Size</option>
              <option>25gm</option>
              <option>28gm</option>
              <option>50gm</option>
              <option>55gm</option>
            </select>

            <input
              type="text"
              placeholder="Remarks"
              className="w-full border p-2 mb-4"
              value={form.remarks}
              onChange={(e) =>
                setForm({ ...form, remarks: e.target.value })
              }
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-amber-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}