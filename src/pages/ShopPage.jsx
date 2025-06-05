import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops, getShopDetails } from "../slice/shopSlice";
import { useNavigate } from "react-router-dom";
import OrderComponent from "../components/OrderComponents";
import Navbar from "../components/NavbarComponents";

export default function ShopPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role } = useSelector((state) => state.auth);
  const { shops, loading, error } = useSelector((state) => state.shop);
  const choseArea = useSelector((state) => state.area.choseArea);
  const { shopDetails, shopDetailsLoading } = useSelector((state) => state.shop);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    if (!choseArea) {
      navigate("/"); // Redirect to home if no area is selected
    } else {
      dispatch(fetchShops(choseArea));
    }
  }, [dispatch, choseArea, navigate]);

  useEffect(() => {
    if (selectedShop) {
      dispatch(getShopDetails(selectedShop._id));
    }
  }, [selectedShop, dispatch]);

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow relative">
      {/* {role === "admin" && ( */}
      <div className="flex justify-center mb-8">
        <Navbar />
      </div>
      {/* )} */}

      {/* <button
        onClick={() => navigate("/")}
        className="text-l font-bold text-amber-700 px-4 py-2 rounded hover:bg-amber-100"
      >
        ← Back
      </button> */}

      <h1 className="text-2xl font-bold text-amber-700 mb-10 text-center">
        Shops in Your Route
      </h1>


      <input
        type="text"
        placeholder="Search shop name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />

      {loading ? (
        <p>Loading shops...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border border-gray-300">
            <thead>
              <tr className="bg-amber-100">
                <th className="w-1/2 p-3 text-left">Shop Name</th>
                <th className="w-1/2 p-3 text-left">Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr
                  key={shop._id}
                  className="border-t hover:bg-amber-50 cursor-pointer"
                  onClick={() => setSelectedShop(shop)}
                >
                  <td className="p-3">{shop.name}</td>
                  <td className="p-3">{shop.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          {/* Modal Content Wrapper */}
          <div className="relative bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            {/* Close Button in Top-Right */}
            <button
              onClick={() => setSelectedShop(null)}
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl"
              aria-label="Close Modal"
            >
              &times;
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-2 text-amber-700">{selectedShop.name}</h2>
            <p className="mb-2 text-gray-700">
              Contact Number: {shopDetailsLoading ? "Loading..." : shopDetails?.contactNumber || "N/A"}
            </p>
            <p className="mb-4 text-gray-700">

              Address Link: {shopDetailsLoading ? "Loading..." : shopDetails?.addressLink ? (
                <a
                  href={shopDetails.addressLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Location
                </a>
              ) : (
                "-"
              )
              || "N/A"}
            </p>

            <OrderComponent shopId={selectedShop._id} onClose={() => setSelectedShop(null)} />
          </div>
        </div>
      )}

    </div>
  );
}
