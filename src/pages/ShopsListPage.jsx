import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreas } from "../slice/areaSlice";
import { fetchShops, deleteShop, updateShop, createShop, exportCSVShop, shiftShop } from "../slice/shopSlice";
import Navbar from "../components/NavbarComponents";
import toast from "react-hot-toast";
import { FaTrash, FaEdit, FaExchangeAlt } from "react-icons/fa";
import UpdateShopComponents from "../components/UpdateShopComponents"
import CreateShopComponents from "../components/CreateShopComponents"
import ShiftAreaComponent from "../components/ShiftAreaComponents";
import OrderComponent from "../components/OrderComponents";

const ShopsListPage = () => {
    const dispatch = useDispatch();

    const { areas, choseArea } = useSelector((state) => state.area);
    const { shops, loading, error } = useSelector((state) => state.shop);
    const { role } = useSelector((state) => state.auth);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedArea, setSelectedArea] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedShopData, setSelectedShopData] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [searchTermArea, setSearchTermArea] = useState("");
    const [showDropdown,  setShowDropdown]   = useState(false);
    const areaDropdownRef = useRef(null);


    useEffect(() => {
        dispatch(fetchAreas({}));
    }, [dispatch]);

    useEffect(() => {
        if (selectedArea) {
            dispatch(fetchShops(selectedArea)).unwrap();
        }
    }, [dispatch, selectedArea]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
            areaDropdownRef.current &&
            !areaDropdownRef.current.contains(event.target)
            ) {
            setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        dispatch(shiftShop({ id: shopId, prevAreaId: fromAreaId, newAreaId: toAreaId }))
            .unwrap()
            .then(() => {
                toast.success("Shop shifted successfully");
                setShowShiftModal(false);
            })
            .catch(() => {
                toast.error("Failed to shift shop");
            });
    };

    const handleCreate = async ({ name, address, contactNumber }) => {
        if (!name.trim()) {
            toast.error("Shop name cannot be empty");
            return;
        }

        if (!selectedArea) {
            toast.error("Please select route before creating a shop");
            return;
        }

        try {
            const loc = await getCurrentLocation();
            const { latitude, longitude } = loc.coords;
            const addressLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const res = await dispatch(createShop({ name, address, addressLink, contactNumber, areaId: selectedArea })).unwrap();
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

    const filteredAreas = areas.filter((a) =>
        a.name.toLowerCase().includes(searchTermArea.toLowerCase())
    );
    
    const handleSelectArea = (area) => {
        setSelectedArea(area._id);      
        setSearchTermArea(area.name);   
        setShowDropdown(false);
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
        <div className="p-4">
            {/* {role === "admin" && ( */}
            <div className="flex justify-center mb-8">
                <Navbar />
            </div>
            {/* )} */}
            <div className="relative flex items-center justify-center mb-4">
                <h2 className="text-2xl font-semibold text-amber-700 text-center">
                    Shops List
                </h2>
            {role == "admin" && (    <button
                    onClick={() => {
                        window.location.href = `/csv-import`;
                    }}
                    className="absolute right-0 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition shadow-lg"
                >
                    CSV Import
                </button>
            )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end flex-wrap gap-4 mb-6">
                    <div  ref={areaDropdownRef} className="w-full md:w-72 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Route <span className="text-red-500">*</span>
                    </label>

                    {/* search box */}
                    <input
                        type="text"
                        value={searchTermArea}
                        onChange={(e) => {
                        setSearchTermArea(e.target.value);
                        setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search area..."
                        className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    {/* dropdown list */}
                    {showDropdown && (
                        <ul className="absolute z-20 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
                        {filteredAreas.length === 0 ? (
                            <li className="p-3 text-gray-500 select-none">No areas found</li>
                        ) : (
                            filteredAreas.map((area) => (
                            <li
                                key={area._id}
                                onClick={() => handleSelectArea(area)}
                                className="p-3 hover:bg-amber-100 cursor-pointer"
                            >
                                {area.name}
                            </li>
                            ))
                        )}
                        </ul>
                    )}
                    </div>

                {selectedArea && (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={handleRefresh}
                            className="w-full md:w-auto px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => {
                                if (!selectedArea) {
                                    toast.error("Please select route before creating a shop");
                                    return;
                                }
                                setShowCreateModal(true);
                            }}
                            className="w-full md:w-auto bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition text-sm"
                        >
                            + Create Shop
                        </button>
                        <button
                            onClick={handleExportCsv}
                            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >
                            CSV Export
                        </button>
                    </div>
                )}
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left min-w-[50px]">Sr. No</th>
                                    <th className="border p-2 text-left min-w-[100px]">Shop Name</th>
                                    <th className="border p-2 text-left min-w-[150px]">Address</th>
                                    <th className="border p-2 text-left min-w-[100px]">Contact Number</th>
                                    <th className="border p-2 text-left min-w-[150px]">Address Link</th>
                                    <th className="border p-2 text-left min-w-[150px]">Created By</th>
                                    <th className="border p-2 text-left min-w-[150px]">Updated By</th>
                                    <th className="border p-2 text-left min-w-[150px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.map((shop, index) => (
                                    <tr key={shop._id} className="hover:bg-gray-50" onClick={(e) => {
                                            if (e.target.closest("td")?.cellIndex === 7) return; 
                                            setSelectedShop(shop);
                                        }}>
                                        <td className="border p-2">{index + 1}</td>
                                        <td className="border p-2">{shop.name}</td>
                                        <td className="border p-2 max-w-[200px] overflow-x-auto">
                                            <span className="block truncate" title={shop.address}>{shop.address}</span>
                                        </td>
                                        <td className="border p-2">{shop.contactNumber}</td>
                                        <td className="border p-2 break-words">
                                            {shop.addressLink ? (
                                                <a
                                                    href={shop.addressLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline break-all"
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
                    </div>
                </>
            )}
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
                
                            <OrderComponent shopId={selectedShop._id} onClose={() => setSelectedShop(null)} />
                          </div>
                        </div>
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
