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
      if (vehiclesResponse.data.length > 0) {

  const firstVehicleId =
    vehiclesResponse.data[0].id;

  const summaryResponse = await API.get(

    `/costs/summary?vehicleId=${firstVehicleId}&year=${new Date().getFullYear()}`
  );

  setSummary(summaryResponse.data);
}

      setIssues(issuesResponse.data);



    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // User Stats

  const totalUsers = users.length;

  const totalDrivers = users.filter(
    (user) => user.role === "DRIVER"
  ).length;

  const totalMechanics = users.filter(
    (user) => user.role === "MECHANIC"
  ).length;

  // Vehicle Stats

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "ACTIVE"
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "UNDER_MAINTENANCE"
  ).length;

  // Issue Stats

  const criticalIssues = issues.filter(
    (issue) => issue.severity === "CRITICAL"
  ).length;

  // Cost Summary

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

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Fleet system overview and analytics
        </p>

      </div>

      {/* Stats Cards */}

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
            Critical Issues
          </p>

          <h2 className="text-4xl font-bold text-red-500 mt-2">
            {criticalIssues}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Total Expenses
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            ₹ {totalExpenses}
          </h2>

        </div>

      </div>

      {/* Second Row */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* User Distribution */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-5">
            User Distribution
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between items-center">

              <p>Drivers</p>

              <span className="bg-green-500 text-white px-4 py-1 rounded-full">
                {totalDrivers}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <p>Mechanics</p>

              <span className="bg-yellow-500 text-white px-4 py-1 rounded-full">
                {totalMechanics}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <p>Fleet Managers</p>

              <span className="bg-blue-500 text-white px-4 py-1 rounded-full">

                {
                  users.filter(
                    (user) =>
                      user.role === "FLEET_MANAGER"
                  ).length
                }

              </span>

            </div>

            <div className="flex justify-between items-center">

              <p>Admins</p>

              <span className="bg-red-500 text-white px-4 py-1 rounded-full">

                {
                  users.filter(
                    (user) =>
                      user.role === "ADMIN"
                  ).length
                }

              </span>

            </div>

          </div>

        </div>

        {/* Vehicle Status */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-5">
            Vehicle Status
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between items-center">

              <p>Active Vehicles</p>

              <span className="bg-green-500 text-white px-4 py-1 rounded-full">
                {activeVehicles}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <p>Under Maintenance</p>

              <span className="bg-yellow-500 text-white px-4 py-1 rounded-full">
                {maintenanceVehicles}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <p>Retired Vehicles</p>

              <span className="bg-red-500 text-white px-4 py-1 rounded-full">

                {
                  vehicles.filter(
                    (vehicle) =>
                      vehicle.status === "RETIRED"
                  ).length
                }

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Recent Issues */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Open Issues
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Issue Type
              </th>

              <th className="p-4 text-left">
                Severity
              </th>

              <th className="p-4 text-left">
                Reported At
              </th>

            </tr>

          </thead>

          <tbody>

            {issues.map((issue) => (

              <tr
                key={issue.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {
                    issue.vehicle
                      ?.registrationNumber
                  }
                </td>

                <td className="p-4">
                  {issue.issueType}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        issue.severity === "LOW"
                          ? "bg-green-500"

                          : issue.severity === "MEDIUM"
                          ? "bg-yellow-500"

                          : issue.severity === "HIGH"
                          ? "bg-orange-500"

                          : "bg-red-500"
                      }
                    `}
                  >
                    {issue.severity}
                  </span>

                </td>

                <td className="p-4">

                  {
                    new Date(
                      issue.reportedAt
                    ).toLocaleDateString()
                  }

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}