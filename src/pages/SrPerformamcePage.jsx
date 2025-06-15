import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { callsReport, salesReport, SrReport } from '../slice/orderSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/NavbarComponents";
import { getSRDetails } from '../slice/userSlice';

const SrPerformancePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector(state => state.auth);
    const { srs } = useSelector(state => state.user);
    const { summary, calls, loading, error } = useSelector(state => state.order);
    const [showCurrentMonth, setShowCurrentMonth] = useState(false);
    const [username, setUsername] = useState('');
    const [report, setReport] = useState([])

    useEffect(() => {
        if (role === "sr" && user) {
            setUsername(user)
        }
    }, [role, user])

    const dispatchReports = async (dispatch, username) => {
        try {
            await dispatch(SrReport({ username })).unwrap();  
            dispatch(callsReport({ username }));              
        } catch (error) {
            console.error("SrReport failed:", error);
        }
    };

    // Inside useEffect or component
    useEffect(() => {
        if (username) {
            dispatchReports(dispatch, username);
        }
    }, [username]);

    useEffect(() => {
        if (username) {
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
        if (username && Array.isArray(summary) && Array.isArray(calls)) {
            
            const callsMap = new Map(
                calls.map(({ date, tc = 0, pc = 0 }) => [date, { tc, pc }])
            );

            // Merge calls data into summary
            const mergedReport = summary.map((entry) => {
                const { date } = entry;
                const callData = callsMap.get(date) || { tc: 0, pc: 0 };
                return {
                    ...entry,
                    tc: callData.tc,
                    pc: callData.pc,
                };
            });
            setReport(mergedReport);
        } else {
            setReport([]);
        }
    }, [username, summary, calls]);


    return (
        <div className="p-4 max-w-5xl mx-auto bg-white shadow-lg rounded-lg relative">
                <div className="flex justify-end md:justify-center mb-8">
                          <Navbar />
                        </div>
            <h1 className="text-2xl font-bold text-amber-700 mb-10 text-center">Performance Report</h1>

            {error && <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>}
            {role === 'admin' && (
                <div className="mb-8">
                    <label className="block text-gray-700 text-lg mb-2">
                        Select SR <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full text-lg border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
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

            {loading && (<p className="text-center mt-10 text-amber-600 font-semibold">Loading report...</p>)}
            {!loading && 
            <>
            <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 text-md">
                    <thead className="bg-amber-100 text-gray-700">
                        <tr>
                            <th className="p-2 border min-w-[150px]">Date</th>
                            <th className="p-2 border min-w-[80px]">TC</th>
                            <th className="p-2 border min-w-[80px]">PC</th>
                            <th className="p-2 border min-w-[150px]">Ordered Regular 50g</th>
                            <th className="p-2 border min-w-[150px]">Ordered Coffee 50g</th>
                            <th className="p-2 border min-w-[150px]">Ordered Regular 25g</th>
                            <th className="p-2 border min-w-[150px]">Ordered Coffee 25g</th>
                            <th className="p-2 border min-w-[150px]">Cancelled Regular 50g</th>
                            <th className="p-2 border min-w-[150px]">Cancelled Coffee 50g</th>
                            <th className="p-2 border min-w-[150px]">Cancelled Regular 25g</th>
                            <th className="p-2 border min-w-[150px]">Cancelled Coffee 25g</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((entry) => (
                            <tr className="hover:bg-gray-50">
                                <td className="border p-2">{entry.date}</td>
                                <td className="border p-2">{entry.tc}</td>
                                <td className="border p-2">{entry.pc}</td>
                                <td className="border p-2">{entry["Ordered Regular 50g"]}</td>
                                <td className="border p-2">{entry["Ordered Coffee 50g"]}</td>
                                <td className="border p-2">{entry["Ordered Regular 25g"]}</td>
                                <td className="border p-2">{entry["Ordered Coffee 25g"]}</td>
                                <td className="border p-2">{entry["Cancelled Regular 50g"]}</td>
                                <td className="border p-2">{entry["Cancelled Coffee 50g"]}</td>
                                <td className="border p-2">{entry["Cancelled Regular 25g"]}</td>
                                <td className="border p-2">{entry["Cancelled Coffee 25g"]}</td>
                            </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            </>}
        </div>
    );
};

export default SrPerformancePage;
