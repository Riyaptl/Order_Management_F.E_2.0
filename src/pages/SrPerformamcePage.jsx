import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { salesReport, SrReport } from '../slice/orderSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getSRDetails } from '../slice/userSlice';

const SrPerformancePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector(state => state.auth);
    const { productTotals, overallTotals, amount } = useSelector((state) => state.order);
    const { srs } = useSelector(state => state.user);
    const { summary, loading, error } = useSelector(state => state.order);
    const [showCurrentMonth, setShowCurrentMonth] = useState(false);
    const [username, setUsername] = useState('');
    const [report, setReport] = useState([])

    useEffect(() => {
        if (role !== "admin") {
            setUsername(user)
        }
    }, [])

    useEffect(() => {
        if (username) {
            dispatch(SrReport({ username }))
                .unwrap()
                .catch(err => toast.error(err || 'Failed to load performance report'));
            dispatch(salesReport({completeData: showCurrentMonth, placed_username: username}))
                .unwrap()
                .catch(err => toast.error(err || 'Failed to load sales report'));
        }
    }, [dispatch, username, showCurrentMonth]);

    useEffect(() => {
        if (role === 'admin') {
            dispatch(getSRDetails());
        }
    }, [dispatch, role]);

    useEffect(() => {
        if (username) {
            setReport(summary)
        } else {
            setReport([])
        }
    }, [username, summary]);

    const productKeys = productTotals ? Object.keys(productTotals) : [];
    const overallKeys = overallTotals ? Object.keys(overallTotals) : [];
    const now = new Date();
    const monthName = now.toLocaleString("en-IN", {
       timeZone: "Asia/Kolkata",
        month: "long",
    });

    if (loading) {
        return <p className="text-center mt-10 text-amber-600 font-semibold">Loading report...</p>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto mt-10 bg-white shadow-lg rounded-lg relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 text-xl font-bold text-amber-700 px-4 py-2 rounded hover:bg-amber-100 "
            >
                ← Back to Area Selection
            </button>

            <h1 className="mt-12 text-2xl font-bold text-amber-700 mb-10 text-center">Performance Report</h1>

            {error && <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>}
            {role === 'admin' && (
                <div className="mb-8">
                    <label className="block text-gray-700 text-sm mb-2">
                        Select SR <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
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

            <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 text-sm">
                    <thead className="bg-amber-100 text-gray-700">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Regular 50g</th>
                            <th className="p-2 border">Coffee 50g</th>
                            <th className="p-2 border">Regular 25g</th>
                            <th className="p-2 border">Coffee 25g</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map(({ date, "Regular 50g": reg50 = 0, "Coffee 50g": cof50 = 0, "Regular 25g": reg25 = 0, "Coffee 25g": cof25 = 0 }) => (
                            <tr key={date} className="text-center even:bg-gray-50">
                                <td className="p-2 border">{new Date(date).toLocaleDateString()}</td>
                                <td className="p-2 border">{reg50}</td>
                                <td className="p-2 border">{cof50}</td>
                                <td className="p-2 border">{reg25}</td>
                                <td className="p-2 border">{cof25}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {username && (<>

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
            )} </>)}

        </div>
    );
};

export default SrPerformancePage;
