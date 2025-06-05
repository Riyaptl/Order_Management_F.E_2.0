import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const { role } = useSelector((state) => state.auth);
  const isAdmin = role=="admin"
  const isDistributor = role=="distributor"
  const isSR = role=="sr"

  return (
    <nav className="p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="space-x-4">
        {(isAdmin || isSR) &&(
          <NavLink
            to="/"
            className={({ isActive }) =>
              ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
            }
          >
            Order Placement
          </NavLink>
        )}
        {isAdmin && (
          <NavLink
            to="/routes_list"
            className={({ isActive }) =>
              `text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
            }
          >
            Routes
          </NavLink>
        )}
        {(isAdmin || isSR) && (
          <NavLink
          to="/shops_list"
          className={({ isActive }) =>
            ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
          }
          >
            Shops
          </NavLink>
        )}
        {(isAdmin || isDistributor) && (
          <NavLink
          to="/orders_list"
          className={({ isActive }) =>
            ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
          }
          >
            Orders
          </NavLink>
        )}
        {(isAdmin || isDistributor) && (
          <NavLink
            to="/sales_report"
            className={({ isActive }) =>
              ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
            }
          >
            Sales Report
          </NavLink>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
