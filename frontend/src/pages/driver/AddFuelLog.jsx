import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function AddFuelLog() {

  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    fuelAmountLiters: "",
    fuelCost: "",
    odometerAtRefill: "",
    fuelType: "",
    receiptUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Fetch Vehicles

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

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

    // Validation

    if (
      Number(formData.fuelAmountLiters) < 1
    ) {

      setError(
        "Fuel amount must be at least 1 liter"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(
        `/fuel-logs/vehicle/${formData.vehicleId}`,
        {
          fuelAmountLiters: Number(formData.fuelAmountLiters),
          fuelCost: Number(formData.fuelCost),
          odometerAtRefill: Number(formData.odometerAtRefill),
          fuelType: formData.fuelType,
          receiptUrl: formData.receiptUrl,
        }
      );

      setSuccess(
        "Fuel log added successfully"
      );

      navigate("/driver/fuel-logs");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to add fuel log"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold mb-6">
          Add Fuel Log
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

          {/* Fuel Type */}

          <div>

            <label className="block mb-2 font-medium">
              Fuel Type
            </label>

            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Fuel Type
              </option>

              <option value="DIESEL">
                DIESEL
              </option>

              <option value="PETROL">
                PETROL
              </option>

            </select>

          </div>

          {/* Fuel Amount */}

          <div>

            <label className="block mb-2 font-medium">
              Fuel Amount (Liters)
            </label>

            <input
              type="number"
              name="fuelAmountLiters"
              value={formData.fuelAmountLiters}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Fuel Cost */}

          <div>

            <label className="block mb-2 font-medium">
              Fuel Cost
            </label>

            <input
              type="number"
              name="fuelCost"
              value={formData.fuelCost}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Odometer */}

          <div>

            <label className="block mb-2 font-medium">
              Odometer At Refill
            </label>

            <input
              type="number"
              name="odometerAtRefill"
              value={formData.odometerAtRefill}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Receipt URL */}

          <div>

            <label className="block mb-2 font-medium">
              Receipt URL
            </label>

            <input
              type="text"
              name="receiptUrl"
              value={formData.receiptUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border p-3 rounded-lg"
            />

          </div>

          {/* Submit */}

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {loading
                ? "Saving..."
                : "Add Fuel Log"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}