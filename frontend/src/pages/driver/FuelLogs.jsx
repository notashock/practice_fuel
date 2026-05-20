import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
export default function FuelLogs() {

  const [vehicles, setVehicles] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [fuelLogs, setFuelLogs] = useState([]);

  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  // Fetch Vehicles

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      setVehicles(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // Fetch Fuel Logs

  const fetchFuelLogs = async (vehicleId) => {

    try {

      setLoading(true);

      const response = await API.get(
        `/fuel-logs/vehicle/${vehicleId}`
      );

      setFuelLogs(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleChange = (e) => {

    const vehicleId = e.target.value;

    setSelectedVehicle(vehicleId);

    if (vehicleId) {
      fetchFuelLogs(vehicleId);
    }
  };

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Fuel Logs
          </h1>
          <button
  onClick={() =>
    navigate("/driver/fuel-logs/add")
  }
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  Add Fuel Log
</button>

          <p className="text-gray-500 mt-1">
            Track fuel refill history
          </p>

        </div>

      </div>

      {/* Vehicle Selection */}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">

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

      {/* Fuel Logs Table */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-200">

            <tr>

              <th className="p-4 text-left">
                Date
              </th>

              <th className="p-4 text-left">
                Fuel Type
              </th>

              <th className="p-4 text-left">
                Fuel Amount
              </th>

              <th className="p-4 text-left">
                Fuel Cost
              </th>

              <th className="p-4 text-left">
                Odometer
              </th>

              <th className="p-4 text-left">
                Receipt
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
                  {new Date(
                    log.refillDate
                  ).toLocaleDateString()}
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

                <td className="p-4">

                  {log.receiptUrl ? (

                    <a
                      href={log.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>

                  ) : (

                    <span className="text-gray-400">
                      No Receipt
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {loading && (
          <p className="p-5 text-center">
            Loading fuel logs...
          </p>
        )}

        {!loading &&
          fuelLogs.length === 0 &&
          selectedVehicle && (

          <p className="p-5 text-center text-gray-500">
            No fuel logs found
          </p>

        )}

      </div>

    </DashboardLayout>
  );
}