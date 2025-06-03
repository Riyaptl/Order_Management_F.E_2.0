import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetOrderState } from "../slice/orderSlice";
import { getSRDetails } from "../slice/userSlice";
import toast from "react-hot-toast";

const productFields = [
  "Cranberry 50g", "Dryfruits 50g", "Peanuts 50g", "Mix seeds 50g",
  "Classic Coffee 50g", "Dark Coffee 50g", "Intense Coffee 50g", "Toxic Coffee 50g",
  "Cranberry 25g", "Dryfruits 25g", "Peanuts 25g", "Mix seeds 25g",
  "Orange 25g", "Mint 25g", "Classic Coffee 25g", "Dark Coffee 25g",
  "Intense Coffee 25g", "Toxic Coffee 25g",
];

export default function OrderComponent({ shopId, onClose }) {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.order);
  const {role} = useSelector((state) => state.auth)
  const { srs } = useSelector((state) => state.user)
  const choseArea = useSelector((state) => state.area.choseArea);
  const [selectedSR, setSelectedSR] = useState("");
  const [location, setLocation] = useState(null);


  useEffect(() => {
    if (role == "admin")
        dispatch(getSRDetails())
  }, [role])
  

  const [formData, setFormData] = useState(
    productFields.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {})
  );
  const [noOrder, setNoOrder] = useState(false);

  const handleChange = (e, field) => {
    const value = e.target.value.trim();
    if (value === "" || /^\d+$/.test(value)) {
        setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  let filteredProducts = {};

  if (window.confirm("Are you sure you want to place an order?") && !noOrder) {
    filteredProducts = Object.entries(formData)
      .filter(([_, value]) => value !== "" && /^\d+$/.test(value) && value != 0)
      .reduce((acc, [key, value]) => {
        acc[key] = parseInt(value);
        return acc;
      }, {});

    // Optionally: Show a toast if no products are selected and not a 'No Order'
    if (Object.keys(filteredProducts).length === 0) {
      toast.error("Please enter at least one product or mark as No Order");
      return;
    }
  }
  const orderPayload = {
    shopId,
    areaId: choseArea,
    products: filteredProducts,
    placedBy: selectedSR,
    ...(location && { location })
  };


  dispatch(createOrder(orderPayload))
    .unwrap()
    .then(() => {
      toast.success(noOrder ? "Marked as No Order" : "Order placed successfully");
      dispatch(resetOrderState());
      onClose();
    })
    .catch((err) => {
      toast.error(err || "Order failed");
    });
};

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          checked={noOrder}
          onChange={() => {
            const updatedNoOrder = !noOrder;
            setNoOrder(updatedNoOrder);

            if (updatedNoOrder && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  });
                  toast.success("Live location captured");
                },
                (error) => {
                  console.error(error);
                  toast.error("Failed to get location. Please enable GPS.");
                },
                {
                  enableHighAccuracy: true, // <--- KEY to get GPS-level data
                  timeout: 10000,
                  maximumAge: 0,
                }
              );
            } else {
              setLocation(null); // Reset if unchecked
            }
          }}
          className="w-4 h-4"
        />
        No Order
      </label>
      {noOrder && location && (
        <p className="text-green-600 text-sm">📍 Location captured</p>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productFields.map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">{field}</label>
            <input
              type="number"
              min="0"
              value={formData[field]}
              onChange={(e) => handleChange(e, field)}
              onWheel={(e) => e.target.blur()}
              disabled={noOrder}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {role === "admin" && (
        <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">
              Select SR <span className="text-red-500">*</span>
            </label>
            <select
            value={selectedSR}
            onChange={(e) => setSelectedSR(e.target.value)}
            required={role === "admin"} 
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
            <option value="">-- Select SR --</option>
            {srs.map((sr) => (
                <option key={sr._id} value={sr.username}>
                {sr.username}
                </option>
            ))}
            </select>
        </div>
        )}

    
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-700"
        disabled={loading}
      >
        {noOrder ? "Confirm No Order" : loading ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}
