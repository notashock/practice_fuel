import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function DriverDashboard() {

  const [fuelLogs, setFuelLogs] = useState([]);

  const [issues, setIssues] = useState([]);

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {

    try {

      const [
        vehiclesResponse,
        issuesResponse,
      ] = await Promise.all([

        API.get("/vehicles"),

        API.get("/issues/open"),

      ]);

      setVehicles(vehiclesResponse.data);

      setIssues(issuesResponse.data);

      // fetch fuel logs for first vehicle

      if (
        vehiclesResponse.data.length > 0
      ) {

        const vehicleId =
          vehiclesResponse.data[0].id;

        const fuelResponse = await API.get(
          `/fuel-logs/vehicle/${vehicleId}`
        );

        setFuelLogs(fuelResponse.data);
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

  // Fuel Summary

  const totalFuelCost = fuelLogs.reduce(
    (acc, item) => acc + item.fuelCost,
    0
  );

  const totalFuelLiters = fuelLogs.reduce(
    (acc, item) =>
      acc + item.fuelAmountLiters,
    0
  );

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
          Driver Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Fuel logs and issue tracking overview
        </p>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Fuel Logs
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {fuelLogs.length}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Total Fuel Cost
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            ₹ {totalFuelCost}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Fuel Consumed
          </p>

          <h2 className="text-4xl font-bold text-green-500 mt-2">
            {totalFuelLiters} L
          </h2>

        </div>

      </div>

      {/* Recent Fuel Logs */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto mb-8">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Recent Fuel Logs
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Date
              </th>

              <th className="p-4 text-left">
                Fuel Type
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Cost
              </th>

              <th className="p-4 text-left">
                Odometer
              </th>

            </tr>

          </thead>

          <tbody>

            {fuelLogs.map((log) => (

              <tr
                key={log.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">

                  {
                    new Date(
                      log.refillDate
                    ).toLocaleDateString()
                  }

                </td>

                <td className="p-4">
                  {log.fuelType}
                </td>

                <td className="p-4">
                  {log.fuelAmountLiters} L
                </td>

                <td className="p-4">
                  ₹ {log.fuelCost}
                </td>

                <td className="p-4">
                  {log.odometerAtRefill} km
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Open Issues */}

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
                Description
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
                  {issue.description}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}