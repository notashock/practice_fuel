import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {

  const { user } = useAuth();

  const role = user?.role;

  return (

    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">

      <h1 className="text-2xl font-bold mb-10 text-center">
        Fleet System
      </h1>

      <nav className="space-y-3">

        {/* ADMIN */}

        {role === "ADMIN" && (
          <>
            <Link
              to="/admin/dashboard"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Users
            </Link>

            <Link
              to="/admin/costs"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Costs
            </Link>
          </>
        )}

        {/* FLEET MANAGER */}

        {role === "FLEET_MANAGER" && (
          <>
            <Link
              to="/fleet/dashboard"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Dashboard
            </Link>

            <Link
              to="/fleet/vehicles"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Vehicles
            </Link>

            <Link
              to="/fleet/maintenance"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Maintenance
            </Link>

            <Link
              to="/fleet/costs"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Costs
            </Link>
          </>
        )}

        {/* DRIVER */}

        {role === "DRIVER" && (
          <>
            <Link
              to="/driver/dashboard"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Dashboard
            </Link>

            <Link
              to="/driver/fuel-logs"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Fuel Logs
            </Link>

            <Link
              to="/driver/issues"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Issues
            </Link>
          </>
        )}

        {/* MECHANIC */}

        {role === "MECHANIC" && (
          <>
            <Link
              to="/mechanic/dashboard"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Dashboard
            </Link>

            <Link
              to="/mechanic/issues"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Issues
            </Link>

            <Link
              to="/mechanic/maintenance"
              className="block hover:bg-gray-800 p-3 rounded-lg"
            >
              Maintenance
            </Link>
          </>
        )}

      </nav>
    </div>
  );
}