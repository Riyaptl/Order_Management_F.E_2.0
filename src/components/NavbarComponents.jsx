import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slice/authSlice";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, role } = useSelector((state) => state.auth);
  const isAdmin = role === "admin";
  const isDistributor = role === "distributor";
  const isSR = role === "sr";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");

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
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <nav className="p-3 shadow-md bg-white z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Toggle aligned right */}
        <div className="md:hidden ml-auto">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-amber-700"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu Items */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } absolute top-16 left-0 w-full bg-white border-t md:border-none md:static md:flex md:space-x-4 md:items-center`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 px-4 py-4 md:p-0">
            {(isAdmin || isSR) && (
            <NavLink
              to="/"
              className="text-amber-700 px-2 py-2 rounded-md text-lg font-semibold"
            >
              Home
            </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/routes_list"
                className="text-amber-700 px-2 py-2 text-lg font-semibold"
              >
                Routes
              </NavLink>
            )}
            <NavLink
                to="/shops_list"
                className="text-amber-700 px-2 py-2 text-lg font-semibold"
              >
                Shops
              </NavLink>
            <NavLink
              to="/orders_list"
              className="text-amber-700 px-2 py-2 text-lg font-semibold"
            >
              Orders
            </NavLink>
            <NavLink
              to="/revoked_orders_list"
              className="text-amber-700 px-2 py-2 text-lg font-semibold"
            >
              Revoked Orders
            </NavLink>
            <NavLink
              to="/sales_report"
              className="text-amber-700 px-2 py-2 text-lg font-semibold"
            >
              Sales Report
            </NavLink>
            <NavLink
              to="/cancel_report"
              className="text-amber-700 px-2 py-2 text-lg font-semibold"
            >
              Cancel Report
            </NavLink>
            <button
              onClick={handleLogout}
              className="mt-2 md:mt-0 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
