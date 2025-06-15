// src/components/CreateShopComponents.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";

const CreateShopComponents = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    activity: false
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      activity: e.target.checked
    }));
  };

  const handleCreate = () => {
    const { name, address, contactNumber, activity } = formData;
    if (!name.trim()) return;
    onCreate({ name, address, contactNumber, activity });
    setFormData({ name: "", address: "", contactNumber: "", activity: false});
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      address: "",
      contactNumber: ""
    });
    onClose(); // then close the modal
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Shop</h2>
        
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Shop Name"
        />
        <input
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Shop Address"
        />
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
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.activity}
            onChange={handleCheckboxChange}
            className="w-4 h-4"
          />
          <span className="text-md text-gray-700">Activity</span>
      </label>
        
        <div className="flex justify-center mt-2 gap-4">
          <button
            onClick={handleCreate}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
          >
            Create
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShopComponents;
