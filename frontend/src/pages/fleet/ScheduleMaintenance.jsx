import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function ScheduleMaintenance() {

  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    scheduleType: "",
    serviceIntervalKM: 5000,
    lastServiceKM: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      // only ACTIVE vehicles
      const activeVehicles = response.data.filter(
        (vehicle) => vehicle.status === "ACTIVE"
      );

      setVehicles(activeVehicles);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    // validation
    if (
      Number(formData.serviceIntervalKM) < 1000
    ) {

      setError(
        "Service interval cannot be less than 1000 km"
      );

      return;
    }

    const nextServiceDueKM =
      Number(formData.lastServiceKM) +
      Number(formData.serviceIntervalKM);

    try {

      setLoading(true);

      await API.post(
        "/maintenance/schedule",
        {
          vehicleId: Number(formData.vehicleId),

          scheduleType: formData.scheduleType,

          serviceIntervalKM: Number(
            formData.serviceIntervalKM
          ),

          lastServiceKM: Number(
            formData.lastServiceKM
          ),

          nextServiceDueKM,
        }
      );

      setSuccess(
        "Maintenance scheduled successfully"
      );

      navigate("/fleet/maintenance");

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

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold mb-6">
          Schedule Maintenance
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {success && (
          <p className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">
            {success}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          {/* Vehicle */}

          <div>

            <label className="block mb-2 font-medium">
              Vehicle
            </label>

            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Vehicle
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

          {/* Schedule Type */}

          <div>

            <label className="block mb-2 font-medium">
              Schedule Type
            </label>

            <select
              name="scheduleType"
              value={formData.scheduleType}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Type
              </option>

              <option value="PREVENTIVE">
                PREVENTIVE
              </option>

              <option value="BREAKDOWN">
                BREAKDOWN
              </option>

              <option value="INSPECTION">
                INSPECTION
              </option>

            </select>

          </div>

          {/* Service Interval */}

          <div>

            <label className="block mb-2 font-medium">
              Service Interval KM
            </label>

            <input
              type="number"
              name="serviceIntervalKM"
              value={formData.serviceIntervalKM}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Last Service */}

          <div>

            <label className="block mb-2 font-medium">
              Last Service KM
            </label>

            <input
              type="number"
              name="lastServiceKM"
              value={formData.lastServiceKM}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Button */}

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {loading
                ? "Scheduling..."
                : "Schedule Maintenance"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}