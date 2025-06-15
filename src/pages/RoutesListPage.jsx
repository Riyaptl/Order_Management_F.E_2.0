import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAreas, deleteArea, updateArea, createArea, exportCSVArea } from "../slice/areaSlice";
import Navbar from "../components/NavbarComponents";
import toast from "react-hot-toast";
import { FaTrash, FaEdit } from "react-icons/fa"; // Top of the file
import RenameRouteComponent from "../components/RenameRouteComponents";
import CreateRouteComponents from "../components/CeateRouteComponents";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";



const RoutesListPage = () => {
  const dispatch = useDispatch();
  const { allAreas, loading, error } = useSelector((state) => state.area);
  const { role } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedRouteName, setSelectedRouteName] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRouteAreas, setSelectedRouteAreas] = useState([]);
  const [distributorSearchTerm, setDistributorSearchTerm] = useState("");



  useEffect(() => {
    const fetchPagedAreas = async () => {
      try {
        const res = await dispatch(fetchAllAreas(currentPage)).unwrap();
        setTotalPages(res.totalPages);
      } catch (err) {
        toast.error("Failed to fetch routes");
      }
    };
    fetchPagedAreas();
  }, [dispatch, currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const res = await dispatch(deleteArea(id)).unwrap();
        toast.success(res.message)
        // setTimeout(() => {
        //   window.location.reload();
        // }, 500);
      } catch (err) {
        toast.error(err || "Could not delete route")
      }
    }
  };

  const handleUpdate = async (newName, newRoutes, newDist) => {
    if (!newName.trim()) {
      toast.error("Route name cannot be empty");
      return;
    }
    try {
      const res = await dispatch(updateArea({ id: selectedRouteId, name: newName, areas: newRoutes, distributor: newDist })).unwrap();
      toast.success(res.message || "Route updated successfully");
      setShowUpdateModal(false);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 500);
    } catch (err) {
      toast.error(err || "Could not update route");
    }
  };

  const handleCreate = async ({ name, routes, distributor }) => {
    if (!name.trim()) {
      toast.error("Route name cannot be empty");
      return;
    }

    try {
      const res = await dispatch(createArea({ name, areas: routes, distributor })).unwrap();
      toast.success(res.message || "Route created successfully");
      setShowCreateModal(false);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 500);
    } catch (err) {
      toast.error(err || "Could not create route");
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await dispatch(fetchAllAreas(currentPage)).unwrap();
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error("Failed to fetch routes");
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await dispatch(exportCSVArea()).unwrap();

      // Create a link to download the CSV file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Filename with current date for uniqueness
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `Routes_export_${dateStr}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV Export successful");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const trimmedSearchTerm = searchTerm.trim().toLowerCase();
  const trimmedDistributorSearchTerm = distributorSearchTerm.trim().toLowerCase();
  const filteredAreas = allAreas.filter((area) =>
    area.name.toLowerCase().includes(trimmedSearchTerm.toLowerCase()) &&
    area.distributor?.toLowerCase().includes(trimmedDistributorSearchTerm.toLowerCase())
  );


  return (
    <div className="p-4">
      <div className="flex justify-end md:justify-center mb-8">
          <Navbar />
        </div>
      <div className="flex justify-center mb-4">
        <h2 className="text-2xl font-semibold text-amber-700">Routes List</h2>
      </div>

      <div className="flex justify-end mb-4">
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-amber-600 text-white text-md rounded hover:bg-amber-700 transition ml-8"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 md:mt-0 ml-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition text-md"
          >
            + Create Route
          </button>
        </div>
        <div className="mt-4 md:mt-0 ml-8">
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-green-600 text-white text-md rounded hover:bg-green-700 transition"
        >
          CSV Export
        </button>
      </div>
      </div>

      

      <div className="flex gap-4 mb-4">
  <input
    type="text"
    placeholder="Search route name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-1/2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
  />
  <input
    type="text"
    placeholder="Search by distributor..."
    value={distributorSearchTerm}
    onChange={(e) => setDistributorSearchTerm(e.target.value)}
    className="w-1/2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
  />
</div>



      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full border border-gray-300 text-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Sr. No</th>
              <th className="border p-2 text-left">Route Name</th>
              <th className="border p-2 text-left">Areas Included</th>
              <th className="border p-2 text-left">Distributor</th>
              <th className="border p-2 text-left">Route Created By</th>
              <th className="border p-2 text-left">Route Created At</th>
              <th className="border p-2 text-left">Route Updated By</th>
              <th className="border p-2 text-left">Route Updated At</th>
              <th className="border p-2 text-left min-w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAreas.map((area, index) => (
              <tr key={area._id} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{area.name}</td>
                <td className="border p-2 max-w-[200px] overflow-x-auto whitespace-nowrap">
                  <div className="overflow-x-auto">{area.areas?.join(", ")}</div>
                </td>
                <td className="border p-2">{area.distributor}</td>
                <td className="border p-2">{area.createdBy}</td>
                <td className="border p-2">{new Date(area.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
                </td>
                <td className="border p-2">{area.updatedBy}</td>
                <td className="border p-2">{new Date(area.updatedAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
                </td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => handleDelete(area._id)}
                    className="text-red-600 hover:text-red-800 text-xl p-2"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRouteId(area._id);
                      setSelectedRouteName(area.name);
                      setSelectedRouteAreas(area.areas || []);
                      setSelectedDist(area.distributor || "")
                      setShowUpdateModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xl p-2"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <RenameRouteComponent
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdate}
        initialName={selectedRouteName}
        initialRoutes={selectedRouteAreas}
        initialDist={selectedDist}
      />
      <CreateRouteComponents
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaChevronLeft />
        </button>
        <span className="text-md text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaChevronRight />
        </button>
      </div>

    </div>
  );
};

export default RoutesListPage;
