// DistributorOrderPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getOrders,
    createOrder,
    statusOrder,
    deleteOrder
} from "../slice/distributorOrderSlice";
import toast from "react-hot-toast";
import { getDistDetails, getSRDetails } from "../slice/userSlice";
import Navbar from "../components/NavbarComponents";

const DistributorOrderPage = () => {
    const dispatch = useDispatch();

    const { distributorOrders, loading } = useSelector((state) => state.distributorOrder);
    const { dists, srs } = useSelector(state => state.user);
    const { user, role } = useSelector((state) => state.auth);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDeliveredProducts, setShowDeliveredProducts] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const orderedProductsList = selectedOrder
        ? Object.keys(selectedOrder.products || {})
        : [];
    const [searchTermDistributor, setSearchTermDistributor] = useState("");
    const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
    const distributorDropdownRef = useRef(null);


    const isAdmin = role === 'admin';

    const [filters, setFilters] = useState({
        distributor: "",
        placedBy: ""
    });

    const [createForm, setCreateForm] = useState({
        distributor: "",
        placedBy: "",
        products: {},
        expected_delivery: "",
        orderPlacedBy: "",
        remarks: "",
        address: "",
        contact: ""
    });

    const [statusForm, setStatusForm] = useState({
        status: "",
        canceledReason: "",
        ETD: "",
        delivered_products_same_as_products: false,
        delivered_products: {},
        companyRemarks: "",
        billAttached: false
    });


    useEffect(() => {
        dispatch(getOrders(filters));
    }, [dispatch, filters])

    useEffect(() => {
        dispatch(getDistDetails());
        dispatch(getSRDetails());
    }, [dispatch]);

    useEffect(() => {
        if (
            statusForm.delivered_products_same_as_products &&
            selectedOrder
        ) {
            setStatusForm((prev) => ({
                ...prev,
                delivered_products: { ...selectedOrder.products }
            }));
        }
    }, [statusForm.delivered_products_same_as_products, selectedOrder]);


    const handleFilterChange = (e) => {
        const updated = { ...filters, [e.target.name]: e.target.value };
        setFilters(updated);
        dispatch(getOrders(updated));
    };

    const handleCreateChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateOrder = (e) => {
        e.preventDefault();

        if (!createForm.distributor || !createForm.orderPlacedBy) {
            alert("Distributor and Order Placed By are required");
            return;
        }

        dispatch(createOrder(createForm)).unwrap().then((res) => {
            toast.success(res?.message || "Order created successfully");
            dispatch(getOrders(filters));

        }).catch((err) => {
            toast.error(err?.message || err?.error || "Failed to create order");
        });
        setShowCreateModal(false);
        setCreateForm({
            distributor: "",
            placedBy: "",
            products: {},
            expected_delivery: "",
            orderPlacedBy: "",
            remarks: ""
        });
        setSelectedOrder(null)
    };

    const handleUpdateStatus = () => {
        if (!statusForm.status) {
            alert("Status is required");
            return;
        }

        const payload = {
            orderId: selectedOrder._id,
            status: statusForm.status,
            ETD: statusForm.ETD,
            delivered_products: statusForm.delivered_products,
            same_as_products: statusForm.delivered_products_same_as_products
        };

        if (statusForm.status === "canceled") {
            payload.canceledReason = statusForm.canceledReason;
        }

        dispatch(statusOrder(payload)).unwrap().then((res) => {
            console.log(res);

            toast.success(res?.message || "Order status updated successfully!");

            dispatch(getOrders(filters));

        }).catch((err) => {
            toast.error(err?.message || err?.error || "Failed to update status");
        });
        setShowStatusModal(false);
        setShowDeliveredProducts(false)
        setStatusForm({
            status: "",
            canceledReason: "",
            ETD: "",
            delivered_products: {}
        });
        setSelectedOrder(null)
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            const res = await dispatch(deleteOrder(orderId)).unwrap();
            toast.success(res?.message || "Order deleted successfully!");
            await dispatch(getOrders(filters));
            setSelectedOrder(null);
        } catch (err) {
            toast.error(err?.message || err?.error || "Failed to delete order");
        }
    };



    const productsList = [
        "Cranberry 50g", "Dryfruits 50g", "Peanuts 50g", "Mix seeds 50g", "Blueberry 50g", "Hazelnut 50g",
        "Classic Coffee 50g", "Dark Coffee 50g", "Intense Coffee 50g", "Toxic Coffee 50g",
        "Cranberry 25g", "Dryfruits 25g", "Peanuts 25g", "Mix seeds 25g", "Blueberry 25g", "Hazelnut 25g",
        "Orange 25g", "Mint 25g", "Classic Coffee 25g", "Dark Coffee 25g",
        "Intense Coffee 25g", "Toxic Coffee 25g", "Gift box",
        "Hazelnut & Blueberries 55g", "Roasted Almonds & Pink Salt 55g", "Kiwi & Pineapple 55g", "Ginger & Cinnamon 55g", "Pistachio & Black Raisin 55g", "Dates & Raisin 55g"
    ];

    const totalList = [
        "Regular 50g", "Coffee 50g", "Regular 25g", "Coffee 25g", "Gift box",
        "Hazelnut & Blueberries 55g", "Roasted Almonds & Pink Salt 55g", "Kiwi & Pineapple 55g", "Ginger & Cinnamon 55g", "Pistachio & Black Raisin 55g", "Dates & Raisin 55g"
    ];

    const filteredDistributors = dists?.filter((d) =>
        d.username.toLowerCase().includes(searchTermDistributor.toLowerCase())
        );


    return (
        <div className="p-4">
            <div className="flex justify-end md:justify-center mb-8">
                <Navbar />
            </div>
            <div className="mt-6">
                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-amber-700">
                        Distributor Orders List
                    </h2>
                </div>

                {/* Create Order button below heading */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full md:w-auto px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                    >
                        + Create Order
                    </button>
                </div>
            </div>


            {/* Filters */}
            {isAdmin &&

                <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
                    <select
                        name="distributor"
                        value={filters.distributor}
                        onChange={handleFilterChange}
                        className="border p-2 rounded w-full md:w-auto"
                    >
                        <option value="">Select Distributor</option>
                        <option value="other">Other</option>
                        {dists?.map((d) => (
                            <option key={d._id} value={d.username}>{d.username}</option>
                        ))}
                    </select>

                    <select
                        name="placedBy"
                        value={filters.placedBy}
                        onChange={handleFilterChange}
                        className="border p-2 rounded w-full md:w-auto"
                    >
                        <option value="">Select Placed By</option>
                        {srs?.map((u) => (
                            <option key={u._id} value={u.username}>{u.username}</option>
                        ))}
                    </select>
                </div>
            }

            {/* Orders Table */}
            {!loading && distributorOrders?.length > 0 && (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {/* <th className="border p-2 text-left min-w-[30px]">
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
                                </th> */}
                                <th className="border p-2 text-left min-w-[200px]">Distributor</th>
                                <th className="border p-2 text-left min-w-[200px]">SR/TL</th>
                                <th className="border p-2 text-left min-w-[200px]">Total</th>
                                <th className="border p-2 text-left min-w-[200px]">Order Placed By</th>
                                <th className="border p-2 text-left min-w-[200px]">Expected Date</th>
                                <th className="border p-2 text-left min-w-[200px]">Remarks</th>
                                <th className="border p-2 text-left min-w-[200px]">Created At</th>
                                <th className="border p-2 text-left min-w-[200px]">status</th>
                                <th className="border p-2 text-left min-w-[200px]">Delivery Date</th>
                                <th className="border p-2 text-left min-w-[200px]">Delivered / Dispatched Total</th>
                                <th className="border p-2 text-left min-w-[200px]">Delivered On</th>
                                <th className="border p-2 text-left min-w-[200px]">Cancelled Reason</th>
                                <th className="border p-2 text-left min-w-[200px]">Status Modified By</th>
                                <th className="border p-2 text-left min-w-[200px]">Status Modified At</th>
                                <th className="border p-2 text-left min-w-[200px]">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {distributorOrders.map((order) => (
                                <>
                                    {/* {console.log('in table', order)} */}
                                    <tr key={order._id} className="hover:bg-gray-50" onClick={(e) => {
                                        if ((e.target.closest("td")?.cellIndex === 0 || e.target.closest("td")?.cellIndex === 1 || e.target.closest("td")?.cellIndex === 2)) {
                                            setSelectedOrder(order);
                                        }
                                    }} >

                                        {/* <td className="border p-2">
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
                                        </td> */}
                                        <td className="border p-2">{order.distributor}</td>
                                        <td className="border p-2">{order.placedBy}</td>
                                        <td className="border p-2 font-semibold">
                                            {order.total
                                                ? totalList.reduce((sum, key) => {
                                                    const val = order.total[key];
                                                    return sum + (typeof val === "number" ? val : 0);
                                                }, 0)
                                                : "-"}
                                        </td>
                                        <td className="border p-2">{order.orderPlacedBy}</td>
                                        <td className="border p-2">
                                            {order.expected_delivery?.length
                                                ? order.expected_delivery
                                                    .map((d) => {
                                                        const date = new Date(d);
                                                        const day = String(date.getDate()).padStart(2, "0");
                                                        const month = String(date.getMonth() + 1).padStart(2, "0");
                                                        const year = date.getFullYear();
                                                        return `${day}-${month}-${year}`;
                                                    })
                                                    .join(", ")
                                                : "-"}
                                        </td>
                                        <td className="border p-2">{order.remarks}</td>
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
                                        <td className="border p-2">{order.status}</td>
                                        <td className="border p-2">
                                            {order.ETD?.length
                                                ? order.ETD
                                                    .map((d) => {
                                                        const date = new Date(d);
                                                        const day = String(date.getDate()).padStart(2, "0");
                                                        const month = String(date.getMonth() + 1).padStart(2, "0");
                                                        const year = date.getFullYear();
                                                        return `${day}-${month}-${year}`;
                                                    })
                                                    .join(", ")
                                                : "-"}
                                        </td>
                                        <td className="border p-2 font-semibold">
                                            {order.delivered && order.delivered.length > 0
                                                ? order.delivered.reduce((sum, entry) => {
                                                    return (
                                                        sum +
                                                        totalList.reduce((subtotal, key) => {
                                                            const val = entry.total[key];
                                                            return subtotal + (typeof val === "number" ? val : 0);
                                                        }, 0)
                                                    );
                                                }, 0)
                                                : "-"}
                                        </td>

                                        <td className="border p-2">
                                            {order.delivered_on?.length
                                                ? order.delivered_on
                                                    .map((d) => {
                                                        const date = new Date(d);
                                                        const day = String(date.getDate()).padStart(2, "0");
                                                        const month = String(date.getMonth() + 1).padStart(2, "0");
                                                        const year = date.getFullYear();
                                                        return `${day}-${month}-${year}`;
                                                    })
                                                    .join(", ")
                                                : "-"}
                                        </td>
                                        <td className="border p-2">{order.canceledReason}</td>
                                        <td className="border p-2">{order.statusUpdatedBy}</td>
                                        <td className="border p-2">
                                            {order.statusUpdatedAt ? (() => {
                                                const date = new Date(order.statusUpdatedAt);
                                                const day = String(date.getDate()).padStart(2, "0");
                                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                                const year = date.getFullYear();
                                                const hours = String(date.getHours()).padStart(2, "0");
                                                const minutes = String(date.getMinutes()).padStart(2, "0");

                                                return `${day}/${month}/${year} ${hours}:${minutes}`;
                                            })() : "-"}
                                        </td>
                                        <td className="border p-2 flex gap-2 justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                    setShowStatusModal(false);
                                                    setShowDeliveredProducts(true);
                                                }}
                                                className="px-3 py-1 text-sm bg-amber-600 text-white rounded shadow hover:bg-amber-700 transition"
                                            >
                                                View Dispatched / Delivered
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                    setShowDeliveredProducts(false);
                                                    setShowStatusModal(true);
                                                }}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                                            >
                                                Update Status
                                            </button>

                                            {isAdmin && <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                                            >
                                                Delete Order
                                            </button>}
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* show order */}
            {selectedOrder && !showDeliveredProducts && !showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4 text-amber-700 text-center">Order Details</h2>

                        <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2 text-gray-700">Products:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {productsList.map((product) => (
                                    <div
                                        key={product}
                                        className="border rounded p-2 flex justify-between items-center"
                                    >
                                        <span>{product}</span>
                                        <span className="font-medium">{selectedOrder.products[product] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2 text-gray-700">Total Summary:</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {totalList.map((item) => (
                                    <div
                                        key={item}
                                        className="border rounded p-2 flex justify-between items-center px-3"
                                    >
                                        <span>{item}</span>
                                        <span className="font-medium">{selectedOrder.total[item] || 0}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border rounded p-3 mt-4 flex justify-between items-center bg-amber-100 font-semibold text-amber-800 mb-4">
                                <span>Total</span>
                                <span>
                                    {totalList.reduce(
                                        (sum, key) => sum + (Number(selectedOrder.total[key]) || 0),
                                        0
                                    )}
                                </span>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-2 text-gray-700">Remarks:</h3>
                                <div className="overflow-x-auto max-w-[350px]">
                                    <span
                                        className="inline-block truncate"
                                        title={selectedOrder.remarks}
                                    >
                                        {selectedOrder.remarks}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-2 text-gray-700">Address:</h3>
                                <div className="overflow-x-auto">
                                    <span
                                        className="inline-block truncate"
                                        title={selectedOrder.address}
                                    >
                                        {selectedOrder.address}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-2 text-gray-700">Contact:</h3>
                                <div className="overflow-x-auto max-w-[350px]">
                                    <span
                                        className="inline-block truncate"
                                        title={selectedOrder.contact}
                                    >
                                        {selectedOrder.contact}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* show delivered order */}
            {selectedOrder && showDeliveredProducts && !showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4 text-amber-700 text-center">
                            Delivered Products
                        </h2>

                        {selectedOrder.delivered && selectedOrder.delivered.length > 0 ? (
                            selectedOrder.delivered.map((delivery, index) => (
                                <div key={index} className="mb-6 border rounded p-4 bg-amber-50">
                                    {/* Delivery Date */}
                                    <div className="mb-3">
                                        <span className="font-semibold text-gray-700">Delivery Date: </span>
                                        <span>{new Date(delivery.date).toLocaleDateString()}</span>
                                    </div>

                                    {/* Products */}
                                    <div className="mb-3">
                                        <h3 className="font-semibold text-gray-700 mb-2">Products:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                            {productsList.map((product) => (
                                                <div
                                                    key={product}
                                                    className="border rounded p-2 flex justify-between items-center"
                                                >
                                                    <span>{product}</span>
                                                    <span className="font-medium">
                                                        {delivery.products?.[product] || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-gray-700 mb-2">Delivered Total Summary:</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {totalList.map((item) => (
                                                <div
                                                    key={item}
                                                    className="border rounded p-2 flex justify-between items-center px-3"
                                                >
                                                    <span>{item}</span>
                                                    <span className="font-medium">
                                                        {delivery.total?.[item] || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border rounded p-3 mt-3 flex justify-between items-center bg-amber-100 font-semibold text-amber-800">
                                            <span>Total</span>
                                            <span>
                                                {totalList.reduce(
                                                    (sum, key) => sum + (Number(delivery.total?.[key]) || 0),
                                                    0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                No deliveries yet.
                            </div>
                        )}

                        {/* Close */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowDeliveredProducts(false);
                                    setSelectedOrder(null);
                                }}
                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {selectedOrder && showStatusModal && !showDeliveredProducts && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">

                        <h2 className="text-xl font-semibold mb-4 text-center text-amber-700">
                            Update Order Status
                        </h2>

                        {/* Status */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Status *</label>
                            <select
                                value={statusForm.status}
                                onChange={(e) => {
                                    const status = e.target.value;
                                    setStatusForm(prev => ({
                                        ...prev,
                                        status
                                    }));
                                }}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">Select Status</option>

                                {isAdmin ? (
                                    <>
                                        <option value="preparing">Preparing</option>
                                        <option value="dispatched">Dispatched</option>
                                        <option value="canceled">Canceled</option>
                                    </>
                                ) : (
                                    <option value="delivered">Delivered</option>
                                )}
                            </select>

                        </div>

                        {/* ETD */}
                        {(statusForm.status === "preparing" || statusForm.status === "dispatched") && <div className="mb-4">
                            <label className="block font-medium mb-1">ETD</label>
                            <input
                                type="date"
                                value={statusForm.ETD}
                                onChange={(e) =>
                                    setStatusForm(prev => ({ ...prev, ETD: e.target.value }))
                                }
                                className="border p-2 rounded w-full"
                            />
                        </div>}

                        {/* Cancel Reason */}
                        {statusForm.status === "canceled" && (
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Cancel Reason *</label>
                                <input
                                    type="text"
                                    value={statusForm.canceledReason}
                                    onChange={(e) =>
                                        setStatusForm(prev => ({ ...prev, canceledReason: e.target.value }))
                                    }
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                        )}
                        
                        {/* Company Remarks */}
                        {(statusForm.status === "preparing" || statusForm.status === "dispatched") && (
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Company Remarks</label>
                                <input
                                    type="text"
                                    value={statusForm.companyRemarks}
                                    onChange={(e) =>
                                        setStatusForm(prev => ({ ...prev, companyRemarks: e.target.value }))
                                    }
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                        )}

                        {/* Delivered Products Toggle */}
                        {statusForm.status === "dispatched" && (
                            <div className="mb-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="billAttched"
                                    checked={statusForm.billAttached}
                                    onChange={(e) =>
                                        setStatusForm(prev => ({
                                            ...prev,
                                            billAttached: e.target.checked,
                                        }))
                                    }
                                    className="w-4 h-4"
                                />
                                <label htmlFor="deliveredProductsToggle" className="text-sm">
                                    Is Bill Attached
                                </label>
                            </div>
                        )}

                        {/* Delivered Products Toggle */}
                        {statusForm.status === "dispatched" && (
                            <div className="mb-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="deliveredProductsToggle"
                                    checked={statusForm.delivered_products_same_as_products}
                                    onChange={(e) =>
                                        setStatusForm(prev => ({
                                            ...prev,
                                            delivered_products_same_as_products: e.target.checked,
                                            delivered_products: e.target.checked
                                                ? { ...selectedOrder.products } // auto-assign
                                                : {} // clear if unchecked
                                        }))
                                    }
                                    className="w-4 h-4"
                                />
                                <label htmlFor="deliveredProductsToggle" className="text-sm">
                                    Same as placed order.
                                </label>
                            </div>
                        )}


                        {/* Manual Product Quantity Input */}
                        {statusForm.status === "dispatched" && !statusForm.delivered_products_same_as_products && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                                    Dispatched Products
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {orderedProductsList.map(product => (
                                        <div
                                            key={product}
                                            className="border rounded p-2 flex justify-between items-center"
                                        >
                                            <span className="text-sm">{product}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={selectedOrder.products[product]}
                                                className="w-20 border rounded p-1 text-right"
                                                value={statusForm.delivered_products[product] || ""}
                                                onChange={(e) =>
                                                    setStatusForm(prev => ({
                                                        ...prev,
                                                        delivered_products: {
                                                            ...prev.delivered_products,
                                                            [product]: Number(e.target.value)
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false)
                                    setSelectedOrder(null)
                                    setShowDeliveredProducts(false)
                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleUpdateStatus()}
                                className="px-4 py-2 bg-amber-600 text-white rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* create order */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4 text-amber-700 text-center">
                            Create Distributor Order
                        </h2>

                        <form onSubmit={handleCreateOrder} className="space-y-4">

                            {/* Distributor */}
<div ref={distributorDropdownRef} className="w-full relative">
  <label className="block font-medium mb-1">
    Distributor <span className="text-red-500">*</span>
  </label>

  {/* search box */}
  <input
    type="text"
    value={searchTermDistributor}
    onChange={(e) => {
      setSearchTermDistributor(e.target.value);
      setShowDistributorDropdown(true);
    }}
    onFocus={() => setShowDistributorDropdown(true)}
    placeholder="Search distributor..."
    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
    required
  />

  {/* dropdown list */}
  {showDistributorDropdown && (
    <ul className="absolute z-20 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
      {/* Other option */}
      <li
        onClick={() => {
          setCreateForm((prev) => ({
            ...prev,
            distributor: "other"
          }));
          setSearchTermDistributor("Other");
          setShowDistributorDropdown(false);
        }}
        className="p-3 hover:bg-amber-100 cursor-pointer"
      >
        Other
      </li>

      {filteredDistributors.length === 0 ? (
        <li className="p-3 text-gray-500 select-none">
          No distributors found
        </li>
      ) : (
        filteredDistributors.map((d) => (
          <li
            key={d._id}
            onClick={() => {
              setCreateForm((prev) => ({
                ...prev,
                distributor: d.username
              }));
              setSearchTermDistributor(d.username);
              setShowDistributorDropdown(false);
            }}
            className="p-3 hover:bg-amber-100 cursor-pointer"
          >
            {d.username}
          </li>
        ))
      )}
    </ul>
  )}
</div>


                            {/* Placed By */}
                            {isAdmin && <div>
                                <label className="block font-medium mb-1">Placed By</label>
                                <select
                                    name="placedBy"
                                    value={createForm.placedBy}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="">Select SR / TL</option>
                                    {srs?.map((u) => (
                                        <option key={u._id} value={u.username}>
                                            {u.username}
                                        </option>
                                    ))}
                                </select>
                            </div>}

                            {/* Order Placed By */}
                            <div>
                                <label className="block font-medium mb-1">Order Placed By *</label>
                                <input
                                    type="text"
                                    name="orderPlacedBy"
                                    value={createForm.orderPlacedBy}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter name"
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={createForm.address}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter address"
                                />
                            </div>

                            {/* Contact */}
                            <div>
                                <label className="block font-medium mb-1">Contact</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={createForm.contact}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            {/* Expected Delivery */}
                            <div>
                                <label className="block font-medium mb-1">Expected Delivery</label>
                                <input
                                    type="date"
                                    name="expected_delivery"
                                    value={createForm.expected_delivery}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                />
                            </div>

                            {/* Products */}
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                                    Products
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {productsList.map((product) => (
                                        <div
                                            key={product}
                                            className="border rounded p-2 flex justify-between items-center"
                                        >
                                            <span className="text-sm">{product}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-20 border rounded p-1 text-right"
                                                onChange={(e) =>
                                                    setCreateForm((prev) => ({
                                                        ...prev,
                                                        products: {
                                                            ...prev.products,
                                                            [product]: Number(e.target.value)
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block font-medium mb-1">Remarks</label>
                                <input
                                    type="text"
                                    name="remarks"
                                    value={createForm.remarks}
                                    onChange={handleCreateChange}
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter remarks"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                                >
                                    Create Order
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {loading && <p className="mt-4">Loading...</p>}
        </div>
    );
};

export default DistributorOrderPage;