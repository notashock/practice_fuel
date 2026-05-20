import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function FleetDashboard() {

  const [vehicles, setVehicles] = useState([]);

  const [maintenance, setMaintenance] = useState([]);

  const [costSummary, setCostSummary] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {

    try {

      const [
        vehicleResponse,
        maintenanceResponse,
        costResponse,
      ] = await Promise.all([

        API.get("/vehicles"),

        API.get("/maintenance/overdue"),

        API.get("/costs/summary"),

      ]);

      setVehicles(vehicleResponse.data);

      setMaintenance(maintenanceResponse.data);

      setCostSummary(costResponse.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Vehicle Stats

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "ACTIVE"
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "UNDER_MAINTENANCE"
  ).length;

  const retiredVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "RETIRED"
  ).length;

  // Maintenance Stats

  const overdueMaintenance = maintenance.filter(
    (item) => item.status === "OVERDUE"
  ).length;

  // Cost Calculation

  const totalCost = costSummary.reduce(
    (acc, item) => acc + item.amount,
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

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Fleet Manager Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Fleet overview and maintenance insights
        </p>

      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

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
            Active Vehicles
          </p>

          <h2 className="text-4xl font-bold mt-2 text-green-500">
            {activeVehicles}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Under Maintenance
          </p>

          <h2 className="text-4xl font-bold mt-2 text-yellow-500">
            {maintenanceVehicles}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Retired Vehicles
          </p>

          <h2 className="text-4xl font-bold mt-2 text-red-500">
            {retiredVehicles}
          </h2>

        </div>

      </div>

      {/* Second Row */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Overdue Maintenance */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold">
              Overdue Maintenance
            </h2>

            <span className="bg-red-500 text-white px-4 py-1 rounded-full">
              {overdueMaintenance}
            </span>

          </div>

          <div className="space-y-4">

            {maintenance
              .filter(
                (item) =>
                  item.status === "OVERDUE"
              )
              .map((item) => (

                <div
                  key={item.id}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="font-semibold">
                        {
                          item.vehicle
                            ?.registrationNumber
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.scheduleType}
                      </p>

                    </div>

                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                      OVERDUE
                    </span>

                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    Next Service Due:
                    {" "}
                    {item.nextServiceDueKM} km
                  </p>

                </div>

              ))}

            {overdueMaintenance === 0 && (
              <p className="text-gray-500">
                No overdue maintenance found
              </p>
            )}

          </div>

        </div>

        {/* Cost Summary */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-5">
            Cost Summary
          </h2>

          <div className="mb-6">

            <p className="text-gray-500">
              Total Fleet Expenses
            </p>

            <h2 className="text-4xl font-bold mt-2 text-blue-600">
              ₹ {totalCost}
            </h2>

          </div>

          <div className="space-y-4">

            {costSummary.map((cost) => (

              <div
                key={cost.id}
                className="flex justify-between border-b pb-3"
              >

                <div>

                  <h3 className="font-semibold">
                    {
                      cost.vehicle
                        ?.registrationNumber
                    }
                  </h3>

                  <p className="text-sm text-gray-500">
                    {cost.costType}
                  </p>

                </div>

                <p className="font-semibold">
                  ₹ {cost.amount}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Vehicle Status Table */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Vehicle Overview
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
                className="border-b hover:bg-gray-50"
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