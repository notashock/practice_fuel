import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function AddVehicle() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registrationNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    yearOfManufacture: "",
    fuelType: "",
    odometerReading: "",
    totalValue: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateRegistration = (number) => {

    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

    return regex.test(number);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateRegistration(formData.registrationNumber)) {

      setError(
        "Registration number format should be like KA01AB1234"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post("/vehicles", {
        ...formData,
        odometerReading: Number(formData.odometerReading),
        yearOfManufacture: Number(formData.yearOfManufacture),
        totalValue: Number(formData.totalValue),
      });

      setSuccess("Vehicle registered successfully");

      navigate("/fleet/vehicles");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to register vehicle"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold mb-6">
          Register Vehicle
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

          <div>
            <label className="block mb-2 font-medium">
              Registration Number
            </label>

            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="KA01AB1234"
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Vehicle Type
            </label>

            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >
              <option value="">Select Type</option>
              <option value="TRUCK">TRUCK</option>
              <option value="BUS">BUS</option>
              <option value="VAN">VAN</option>
              <option value="CAR">CAR</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Make
            </label>

            <select
              name="make"
              value={formData.make}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >
              <option value="">Select Make</option>
              <option value="TATA">TATA</option>
              <option value="ASHOK_LEYLAND">ASHOK LEYLAND</option>
              <option value="VOLVO">VOLVO</option>
              <option value="MARUTI">MARUTI</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Model
            </label>

            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Year Of Manufacture
            </label>

            <input
              type="number"
              name="yearOfManufacture"
              value={formData.yearOfManufacture}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

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
              <option value="">Select Fuel Type</option>
              <option value="DIESEL">DIESEL</option>
              <option value="PETROL">PETROL</option>
              <option value="CNG">CNG</option>
              <option value="EV">EV</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">
              Odometer Reading
            </label>

            <input
              type="number"
              name="odometerReading"
              value={formData.odometerReading}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">
              Total Vehicle Value (₹)
            </label>

            <input
              type="number"
              name="totalValue"
              placeholder="e.g., 1500000"
              value={formData.totalValue}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {loading ? "Registering..." : "Register Vehicle"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}