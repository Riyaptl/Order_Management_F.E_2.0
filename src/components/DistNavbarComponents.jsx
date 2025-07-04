import { NavLink } from "react-router-dom";

const DistNavbar = () => {
  return (
    <nav className="p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="space-x-4">
          <NavLink
            to="/orders_list"
            className={({ isActive }) =>
              ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
            }
          >
            Orders
          </NavLink>
          <NavLink
            to="/sales_report"
            className={({ isActive }) =>
              ` text-amber-700 px-3 py-2 rounded-md text-sm font-medium`
            }
          >
            Sales Report
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default DistNavbar;
