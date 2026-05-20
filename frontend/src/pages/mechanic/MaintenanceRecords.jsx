import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function MaintenanceRecords() {

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({

    vehicleId: "",

    serviceType: "",

    cost: "",

    partsReplaced: "",

    remarks: "",
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

  // Handle Input

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // Submit Maintenance Record

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");

    // Validation

    if (Number(formData.cost) < 70) {

      setError(
        "Maintenance cost must be greater than or equal to 70"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(

        "/maintenance/records",

        {

          vehicleId: Number(
            formData.vehicleId
          ),

          serviceType:
            formData.serviceType,

          cost: Number(formData.cost),

          partsReplaced:
            formData.partsReplaced,

          remarks: formData.remarks,
        }
      );

      setSuccess(
        "Maintenance record added successfully"
      );

      setFormData({

        vehicleId: "",

        serviceType: "",

        cost: "",

        partsReplaced: "",

        remarks: "",
      });

    } catch (err) {

      setError(

        err.response?.data?.message ||

        "Failed to add maintenance record"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Maintenance Records
          </h1>

          <p className="text-gray-500 mt-1">
            Record vehicle maintenance performed
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

          {/* Service Type */}

          <div>

            <label className="block mb-2 font-medium">
              Service Type
            </label>

            <select
  name="serviceType"
  value={formData.serviceType}
  onChange={handleChange}
  className="w-full border p-3 rounded-lg"
  required
>

  <option value="">
    Choose Service Type
  </option>

  <option value="GENERAL">
    General Service
  </option>

  <option value="BRAKE_SERVICE">
    Brake Service
  </option>

  <option value="ENGINE_REPAIR">
    Engine Repair
  </option>

  <option value="TIRE_ROTATION">
    Tire Rotation
  </option>

  <option value="OIL_CHANGE">
    Oil Change
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
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Enter maintenance cost"
              className="w-full border p-3 rounded-lg"
              required
            />

          </div>

          {/* Parts Replaced */}

          <div>

            <label className="block mb-2 font-medium">
              Parts Replaced
            </label>

            <input
              type="text"
              name="partsReplaced"
              value={formData.partsReplaced}
              onChange={handleChange}
              placeholder="Enter replaced parts"
              className="w-full border p-3 rounded-lg"
            />

          </div>

          {/* Remarks */}

          <div>

            <label className="block mb-2 font-medium">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Additional remarks"
              rows="4"
              className="w-full border p-3 rounded-lg"
            />

          </div>

          {/* Rules */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <h3 className="font-semibold text-blue-700 mb-2">
              Maintenance Rules
            </h3>

            <ul className="text-sm text-gray-700 space-y-1">

              <li>
                • Maintenance cost must be ≥ 70
              </li>

              <li>
                • Maintenance automatically generates vehicle cost records
              </li>

              <li>
                • Mechanic user will be recorded automatically
              </li>

            </ul>

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >

            {loading
              ? "Saving..."
              : "Add Maintenance Record"}

          </button>

        </form>

      </div>

    </DashboardLayout>
  );
} 