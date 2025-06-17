import React from "react";
import {  useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavbarComponents";

export default function HomePage() {
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const isME = role === "me";


   const goToPerformanceReport = () => {
    navigate("/SR-report");
  };

  return (
    <div className="p-4">
        <div className="flex justify-end md:justify-center mb-8">
          <Navbar />
        </div>
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">

      <h1 className="text-3xl font-bold text-center text-amber-700 mb-6">
        Welcome to Dumyum Chocolates
      </h1>

      {!isME && (
        <div className="flex justify-center mt-10 mb-6 space-x-4">
          <button
            onClick={() => navigate("/shops_list")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold py-2 px-6 rounded-lg shadow-md transition min-w-[150px]"
          >
            Place Orders
          </button>
          <button
              onClick={goToPerformanceReport}
              className="bg-amber-600 text-white text-xl hover:bg-amber-700 font-semibold py-2 px-6 rounded-lg shadow-md transition min-w-[150px]"
            >
              Performance Report
            </button>
        </div>
      )}
    </div>
  </div>
  );
}
