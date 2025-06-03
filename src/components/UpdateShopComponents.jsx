import React, { useState, useEffect } from "react";

const UpdateShopComponents = ({ isOpen, onClose, onUpdate, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    addressLink: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onUpdate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Update Shop Details</h2>

        {["name", "address", "addressLink"].map((field) => (
          <input
            key={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={`Enter ${field}`}
            className="w-full border rounded px-3 py-2 mb-3"
          />
        ))}
        
          <input
            name="contactNumber"
            type="text"
            value={formData.contactNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                handleChange(e);
              }
            }}
            maxLength={10}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Contact Number"
          />
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-500 transition"
          >
            Update
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateShopComponents;
