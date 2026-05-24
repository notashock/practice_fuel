import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function Costs() {

  const [vehicles, setVehicles] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);

  // Fetch Vehicles

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      setVehicles(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // Fetch Summary

  const fetchSummary = async (vehicleId) => {

    try {

      setLoading(true);

      const response = await API.get(

        `/costs/summary?vehicleId=${vehicleId}&year=${new Date().getFullYear()}`
      );

      setSummary(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchVehicles();

  }, []);

  // Vehicle Change

  const handleVehicleChange = (e) => {

    const vehicleId = e.target.value;

    setSelectedVehicle(vehicleId);

    if (vehicleId) {

      fetchSummary(vehicleId);
    }
  };

  // Total Expenses

  const totalExpenses =
    summary?.totalMaintenanceCost || 0;

  return (

    <DashboardLayout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Cost Tracking
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor fleet maintenance expenses
        </p>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Total Expenses
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            ₹ {totalExpenses}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Summary Records
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {summary ? 1 : 0}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Vehicles Tracked
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {vehicles.length}
          </h2>

        </div>

      </div>

      {/* Vehicle Selection */}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">

        <label className="block mb-3 font-medium">
          Select Vehicle
        </label>

        <select
          value={selectedVehicle}
          onChange={handleVehicleChange}
          className="w-full md:w-96 border p-3 rounded-lg"
        >

          <option value="">
            Choose Vehicle
          </option>

          {vehicles.map((vehicle) => (

            <option
              key={vehicle.id}
              value={vehicle.id}
            >
              {vehicle.registrationNumber}
            </option>

          ))}

        </select>

      </div>

      {/* Summary Section */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Maintenance Cost Summary
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle ID
              </th>

              <th className="p-4 text-left">
                Year
              </th>

              <th className="p-4 text-left">
                Total Maintenance Cost
              </th>

            </tr>

          </thead>

          <tbody>

            {summary && (

              <tr className="border-b hover:bg-gray-50">

                <td className="p-4">
                  {summary.vehicleId}
                </td>

                <td className="p-4">
                  {summary.year}
                </td>

                <td className="p-4 font-semibold">
                  ₹ {summary.totalMaintenanceCost}
                </td>

              </tr>

            )}

            {!loading && !summary && (

              <tr>

                <td
                  colSpan="3"
                  className="text-center p-6 text-gray-500"
                >
                  Select a vehicle to view summary
                </td>

              </tr>

            )}

            {loading && (

              <tr>

                <td
                  colSpan="3"
                  className="text-center p-6"
                >
                  Loading summary...
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}