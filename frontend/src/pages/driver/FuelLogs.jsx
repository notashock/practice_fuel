import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function FuelLogs() {

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({

    vehicleId: "",

    fuelAmountLiters: "",

    fuelCost: "",

    odometerAtRefill: "",

    fuelType: "",

    receiptUrl: "",
  });

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

    try {

      setLoading(true);

      await API.post(

        `/fuel-logs/vehicle/${formData.vehicleId}`,

        {

          fuelAmountLiters: Number(
            formData.fuelAmountLiters
          ),

          fuelCost: Number(
            formData.fuelCost
          ),

          odometerAtRefill: Number(
            formData.odometerAtRefill
          ),

          fuelType: formData.fuelType,

          receiptUrl: formData.receiptUrl,
        }
      );

      setSuccess(
        "Fuel log added successfully"
      );

      setFormData({

        vehicleId: "",

        fuelAmountLiters: "",

        fuelCost: "",

        odometerAtRefill: "",

        fuelType: "",

        receiptUrl: "",
      });

    } catch (err) {

      setError(

        err.response?.data?.message ||

        "Failed to log fuel"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Fuel Logs
          </h1>

          <p className="text-gray-500 mt-1">
            Record vehicle fuel refill
          </p>

        </div>

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
          className="space-y-6"
        >

          {/* Vehicle */}

          <div>

            <label className="block mb-2 font-medium">
              Select Vehicle
            </label>

            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
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
                </option>

              ))}

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
              Odometer Reading
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
                Choose Fuel Type
              </option>

              <option value="PETROL">
                Petrol
              </option>

              <option value="DIESEL">
                Diesel
              </option>

            </select>

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
              className="w-full border p-3 rounded-lg"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >

            {loading
              ? "Saving..."
              : "Log Fuel"}

          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}