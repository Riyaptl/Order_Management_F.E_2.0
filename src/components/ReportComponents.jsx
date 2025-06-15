import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./NavbarComponents";
import { getSRDetails } from "../slice/userSlice";

export default function ReportComponents({
    title = "Sales Report",
    reportData = {},
    replaceReportData = {},
    loading = false,
    queryAction,
}) {
    const dispatch = useDispatch();
    const { user, role } = useSelector((state) => state.auth);
    const { srs } = useSelector((state) => state.user);

    const [selectedDate, setSelectedDate] = useState("");
    const [showCurrentMonth, setShowCurrentMonth] = useState(false);
    const [username, setUsername] = useState("");

    const isDistributor = role === "distributor";
    const isSR = role === "sr";

    useEffect(() => {
        if (role === "admin") {
            dispatch(getSRDetails());
        }
    }, [dispatch, role]);

    useEffect(() => {
        const query = {};
        if (selectedDate) {
            query.date = selectedDate;
            query.completeData = false;
        } else {
            query.completeData = showCurrentMonth;
        }
        if (isDistributor) {
            query.dist_username = user;
        }
        if (isSR) {
            query.placed_username = user;
        }
        if (username) {
            query.placed_username = username;
        }

        if (queryAction) dispatch(queryAction(query));
    }, [dispatch, user, selectedDate, showCurrentMonth, username, queryAction]);

    const productKeys = reportData.productTotals ? Object.keys(reportData.productTotals) : [];
    const overallKeys = reportData.overallTotals ? Object.keys(reportData.overallTotals) : [];

    const now = new Date();
    const monthName = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "long",
    });

    return (
        <div className="p-4">
            <div className="flex justify-end md:justify-center mb-8">
                <Navbar />
            </div>

            <div className="px-4 md:px-6 mb-6">
                <h2 className="text-2xl font-semibold text-amber-700 text-center">{title}</h2>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-4 md:px-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                    {role === "admin" && (
                        <div className="flex flex-col">
                            <label className="text-lg font-medium text-amber-700 mb-1">
                                Select SR <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full md:w-64 text-md border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
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

                    <div className="flex flex-col">
                        <label className="text-lg font-medium text-amber-700 mb-1">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setShowCurrentMonth(false);
                            }}
                            className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-md"
                            min={
                        new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1,
                            21
                        ).toISOString().split("T")[0]
                        }
                            max={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <label className="text-lg font-medium text-amber-700 whitespace-nowrap">
                            Show {monthName}'s {title}
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showCurrentMonth}
                                onChange={() => {
                                    setShowCurrentMonth((prev) => !prev);
                                    setSelectedDate("");
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-600 transition-all duration-300"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                        </label>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-600">Loading report...</p>
            ) : (
                <div className="px-4 md:px-6 space-y-10">
                    <section>
                        <div className="text-lg font-bold text-green-700 text-left mb-2">
                            Order Amount: ₹{reportData.amount || 0}
                        </div>
                        <div className="text-lg font-bold text-green-700 text-left mb-2">
                            Replacement Amount: ₹{replaceReportData.amount || 0}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 text-left min-w-[140px]">Product</th>
                                        <th className="border p-2 text-left">Ordered</th>
                                        <th className="border p-2 text-left">Replaced</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productKeys.map((key) => (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="border p-2">{key}</td>
                                            <td className="border p-2">{reportData.productTotals[key]}</td>
                                            <td className="border p-2">{replaceReportData.productTotals?.[key] || 0}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-200">
                                        <td colSpan={3} className="text-center font-semibold p-2">Overall Totals</td>
                                    </tr>
                                    {overallKeys.map((key) => (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="border p-2">{key}</td>
                                            <td className="border p-2">{reportData.overallTotals[key]}</td>
                                            <td className="border p-2">{replaceReportData.overallTotals?.[key] || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
