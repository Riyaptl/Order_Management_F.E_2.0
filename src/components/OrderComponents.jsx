import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetOrderState } from "../slice/orderSlice";
import { getSRDetails } from "../slice/userSlice";
import toast from "react-hot-toast";
import { updateShop } from "../slice/shopSlice";

const productFields = [
  "Cranberry 50g", "Dryfruits 50g", "Peanuts 50g", "Mix seeds 50g",
  "Classic Coffee 50g", "Dark Coffee 50g", "Intense Coffee 50g", "Toxic Coffee 50g",
  "Cranberry 25g", "Dryfruits 25g", "Peanuts 25g", "Mix seeds 25g",
  "Orange 25g", "Mint 25g", "Classic Coffee 25g", "Dark Coffee 25g",
  "Intense Coffee 25g", "Toxic Coffee 25g", "Gift box"
];

export default function OrderComponent({ shopId, onClose, selectedArea, shopLink }) {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.order);
  const { role } = useSelector((state) => state.auth)
  const { srs } = useSelector((state) => state.user)
  const [selectedSR, setSelectedSR] = useState("");
  const [location, setLocation] = useState(null);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [remarks, setRemarks] = useState("");
  const [orderPlacedBy, setOrderPlacedBy] = useState("");
  const [type, setType] = useState("order");
  const [noOrder, setNoOrder] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isSR = role === "sr"
  const isAdmin = role === "admin"
  const isTL = role === 'tl';
  const isDistributor = role === "distributor"

  useEffect(() => {
    if (isAdmin)
      dispatch(getSRDetails())
  }, [role])


  const [formData, setFormData] = useState(
    productFields.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {})
  );

  const handleChange = (e, field) => {
    const value = e.target.value.trim();
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleDateChange = (e) => {
    const pickedDate = new Date(e.target.value);
    pickedDate.setHours(11, 0, 0, 0); 
    setSelectedDate(pickedDate);
  };

  const handleSubmit = async (e) => {
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
      if (isSR && Object.keys(filteredProducts).length === 0) {
        toast.error("Please enter at least one product or mark as No Order");
        return;
      }
      if (Object.keys(filteredProducts).length === 0) {
        toast.error("Please enter at least one product");
        return;
      }
    }    

    // add address in shop addressLink
    if (isSR && !shopLink) {
      let addressLink
      if (!noOrder){
        const location = await getCurrentLocation();
        const { latitude, longitude } = location;
        addressLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      }else {
        const { latitude, longitude } = location;
        addressLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      }
      dispatch(updateShop({
        id: shopId,
        updates: { addressLink }
      })).unwrap()
        .then()
        .catch((err) => {
          toast.error(err.message || "Order failed");
        });
    }

    if (isSR && noOrder && !location){
      toast.error('Capture location first')
      return
    }

    const date = new Date(selectedDate)
    
    const orderPayload = {
      shopId,
      areaId: selectedArea,
      products: filteredProducts,
      placedBy: selectedSR,
      remarks,
      paymentTerms,
      orderPlacedBy,
      type,
      date,
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
        toast.error(err.message || "Order failed");
      });
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error(error);
          reject("Failed to get location. Please enable GPS.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {(isSR || isTL) && (<><label className="flex items-center gap-2 text-lg font-medium text-gray-800">
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
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
                }
              );
            } else {
              setLocation(null);
            }
          }}
          className="w-4 h-4"
        />
        No Order
      </label>
      {noOrder && location && (
        <p className="text-green-600 text-sm">📍 Location captured</p>
      )}
      </>)}


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productFields.map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-md text-gray-700 mb-1">{field}</label>
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

      {isAdmin && (
        <div className="flex flex-col">
          <label className="text-md text-gray-700 mb-1">
            Select SR <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSR}
            onChange={(e) => setSelectedSR(e.target.value)}
            required={role === "admin"}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-md"
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

      <div className="mb-4">
        <label className="block text-md font-medium text-gray-700 mb-1">
          Payment Terms <span className="text-red-500">*</span>
        </label>
        <select
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value.toLowerCase())}
          className="w-full border border-gray-300 rounded px-3 py-2 text-md"
          disabled={noOrder || type==='replacement' || type==='return'}
          required
        >
          <option value="">Select Payment Terms</option>
          <option value="cash">Cash</option>
          <option value="company credit">Company Credit</option>
          <option value="sr credit">SR Credit</option>
          <option value="distributor credit">Distributor Credit</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-md font-medium text-gray-700 mb-1">
          Order Placed By <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={orderPlacedBy}
          onChange={(e) => setOrderPlacedBy(e.target.value)}
          placeholder="Order Placed By"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          disabled={noOrder}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-md font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Optional remarks..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-md font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value.toLowerCase())}
          className="w-full border border-gray-300 rounded px-3 py-2 text-md"
          disabled={noOrder}
          required
        >
          {/* <option value="">Select Type</option> */}
          <option value="order">Order</option>
          <option value="replacement">Replacement</option>
          <option value="return">Return</option>
        </select>
      </div>

      {isAdmin && (
        <div className="mb-4">
          <label className="block text-md font-medium text-gray-700 mb-1">
           Date
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="border px-2 py-1 rounded"
          />
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
