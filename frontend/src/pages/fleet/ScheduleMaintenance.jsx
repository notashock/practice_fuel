import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function ScheduleMaintenance() {

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [selectedVehicle, setSelectedVehicle] =
    useState("");

  // Fetch Vehicles

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      // Show only ACTIVE vehicles

      const activeVehicles =
        response.data.filter(
          (vehicle) =>
            vehicle.status === "ACTIVE"
        );

      setVehicles(activeVehicles);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Schedule Maintenance

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");

    if (!selectedVehicle) {

      setError("Please select a vehicle");

      return;
    }

    try {

      setLoading(true);

      await API.post(

        `/maintenance/schedule?vehicleId=${selectedVehicle}`
      );

      setSuccess(
        "Maintenance scheduled successfully"
      );

      setSelectedVehicle("");

      fetchVehicles();

    } catch (err) {

      setError(

        err.response?.data?.message ||

        "Failed to schedule maintenance"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Schedule Maintenance
          </h1>

          <p className="text-gray-500 mt-1">
            Assign vehicle for preventive maintenance
          </p>

        </div>

        {/* Alerts */}

        {error && (

          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">

            {error}

          </div>

        )}

        {success && (

          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-5">

            {success}

          </div>

        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Vehicle Selection */}

          <div>

            <label className="block mb-2 font-medium">
              Select Vehicle
            </label>

            <select
              value={selectedVehicle}
              onChange={(e) =>
                setSelectedVehicle(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg"
              required
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
                  {" - "}
                  {vehicle.vehicleType}
                </option>

              ))}

            </select>

          </div>

          {/* Info Box */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <h3 className="font-semibold text-blue-700 mb-2">
              Maintenance Rules
            </h3>

            <ul className="text-sm text-gray-700 space-y-1">

              <li>
                • Preventive maintenance interval:
                5,000 km
              </li>

              <li>
                • Vehicle status changes to
                UNDER_MAINTENANCE
              </li>

              <li>
                • Only ACTIVE vehicles can be
                scheduled
              </li>

            </ul>

          </div>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >

            {loading
              ? "Scheduling..."
              : "Schedule Maintenance"}

          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}