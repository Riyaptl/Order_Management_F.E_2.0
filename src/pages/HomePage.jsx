import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreas, setChoseArea } from "../slice/areaSlice";
import { logout } from "../slice/authSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavbarComponents";
import toast from "react-hot-toast";

export default function HomePage() {
  const dispatch = useDispatch();
  const { areas, loading, error, choseArea } = useSelector((state) => state.area);
  const { user, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [selectedArea, setSelectedArea] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchAreas({}));   
  }, [dispatch]);

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (area) => {
    setSelectedArea(area.name);
    setSearchTerm(area.name); 
    dispatch(setChoseArea(area._id));
    setShowDropdown(false);  
    navigate('/shops_list')
  };
  
  const handleLogout = async () => {
    try {
      const logoutLoc = await getCurrentLocation();
      dispatch(logout({username: user, logoutLoc}));
      navigate("/login");
    } catch (error) {
      toast.error("Failed to fetch routes");
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
    </div>
  </div>
  );
}
