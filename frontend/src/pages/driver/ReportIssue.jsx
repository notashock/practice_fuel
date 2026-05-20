import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function ReportIssue() {

  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    issueType: "",
    severity: "",
    description: "",
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

    if (!formData.severity) {

      setError("Issue severity is required");

      return;
    }

    try {

      setLoading(true);

      await API.post("/issues", {

        vehicleId: Number(formData.vehicleId),

        issueType: formData.issueType,

        severity: formData.severity,

        description: formData.description,
      });

      setSuccess(
        "Issue reported successfully"
      );

      navigate("/driver/issues");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to report issue"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold mb-6">
          Report Vehicle Issue
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

          {/* Issue Type */}

          <div>

            <label className="block mb-2 font-medium">
              Issue Type
            </label>

            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Issue Type
              </option>

              <option value="ENGINE">
                ENGINE
              </option>

              <option value="BRAKE">
                BRAKE
              </option>

              <option value="ELECTRICAL">
                ELECTRICAL
              </option>

              <option value="TIRE">
                TIRE
              </option>

              <option value="TRANSMISSION">
                TRANSMISSION
              </option>

              <option value="OTHER">
                OTHER
              </option>

            </select>

          </div>

          {/* Severity */}

          <div>

            <label className="block mb-2 font-medium">
              Severity
            </label>

            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Severity
              </option>

              <option value="LOW">
                LOW
              </option>

              <option value="MEDIUM">
                MEDIUM
              </option>

              <option value="HIGH">
                HIGH
              </option>

              <option value="CRITICAL">
                CRITICAL
              </option>

            </select>

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
              className="w-full border p-3 rounded-lg"
              placeholder="Describe the issue..."
              required
            />

          </div>

          {/* Alerts */}

          {formData.severity === "CRITICAL" && (

            <div className="md:col-span-2 bg-red-100 text-red-600 p-4 rounded-lg">

              CRITICAL issues must be resolved within 24 hours.

            </div>

          )}

          {formData.severity === "HIGH" && (

            <div className="md:col-span-2 bg-yellow-100 text-yellow-700 p-4 rounded-lg">

              HIGH severity issues must be resolved within 72 hours.

            </div>

          )}

          {/* Submit */}

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {loading
                ? "Reporting..."
                : "Report Issue"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}