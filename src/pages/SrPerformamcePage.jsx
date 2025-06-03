import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SrReport } from '../slice/orderSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getSRDetails } from '../slice/userSlice';

const SrPerformancePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector(state => state.auth);
    const { srs } = useSelector(state => state.user);
    const { summary, loading, error } = useSelector(state => state.order);
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
        }
    }, [dispatch, username]);

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
        </div>
    );
};

export default SrPerformancePage;
