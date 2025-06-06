import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders, deleteOrder, exportOrdersCsv, getOrdersSR } from "../slice/orderSlice"; // You'll create these in orderSlice.js
import toast from "react-hot-toast";
import Navbar from "../components/NavbarComponents";
import { fetchAreas } from "../slice/areaSlice";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../slice/authSlice";
import { getSRDetails } from "../slice/userSlice";

export default function OrdersListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { areas } = useSelector((state) => state.area);
    const { user, role } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.order);
    const { srs } = useSelector(state => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCompleteData, setShowCompleteData] = useState(false);
    const [placedOrdersTab, setPlacedOrdersTab] = useState(true);
    const isDistributor = role === "distributor"
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedSR, setSelectedSR] = useState("");

    useEffect(() => {
        if (role !== "admin" && role !== "distributor" && user) {
            setSelectedSR(user)
        }
        if (role === 'admin') {
            dispatch(getSRDetails());
        }
    }, [role, user, dispatch])
        
    useEffect(() => {
        const data = {}
        if (isDistributor) {
            data["dist_username"] = user
        }
        dispatch(fetchAreas(data));
    }, [dispatch]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (selectedArea) {
                    const res = await dispatch(getOrders({
                        areaId: selectedArea,
                        page: currentPage,
                        completeData: showCompleteData,
                        placedOrders: placedOrdersTab
                    })).unwrap();
                    setTotalPages(res.totalPages);
                }
                if (selectedSR) {
                    const res = await dispatch(getOrdersSR({
                        username: selectedSR,
                        page: currentPage,
                        completeData: showCompleteData,
                        placedOrders: placedOrdersTab
                    })).unwrap();
                    setTotalPages(res.totalPages);
                }
            } catch (err) {
                toast.error("Failed to fetch routes");
            }
        };
        fetchOrders();
    }, [dispatch, currentPage, selectedArea, selectedSR, showCompleteData, placedOrdersTab]);


    const handleRefresh = async () => {
        if (selectedArea) {
            try {
                const res = await dispatch(
                    getOrders({
                        areaId: selectedArea,
                        page: currentPage,
                        completeData: showCompleteData,
                        placedOrders: placedOrdersTab
                    })
                ).unwrap();
                setTotalPages(res.totalPages);
                toast.success("Orders refreshed");
            } catch (err) {
                toast.error("Failed to refresh orders");
            }
        }
    };

    const handleDelete = (orderId) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            dispatch(deleteOrder(orderId))
                .unwrap()
                .then(() => {
                    toast.success("Order deleted successfully")
                })
                .catch(() => toast.error("Failed to delete order"));
        }
    };

    const handleExportCsv = async () => {
        if (!selectedArea) {
            toast.error("Please select route first");
            return;
        }

        try {
            const blob = await dispatch(exportOrdersCsv({
                areaId: selectedArea,
                completeData: showCompleteData,
                placedOrders: placedOrdersTab,
            })).unwrap();

            // Create a link to download the CSV file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Filename with current date for uniqueness
            const dateStr = new Date().toISOString().slice(0, 10);
            link.download = `orders_export_${dateStr}.csv`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("CSV Export successful");
        } catch (error) {
            toast.error("Failed to export CSV");
        }
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

    const handleLogout = async () => {
        try {
            const logoutLoc = await getCurrentLocation();
            dispatch(logout({ username: user, logoutLoc }));
            navigate("/login");
        } catch (error) {
            toast.error("Failed to fetch routes");
        }
    };


    const productsList = [
        "Cranberry 50g", "Dryfruits 50g", "Peanuts 50g", "Mix seeds 50g",
        "Classic Coffee 50g", "Dark Coffee 50g", "Intense Coffee 50g", "Toxic Coffee 50g",
        "Cranberry 25g", "Dryfruits 25g", "Peanuts 25g", "Mix seeds 25g",
        "Orange 25g", "Mint 25g", "Classic Coffee 25g", "Dark Coffee 25g",
        "Intense Coffee 25g", "Toxic Coffee 25g"
    ];

    const totalList = [
        "Regular 50g", "Coffee 50g", "Regular 25g", "Coffee 25g"
    ];


    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });

    return (
        <div className="p-4">
            <div className="flex justify-center mb-8">
                <Navbar />
            </div>
            <div className="flex items-center justify-between px-6 mt-6">
                <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-amber-700">Orders List</h2>
                </div>
            </div>
            <div className="relative w-full">
                {selectedArea && (
                    <div className="absolute right-0 top-0 mt-4">
                        <button
                            onClick={handleExportCsv}
                            className="px-4 py-2 bg-green-600 text-white text-md rounded hover:bg-green-700 transition"
                        >
                            CSV Export
                        </button>
                    </div>
                )}
            </div>

            {!isDistributor && (<div className="flex justify-center mb-6 mt-6 space-x-4">
                <button
                    onClick={() => setPlacedOrdersTab(true)}
                    className={`px-4 py-2 rounded-t-md font-medium text-md ${placedOrdersTab ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Order Placed
                </button>
                <button
                    onClick={() => setPlacedOrdersTab(false)}
                    className={`px-4 py-2 rounded-t-md font-medium text-md ${!placedOrdersTab ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    No Orders
                </button>
            </div>)}

            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 mt-4 mb-4">
                {/* Area Selector */}
                {role !== "sr" && (<div className="mr-12">
                    <label className="block text-lg font-medium text-amber-700 mb-2">
                        Select Route
                    </label>
                    <select
                        value={selectedArea}
                        onChange={(e) => {
                            setSelectedArea(e.target.value)
                            setSelectedSR("")
                        }}
                        className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-md"
                    >
                        <option value="">-- Select Route --</option>
                        {areas.map((area) => (
                            <option key={area._id} value={area._id}>
                                {area.name}
                            </option>
                        ))}
                    </select>
                </div>)}
                
                {/* SR Selector */}
                {role === "admin" && (<div className="mr-12">
                    <label className="block text-lg font-medium text-amber-700 mb-2">
                        Select SR
                    </label>
                    <select
                        value={selectedSR}
                        onChange={(e) => {
                            setSelectedSR(e.target.value)
                            setSelectedArea("")
                        }}
                        className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-md"
                    >
                        <option value="">-- Select SR --</option>
                        {srs.map((sr) => (
                            <option key={sr._id} value={sr.username}>
                                {sr.username}
                            </option>
                        ))}
                    </select>
                </div>)}

                {(selectedArea || selectedSR ) && (
                    <div className="flex flex-col mr-6">
                        <label htmlFor="completeData" className="text-lg font-medium text-amber-700 mb-1">
                            Show {monthName} Month's Data
                        </label>
                        <label htmlFor="completeData" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="completeData"
                                checked={showCompleteData}
                                onChange={() => setShowCompleteData((prev) => !prev)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-600 transition-all duration-300"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                        </label>
                    </div>
                )}

                {(selectedArea || selectedSR ) && role !== "sr" && (
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-amber-600 text-white text-md rounded hover:bg-amber-700 transition ml-8"
                        >
                            Refresh
                        </button>
                    </div>
                )}
            </div>


            {!(selectedArea || selectedSR ) && (
                <p className="text-center text-gray-500">No records to show</p>
            )}
            {(selectedArea || selectedSR ) && loading && <p className="mt-4">Loading orders...</p>}
            {selectedArea && error && (
                <p className="mt-4 text-red-600">Error: {error}</p>
            )}
            {(selectedArea || selectedSR ) && !loading && !error && orders.length === 0 && (
                <p className="text-center text-gray-500">No orders found for this area</p>
            )}

            {(selectedArea || selectedSR ) && !loading && orders.length > 0 && (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left min-w-[200px]">Shop Name</th>
                                <th className="border p-2 text-left min-w-[200px]">Shop Address</th>
                                <th className="border p-2 text-left min-w-[180px]">Contact Number</th>
                                <th className="border p-2 text-left min-w-[200px]">Address Link</th>
                                <th className="border p-2 text-left min-w-[200px]">Payment Terms</th>
                                <th className="border p-2 text-left min-w-[200px]">Order Placed By</th>
                                <th className="border p-2 text-left min-w-[200px]">Remarks</th>
                                <th className="border p-2 text-left min-w-[150px]">SR</th>
                                {placedOrdersTab && (<> {productsList.map((key) => (
                                    <th
                                        key={key}
                                        className="border p-2 text-left min-w-[180px]"
                                    >
                                        {key}
                                    </th>
                                ))}
                                    {totalList.map((key) => (
                                        <th
                                            key={key}
                                            className="border p-2 text-left min-w-[180px]"
                                        >
                                            {key}
                                        </th>
                                    ))} </>)}
                                <th className="border p-2 text-left min-w-[250px]">Created At</th>
                                {!isDistributor && !placedOrdersTab && (
                                    <th className="border p-2 text-left min-w-[250px]">Location Link</th>
                                )}
                                {role === "admin" && <th className="border p-2 text-left min-w-[100px]">Actions</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="border p-2">{order.shopId.name}</td>
                                    <td className="border p-2 max-w-[150px] overflow-x-auto whitespace-nowrap">
                                        <div className="overflow-x-auto max-w-[350px]">
                                            <span
                                                className="inline-block truncate"
                                                title={order.shopId.address}
                                            >
                                                {order.shopId.address}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border p-2">{order.shopId.contactNumber}</td>
                                    <td className="border p-2 break-all">
                                        {order.shopId.addressLink ? (
                                            <a
                                                href={order.shopId.addressLink}
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
                                    <td className="border p-2">{order.paymentTerms}</td>
                                    <td className="border p-2">{order.orderPlacedBy}</td>
                                    <td className="border p-2 max-w-[150px] overflow-x-auto whitespace-nowrap">
                                        <div className="overflow-x-auto max-w-[350px]">
                                            <span
                                                className="inline-block truncate"
                                                title={order.remarks}
                                            >
                                                {order.remarks}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border p-2">{order.placedBy}</td>
                                    {placedOrdersTab && (<> {productsList.map((key) => (
                                        <td key={key} className="border p-2">
                                            {order.products && order.products[key] !== undefined
                                                ? order.products[key]
                                                : "-"}
                                        </td>
                                    ))}
                                        {totalList.map((key) => (
                                            <td key={key} className="border p-2">
                                                {order.total && order.total[key] !== undefined
                                                    ? order.total[key]
                                                    : "-"}
                                            </td>
                                        ))} </>)}
                                    <td className="border p-2">
                                        {(() => {
                                            const date = new Date(order.createdAt);
                                            const day = String(date.getDate()).padStart(2, "0");
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const year = date.getFullYear();
                                            const hours = String(date.getHours()).padStart(2, "0");
                                            const minutes = String(date.getMinutes()).padStart(2, "0");

                                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                                        })()}
                                        </td>
                                    {!isDistributor && !placedOrdersTab && (
                                        <td className="border p-2 max-w-[250px] overflow-x-auto">
                                            {order.location?.latitude && order.location?.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline break-all"
                                                >
                                                    View Location
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                    )}
                                    {role === "admin" && <td className="border p-2">
                                        <button
                                            onClick={() => handleDelete(order._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-md"
                                        >
                                            Delete
                                        </button>
                                    </td>}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(selectedArea || selectedSR ) && (<div className="flex justify-center items-center mt-4 space-x-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    <FaChevronLeft />
                </button>
                <span className="text-md text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    <FaChevronRight />
                </button>
            </div>)}
        </div>
    );
}
