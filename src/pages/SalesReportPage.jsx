import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { salesReport } from "../slice/orderSlice";
import Navbar from "../components/NavbarComponents";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../slice/authSlice";
import DistNavbar from "../components/DistNavbarComponents";


export default function SalesReportPage() {
    const dispatch = useDispatch();
     const navigate = useNavigate();
    const { productTotals, overallTotals, amount, loading } = useSelector((state) => state.order);
    const { user, role } = useSelector((state) => state.auth);
    const [showCurrentMonth, setShowCurrentMonth] = useState(true);
    const isDistributor = role === "distributor"

    useEffect(() => {
        const query = {completeData: showCurrentMonth}
        if (isDistributor){
            query.dist_username = user
        }
        dispatch(salesReport(query));
    }, [dispatch, user, showCurrentMonth]);

    const productKeys = productTotals ? Object.keys(productTotals) : [];
    const overallKeys = overallTotals ? Object.keys(overallTotals) : [];
    const now = new Date();
    const monthName = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "long",
    });

    
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

    return (
        <div className="p-4">
            {role === "admin" && (
                <div className="flex justify-center mb-8">
                    <Navbar />
                </div>
            )}
            {isDistributor && (
                <div className="flex justify-center mb-8">
                    <DistNavbar />
                </div>
            )}
            <div className="flex items-center justify-between px-6 mt-6">
                <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-amber-700">Orders List</h2>
                </div>
                {isDistributor && (
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between px-6 mt-6 mb-4">
                <h2 className="text-2xl font-semibold text-amber-700 text-center flex-1">
                    Sales Report
                </h2>
            </div>

            <div className="flex items-center justify-between flex-wrap px-6">
                <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">
                        Show {monthName}'s Sales Report
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showCurrentMonth}
                            onChange={() => setShowCurrentMonth((prev) => !prev)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-600 transition-all duration-300"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </label>
                </div>
                <div className="text-lg font-bold text-green-700 mb-4">
                    Total Amount: ₹{amount || 0}
                </div>
            </div>

            {loading && <p className="text-center text-gray-600">Loading report...</p>}

            {!loading && (
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">Product</th>
                                <th className="border p-2 text-left">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productKeys.map((key) => (
                                <tr key={key} className="hover:bg-gray-50">
                                    <td className="border p-2">{key}</td>
                                    <td className="border p-2">{productTotals[key]}</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-200">
                                <td colSpan={2} className="text-center font-semibold p-2">
                                    Overall Totals
                                </td>
                            </tr>
                            {overallKeys.map((key) => (
                                <tr key={key} className="hover:bg-gray-50">
                                    <td className="border p-2">{key}</td>
                                    <td className="border p-2">{overallTotals[key]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
