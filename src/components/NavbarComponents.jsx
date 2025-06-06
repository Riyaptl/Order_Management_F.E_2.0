import { NavLink } from "react-router-dom";
import { logout } from "../slice/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, role } = useSelector((state) => state.auth);
  const isAdmin = role=="admin"
  const isDistributor = role=="distributor"
  const isSR = role=="sr"
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      dispatch(logout({username: user, logoutLoc}));
      navigate("/login");
    } catch (error) {
      toast.error("Failed to fetch routes");
    }
  };

  return (
    <nav className="p-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="space-x-4">
        {(isAdmin || isSR) &&(
          <NavLink
            to="/"
            className={({ isActive }) =>
              ` text-amber-700 px-2 py-2 rounded-md text-lg font-medium`
            }
          >
            Home
          </NavLink>
        )}
        {isAdmin && (
          <NavLink
            to="/routes_list"
            className={({ isActive }) =>
              `text-amber-700 px-2 py-2 rounded-md text-lg font-medium`
            }
          >
            Routes
          </NavLink>
        )}
        {(isAdmin || isSR) && (
          <NavLink
          to="/shops_list"
          className={({ isActive }) =>
            ` text-amber-700 px-2 py-2 rounded-md text-lg font-medium`
          }
          >
            Shops
          </NavLink>
        )}
          <NavLink
          to="/orders_list"
          className={({ isActive }) =>
            ` text-amber-700 px-2 py-2 rounded-md text-lg font-medium`
          }
          >
            Orders
          </NavLink>
        {(isAdmin || isDistributor) && (
          <NavLink
            to="/sales_report"
            className={({ isActive }) =>
              ` text-amber-700 px-2 py-2 rounded-md text-lg font-medium`
            }
          >
            Sales Report
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="mt-3 md:mt-0 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md text-md font-medium"
        >
          Logout
        </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
