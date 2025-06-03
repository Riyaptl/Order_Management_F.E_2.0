import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreas } from "../slice/areaSlice"; 
import { fetchShops, deleteShop, updateShop, createShop, exportCSVShop, shiftShop } from "../slice/shopSlice"; 
import Navbar from "../components/NavbarComponents";
import toast from "react-hot-toast";
import { FaTrash, FaEdit, FaExchangeAlt } from "react-icons/fa"; 
import UpdateShopComponents from "../components/UpdateShopComponents"
import CreateShopComponents from "../components/CreateShopComponents"
import ShiftAreaComponent from "../components/ShiftAreaComponents";

const ShopsListPage = () => {
    const dispatch = useDispatch();

    const { areas } = useSelector((state) => state.area);
    const { shops, loading, error } = useSelector((state) => state.shop);
    const { role } = useSelector((state) => state.auth);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedArea, setSelectedArea] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedShopData, setSelectedShopData] = useState(null);

    useEffect(() => {
        dispatch(fetchAreas({}));
    }, [dispatch]);

    useEffect(() => {
        if (selectedArea) {
            dispatch(fetchShops(selectedArea)).unwrap();
        }
    }, [dispatch, selectedArea]);


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this shop?")) {
            try {
                const res = await dispatch(deleteShop({ id, areaId: selectedArea })).unwrap();
                toast.success(res.message)
            } catch (err) {
                toast.error(err || "Could not delete shop")
            }
        }
    };

    const handleUpdate = async (updatedData) => {
        const { name, address, contactNumber, addressLink } = updatedData;

        if (!name.trim()) {
            toast.error("Shop name cannot be empty");
            return;
        }

        try {
            const res = await dispatch(updateShop({
                id: selectedShopData._id,
                updates: { name, address, contactNumber, addressLink }
            })).unwrap();

            toast.success(res.message || "Shop updated successfully");
            setShowUpdateModal(false);
        } catch (err) {
            toast.error(err || "Could not update shop");
        }
    };

    const handleShift = ({ shopId, fromAreaId, toAreaId }) => {
        dispatch(shiftShop({ id:shopId, prevAreaId: fromAreaId, newAreaId: toAreaId }))
            .unwrap()
            .then(() => {
            toast.success("Shop shifted successfully");
            setShowShiftModal(false);
            })
            .catch(() => {
            toast.error("Failed to shift shop");
            });
    };

    const handleCreate = async ({ name, address, contactNumber, addressLink }) => {
        if (!name.trim()) {
            toast.error("Shop name cannot be empty");
            return;
        }

        if (!selectedArea) {
            toast.error("Please select route before creating a shop");
            return;
        }

        try {
            const res = await dispatch(createShop({ name, address, contactNumber, addressLink, areaId: selectedArea })).unwrap();
            toast.success(res.message || "Shop created successfully");
            setShowCreateModal(false);
        } catch (err) {
            toast.error(err || "Could not create shop");
        }
    };

     const handleRefresh = async () => {
        try {
          if (selectedArea) {
            dispatch(fetchShops(selectedArea)).unwrap();
          }
        } catch (err) {
          toast.error("Failed to fetch routes");
        }
      };

      const handleExportCsv = async () => {
        if (!selectedArea) {
            toast.error("Please select route first");
            return;
        }

        try {
            const blob = await dispatch(exportCSVShop({
                areaId: selectedArea,
            })).unwrap();

            // Create a link to download the CSV file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Filename with current date for uniqueness
            const dateStr = new Date().toISOString().slice(0, 10);
            link.download = `Shops_export_${dateStr}.csv`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("CSV Export successful");
        } catch (error) {
            toast.error("Failed to export CSV");
        }
    };

    const filteredShops = shops.filter((shop) => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            {role === "admin" && (
                <div className="flex justify-center mb-8">
                    <Navbar />
                </div>
            )}
            <div className="relative flex items-center justify-center mb-4">
                <h2 className="text-2xl font-semibold text-amber-700 text-center">
                    Shops List
                </h2>
                <button
                    onClick={() => {
                    window.location.href = `/csv-import`;
                    }}
                    className="absolute right-0 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition shadow-lg"
                >
                    CSV Import
                </button>
            </div>
            <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Route
                    </label>
                    <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                    <option value="">-- Select Route --</option>
                    {areas.map((area) => (
                        <option key={area._id} value={area._id}>
                        {area.name}
                        </option>
                    ))}
                    </select>
                </div>
                    {selectedArea && (
                    <div className="flex justify-end mb-4">
                        
                        <div className="mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition ml-8"
                        >
                            Refresh
                        </button>
                        </div>
                        <div className="mt-4 md:mt-0 ml-8">
                            <button
                                onClick={() => {
                                    if (!selectedArea) {
                                        toast.error("Please select route before creating a shop");
                                        return;
                                    }
                                    setShowCreateModal(true)
                                }}
                                className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition text-sm h-fit"
                            >
                                + Create Shop
                            </button>
                        </div>
                        <div className="mt-4 md:mt-0 ml-8">
                            <button
                                onClick={handleExportCsv}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                            >
                                CSV Export
                            </button>
                        </div>
                        
                    </div>)}
                </div>


            {!selectedArea ? (
                <p className="text-center text-gray-500">No records to show</p>
            ) : loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : shops.length === 0 ? (
                <p className="text-center text-gray-500">No shops found for this area</p>
            ) : (
                <>
                    <input
                        type="text"
                        placeholder="Search shop name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <table className="min-w-full border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">Sr. No</th>
                                <th className="border p-2 text-left">Shop Name</th>
                                <th className="border p-2 text-left">Address</th>
                                <th className="border p-2 text-left">Contact Number</th>
                                <th className="border p-2 text-left">Address Link</th>
                                <th className="border p-2 text-left">Created By</th>
                                <th className="border p-2 text-left">Updated By</th>
                                <th className="border p-2 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShops.map((shop, index) => (
                                <tr key={shop._id} className="hover:bg-gray-50">
                                    
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{shop.name}</td>
                                    <td className="border p-2 max-w-[150px] overflow-x-auto whitespace-nowrap">
                                        <div className="overflow-x-auto max-w-[350px]">
                                            <span className="inline-block truncate" title={shop.address}>
                                                {shop.address}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border p-2">{shop.contactNumber}</td>
                                    <td className="border p-2 break-all">
                                        {shop.addressLink ? (
                                            <a
                                            href={shop.addressLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                            >
                                            View Location
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="border p-2">{shop.createdBy}</td>
                                    <td className="border p-2">{shop.updatedBy}</td>
                                    <td className="border p-2 text-center space-x-2">
                                        <button
                                            onClick={() => handleDelete(shop._id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedShopData(shop);
                                                setShowUpdateModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit"
                                            >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => {
                                            setSelectedShopData(shop);
                                            setShowShiftModal(true);
                                            }}
                                            className="text-green-600 hover:text-green-800"
                                            title="Shift Area"
                                        >
                                            <FaExchangeAlt />
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <UpdateShopComponents
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onUpdate={handleUpdate}
                initialData={selectedShopData}
                />
            <ShiftAreaComponent
                isOpen={showShiftModal}
                onClose={() => setShowShiftModal(false)}
                onShift={handleShift}
                shopId={selectedShopData?._id}
                fromAreaId={selectedArea}
                />
            <CreateShopComponents
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                  />
        </div>
    );
};

export default ShopsListPage;
