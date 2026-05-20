import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function Costs() {

  const [vehicles, setVehicles] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [costs, setCosts] = useState([]);

  const [summary, setSummary] = useState([]);

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

  const fetchSummary = async () => {

    try {

      const response = await API.get(
        "/costs/summary"
      );

      setSummary(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // Fetch Vehicle Costs

  const fetchVehicleCosts = async (vehicleId) => {

    try {

      setLoading(true);

      const response = await API.get(
        `/costs/vehicle/${vehicleId}`
      );

      setCosts(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchVehicles();

    fetchSummary();

  }, []);

  const handleVehicleChange = (e) => {

    const vehicleId = e.target.value;

    setSelectedVehicle(vehicleId);

    if (vehicleId) {
      fetchVehicleCosts(vehicleId);
    }
  };

  // Total Summary Cost

  const totalExpenses = summary.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  return (

    <DashboardLayout>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Cost Tracking
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor fleet expenses and vehicle costs
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
            Expense Records
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {summary.length}
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

      {/* Vehicle Costs */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto mb-8">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Vehicle Expense History
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Cost Type
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Recorded At
              </th>

              <th className="p-4 text-left">
                Remarks
              </th>

            </tr>

          </thead>

          <tbody>

            {costs.map((cost) => (

              <tr
                key={cost.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        cost.costType === "FUEL"
                          ? "bg-blue-500"

                          : cost.costType === "MAINTENANCE"
                          ? "bg-yellow-500"

                          : cost.costType === "ACCIDENT"
                          ? "bg-red-500"

                          : "bg-green-500"
                      }
                    `}
                  >
                    {cost.costType}
                  </span>

                </td>

                <td className="p-4">
                  ₹ {cost.amount}
                </td>

                <td className="p-4">
                  {
                    new Date(
                      cost.recordedAt
                    ).toLocaleDateString()
                  }
                </td>

                <td className="p-4">
                  {cost.remarks}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {!loading &&
          costs.length === 0 &&
          selectedVehicle && (

          <p className="p-6 text-center text-gray-500">
            No cost records found
          </p>

        )}

        {loading && (

          <p className="p-6 text-center">
            Loading cost records...
          </p>

        )}

      </div>

      {/* Summary Section */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Fleet Cost Summary
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Cost Type
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {summary.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {
                    item.vehicle
                      ?.registrationNumber
                  }
                </td>

                <td className="p-4">
                  {item.costType}
                </td>

                <td className="p-4 font-semibold">
                  ₹ {item.amount}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}