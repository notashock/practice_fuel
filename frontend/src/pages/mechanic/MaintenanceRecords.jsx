import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function MaintenanceRecords() {

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    vehicleId: "",
    maintenanceType: "",
    description: "",
    partsReplaced: "",
    maintenanceCost: "",
    serviceDate: "",
  });

  // Fetch Vehicles

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      setVehicles(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle Change

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation

    if (
      Number(formData.maintenanceCost) < 70
    ) {

      setError(
        "Maintenance cost must be at least 70"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(
        `/maintenance/records?vehicleId=${Number(formData.vehicleId)}`,
        {
          serviceType: formData.maintenanceType,
          remarks: formData.description,
          partsReplaced: formData.partsReplaced,
          cost: Number(formData.maintenanceCost),
        }
      );

      setSuccess(
        "Maintenance record added successfully"
      );

      setFormData({
        vehicleId: "",
        maintenanceType: "",
        description: "",
        partsReplaced: "",
        maintenanceCost: "",
        serviceDate: "",
      });

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to save maintenance record"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6">
          Maintenance Records
        </h1>

        <p className="text-gray-500 mb-8">
          Record completed maintenance and repairs
        </p>

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

          {/* Maintenance Type */}

          <div>

            <label className="block mb-2 font-medium">
              Maintenance Type
            </label>

            <select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Type
              </option>

              <option value="OIL_CHANGE">
                OIL_CHANGE
              </option>

              <option value="TIRE_ROTATION">
                TIRE_ROTATION
              </option>

              <option value="ENGINE_REPAIR">
                ENGINE_REPAIR
              </option>

              <option value="BRAKE_SERVICE">
                BRAKE_SERVICE
              </option>

              <option value="GENERAL">
                GENERAL
              </option>

            </select>

          </div>

          {/* Cost */}

          <div>

            <label className="block mb-2 font-medium">
              Maintenance Cost
            </label>

            <input
              type="number"
              name="maintenanceCost"
              value={formData.maintenanceCost}
              onChange={handleChange}
              placeholder="Enter maintenance cost"
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Service Date */}

          <div>

            <label className="block mb-2 font-medium">
              Service Date
            </label>

            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Parts Replaced */}

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">
              Parts Replaced
            </label>

            <input
              type="text"
              name="partsReplaced"
              value={formData.partsReplaced}
              onChange={handleChange}
              placeholder="Brake pads, filters, tires..."
              className="w-full border p-3 rounded-lg"
            />

          </div>

          {/* Description */}

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe maintenance performed..."
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
                ? "Saving..."
                : "Save Maintenance Record"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}