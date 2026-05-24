import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]);

  const [vehicles, setVehicles] = useState([]);

  const [issues, setIssues] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {

    try {

      const [
        usersResponse,
        vehiclesResponse,
        issuesResponse,
      ] = await Promise.all([

        API.get("/users"),

        API.get("/vehicles"),

        API.get("/issues/open"),

      ]);

      setUsers(usersResponse.data);

      setVehicles(vehiclesResponse.data);

      setIssues(issuesResponse.data);

      if (vehiclesResponse.data.length > 0) {

        const firstVehicleId =
          vehiclesResponse.data[0].id;

        const summaryResponse = await API.get(

          `/costs/summary?vehicleId=${firstVehicleId}&year=${new Date().getFullYear()}`
        );

        setSummary(summaryResponse.data);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "ACTIVE"
  ).length;

  const totalUsers = users.length;

  const openIssues = issues.length;

  const totalExpenses =
    summary?.totalMaintenanceCost || 0;

  if (loading) {

    return (

      <DashboardLayout>

        <p>Loading dashboard...</p>

      </DashboardLayout>
    );
  }

  return (

    <DashboardLayout>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          System overview and monitoring
        </p>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Total Users
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalUsers}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Total Vehicles
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalVehicles}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Open Issues
          </p>

          <h2 className="text-4xl font-bold text-red-500 mt-2">
            {openIssues}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Maintenance Expenses
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            ₹ {totalExpenses}
          </h2>

        </div>

      </div>

      {/* Vehicle Table */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Fleet Overview
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Registration
              </th>

              <th className="p-4 text-left">
                Vehicle Type
              </th>

              <th className="p-4 text-left">
                Odometer
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {vehicles.map((vehicle) => (

              <tr
                key={vehicle.id}
                className="border-b"
              >

                <td className="p-4">
                  {vehicle.registrationNumber}
                </td>

                <td className="p-4">
                  {vehicle.vehicleType}
                </td>

                <td className="p-4">
                  {vehicle.odometerReading} km
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        vehicle.status === "ACTIVE"
                          ? "bg-green-500"
                          : vehicle.status === "UNDER_MAINTENANCE"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    `}
                  >
                    {vehicle.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}