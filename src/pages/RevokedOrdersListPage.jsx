import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders, deleteOrder, exportOrdersCsv, getOrdersSR, statusOrder, getOrdersDate, getRevokedOrders, exportRevokedOrdersCsv } from "../slice/orderSlice"; // You'll create these in orderSlice.js
import toast from "react-hot-toast";
import Navbar from "../components/NavbarComponents";
import { fetchAreas } from "../slice/areaSlice";
import { FaChevronLeft, FaChevronRight, FaTrash, FaBan, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../slice/authSlice";
import { getSRDetails } from "../slice/userSlice";
import { blacklistShop } from "../slice/shopSlice";

export default function RevokedOrdersListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.order);
    const { srs } = useSelector(state => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCompleteData, setShowCompleteData] = useState(false);
    const [canceledOrdersTab, setCanceledOrdersTab] = useState(true);
    const [selectedSR, setSelectedSR] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [calls, setCalls] = useState(0);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const isSR = role === 'sr'
    const isDistributor = role === 'distributor'
    const isAdmin = role === 'admin'
    const isTL = role === 'tl';

    useEffect(() => {
        setCurrentPage(1)
    }, [dispatch, canceledOrdersTab])


    useEffect(() => {
        setCalls(orders ? orders.length : 0)
    }, [orders, dispatch])

    useEffect(() => {
        if (isSR && user) {
            setSelectedSR(user)
        }
        if (isAdmin || isTL) {
            dispatch(getSRDetails());
        }
    }, [role, user, dispatch])

    useEffect(() => {
        if (isSR && selectedSR === user) {
            const ordersFunc = async () => {
                await fetchOrders("");
            }
            ordersFunc()
        }
        if (isDistributor) {
            const ordersFunc = async () => {
                await fetchOrders(user);
            }
            ordersFunc()
        }
        if ((isAdmin || isTL)) {
            const ordersFunc = async () => {
                await fetchOrders("");
            }
            ordersFunc()
        }
    }, [dispatch, currentPage, selectedSR, selectedDate, canceledOrdersTab, user]);

    const fetchOrders = async (dist_username) => {  
        try {
            const data = {
                page: currentPage,
                date: selectedDate,
                deleted: !canceledOrdersTab
            }
            if (selectedSR) {
                data.username = selectedSR
                data.completeData = false
            }
            if (dist_username) {
                // data.dist = user
                data.dist_username = user
            }
            const res = await dispatch(getRevokedOrders(data)).unwrap();
            setTotalPages(res.totalPages);
        } catch (err) {
            toast.error(err.message || "Falied to fetch orders");
        }
    };


    const handleRefresh = async () => {
         if (isSR && selectedSR === user) {
            const ordersFunc = async () => {
                await fetchOrders("");
            }
            ordersFunc()
        }
        if (isDistributor) {
            const ordersFunc = async () => {
                await fetchOrders(user);
            }
            ordersFunc()
        }
        if ((isAdmin || isTL)) {
            const ordersFunc = async () => {
                await fetchOrders("");
            }
            ordersFunc()
        }
        
    }

    const handleDelete = (orderId) => {
        try {
            if (window.confirm("Are you sure you want to delete this order?")) {
                const res = dispatch(deleteOrder(orderId)).unwrap()
                toast.success(res.message || "Order deleted successfully")
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete order");
        }
    };

    const handleBlacklist = async (id) => {
        if (window.confirm("Are you sure you want to blacklist this shop?")) {
            try {
                const res = await dispatch(blacklistShop({ id })).unwrap();
                toast.success(res.message)
            } catch (err) {
                toast.error(err.message || "Could not blacklist shop")
            }
        }
    };


    const handleExportCsv = async () => {
        try {
            let data = {
                deleted: !canceledOrdersTab,
                date: selectedDate,
            }
            if (selectedSR){
                data.username = selectedSR
                data.completeData = false
            }
            
            const blob = await dispatch(exportRevokedOrdersCsv(data)).unwrap();

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

    const productsList = [
        "Cranberry 50g", "Dryfruits 50g", "Peanuts 50g", "Mix seeds 50g",
        "Classic Coffee 50g", "Dark Coffee 50g", "Intense Coffee 50g", "Toxic Coffee 50g",
        "Cranberry 25g", "Dryfruits 25g", "Peanuts 25g", "Mix seeds 25g",
        "Orange 25g", "Mint 25g", "Classic Coffee 25g", "Dark Coffee 25g",
        "Intense Coffee 25g", "Toxic Coffee 25g", "Gift box"
    ];

    const totalList = [
        "Regular 50g", "Coffee 50g", "Regular 25g", "Coffee 25g", "Gift box"
    ];


    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });

    return (
        <div className="p-4">
            <div className="flex justify-end md:justify-center mb-8">
                      <Navbar />
                    </div>
            <div className="flex items-center justify-between px-6 mt-6">
                <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-amber-700">Revoked Orders List</h2>
                </div>
            </div>
            <div className="flex justify-center mb-6 mt-6 space-x-4">
                <button
                    onClick={() => setCanceledOrdersTab(true)}
                    className={`px-4 py-2 rounded-t-md font-medium text-md ${canceledOrdersTab ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Canceled Orders
                </button>
                <button
                    onClick={() => setCanceledOrdersTab(false)}
                    className={`px-4 py-2 rounded-t-md font-medium text-md ${!canceledOrdersTab ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Deleted Orders
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:flex-wrap gap-4 mt-4 mb-4">

                {/* SR Selector */}
                {(isAdmin || isTL) && (
                    <div className="w-full md:w-auto">
                        <label className="block text-lg font-medium text-amber-700 mb-2">Select SR</label>
                        <select
                            value={selectedSR}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "old") {
                                    // setOld(true);
                                    setSelectedSR("old"); 
                                } else {
                                    // setOld(false);
                                    setSelectedSR(value);
                                }
                            }}
                            className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-md"
                        >
                            <option value="">-- Select SR --</option>
                            {srs.map((sr) => (
                                <option key={sr._id} value={sr.username}>
                                    {sr.username}
                                </option>
                            ))}
                            <option value="old">Ex SRs</option>
                        </select>

                    </div>
                )}

                {/* Date Selector */}
                    <div className="w-full md:w-auto">
                        <label className="block text-lg font-medium text-amber-700 mb-2">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                            }}
                            className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-md"
                            // min={
                            // new Date(
                            //     new Date().getFullYear(),
                            //     new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1,
                            //     21
                            // ).toISOString().split("T")[0]
                            // }
                            max={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]}
                        />
                    </div>

                {/* Refresh Button */}
                {!isSR && (
                    <div className="w-full md:w-auto">
                        <button
                            onClick={handleRefresh}
                            className="w-full px-4 py-2 bg-amber-600 text-white text-md rounded hover:bg-amber-700 transition mt-2 md:mt-0"
                        >
                            Refresh
                        </button>
                    </div>

                )}

                <div className="w-full md:w-auto">
                    <h1
                        className="w-full px-4 py-2 bg-amber-600 text-white text-md rounded hover:bg-amber-700 transition mt-2 md:mt-0 text-center"
                    >
                        Orders: <span>{calls}</span>
                    </h1>
                </div>

                {/* CSV Export Button pushed to right on desktop */}
                <div className="w-full md:w-auto md:ml-auto flex flex-col md:flex-row gap-4">
                        <button
                            onClick={handleExportCsv}
                            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white text-md rounded hover:bg-green-700 transition"
                        >
                            CSV Export
                        </button>
                    </div>
            </div>

            {loading && <p className="mt-4">Loading orders...</p>}
            {error && (
                <p className="mt-4 text-red-600">Error: {error}</p>
            )}
            {!loading && orders.length > 0 && (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left min-w-[30px]">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOrders(orders.map((order) => order._id));
                                            } else {
                                                setSelectedOrders([]);
                                            }
                                        }}
                                        checked={selectedOrders.length === orders.length}
                                    />
                                </th>
                                <th className="border p-2 text-left min-w-[200px]">Type</th>
                                {canceledOrdersTab && <th className="border p-2 text-left min-w-[180px]">Canceled At</th>}
                                {!canceledOrdersTab && <th className="border p-2 text-left min-w-[180px]">Deleted At</th>}
                                {canceledOrdersTab && <th className="border p-2 text-left min-w-[180px]">Comment</th>}
                                {canceledOrdersTab && <th className="border p-2 text-left min-w-[180px]">Canceled By</th>}
                                {!canceledOrdersTab && <th className="border p-2 text-left min-w-[180px]">Deleted By</th>}
                                <th className="border p-2 text-left min-w-[200px]">Order Placed At</th>
                                <th className="border p-2 text-left min-w-[150px]">SR</th>
                                <th className="border p-2 text-left min-w-[200px]">Shop Name</th>
                                <th className="border p-2 text-left min-w-[200px]">Shop Address</th>
                                <th className="border p-2 text-left min-w-[180px]">Contact Number</th>
                                <th className="border p-2 text-left min-w-[200px]">Address Link</th>
                                <th className="border p-2 text-left min-w-[200px]">Route</th>
                                <th className="border p-2 text-left min-w-[200px]">Payment Terms</th>
                                <th className="border p-2 text-left min-w-[200px]">Order Placed By</th>
                                <th className="border p-2 text-left min-w-[200px]">Remarks</th>
                                {productsList.map((key) => (
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
                                        className="border p-2 text-left min-w-[180px]  text-amber-700"
                                    >
                                        {key}
                                    </th>
                                ))}
                                <th className="border p-2 text-left min-w-[180px] text-red-700">Total</th>
                                {((!isTL && !isSR ) && canceledOrdersTab) && <th className="border p-2 text-left min-w-[150px]">Actions</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <>
                                    {/* {console.log('in table', order)} */}
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="border p-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => {
                                                    setSelectedOrders((prev) =>
                                                        prev.includes(order._id)
                                                            ? prev.filter((id) => id !== order._id)
                                                            : [...prev, order._id]
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="border p-2">{order.type}</td>
                                        {canceledOrdersTab && (order.statusUpdatedAt ?
                                            <td className="border p-2">
                                                {(() => {
                                                    const date = new Date(order.statusUpdatedAt);
                                                    const day = String(date.getDate()).padStart(2, "0");
                                                    const month = String(date.getMonth() + 1).padStart(2, "0");
                                                    const year = date.getFullYear();
                                                    const hours = String(date.getHours()).padStart(2, "0");
                                                    const minutes = String(date.getMinutes()).padStart(2, "0");

                                                    return `${day}/${month}/${year} ${hours}:${minutes}`;
                                                })()}
                                            </td> : '-')}
                                        {!canceledOrdersTab && (order.deletedAt ?
                                            <td className="border p-2">
                                                {(() => {
                                                    const date = new Date(order.deletedAt);
                                                    const day = String(date.getDate()).padStart(2, "0");
                                                    const month = String(date.getMonth() + 1).padStart(2, "0");
                                                    const year = date.getFullYear();
                                                    const hours = String(date.getHours()).padStart(2, "0");
                                                    const minutes = String(date.getMinutes()).padStart(2, "0");

                                                    return `${day}/${month}/${year} ${hours}:${minutes}`;
                                                })()}
                                            </td> : '-')}
                                        {canceledOrdersTab && (
                                            <td className="border p-2 max-w-[150px] overflow-x-auto whitespace-nowrap">
                                                <div className="overflow-x-auto max-w-[350px]">
                                                    <span
                                                        className="inline-block truncate"
                                                        title={order.canceledReason}
                                                    >
                                                        {order.canceledReason || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        {canceledOrdersTab && <td className="border p-2">{order.statusUpdatedBy || '-'}</td>}
                                        {!canceledOrdersTab && <td className="border p-2">{order.deletedBy || '-'}</td>}
                                        <td className="border p-2">
                                            {order.createdAt ? (() => {
                                                const date = new Date(order.createdAt);
                                                const day = String(date.getDate()).padStart(2, "0");
                                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                                const year = date.getFullYear();
                                                const hours = String(date.getHours()).padStart(2, "0");
                                                const minutes = String(date.getMinutes()).padStart(2, "0");

                                                return `${day}/${month}/${year} ${hours}:${minutes}`;
                                            })(): '-'}
                                        </td>
                                        <td className="border p-2">{order.placedBy}</td>
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
                                        <td className="border p-2">{order.shopId.areaName}</td>
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

                                        {productsList.map((key) => (
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
                                        ))}
                                        <td className="border p-2 font-semibold">
                                                {order.total
                                                    ? totalList.reduce((sum, key) => {
                                                        const val = order.total[key];
                                                        return sum + (typeof val === "number" ? val : 0);
                                                    }, 0)
                                                    : "-"}
                                            </td>

                                        {(!isTL && !isSR ) && canceledOrdersTab &&
                                            <td className="border p-2">
                                                {role === "admin" && (
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="text-red-500 hover:text-red-600 p-2 text-xl"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleBlacklist(order.shopId._id)}
                                                    className="text-black-600 hover:text-black-800 text-xl p-2"
                                                    title="Blacklist"
                                                >
                                                    <FaBan />
                                                </button>
                                            </td>
                                        }

                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-center items-center mt-4 space-x-4">
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
            </div>
           
        </div>
    );
}
