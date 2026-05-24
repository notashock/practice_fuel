import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function ReportIssue() {

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({

    vehicleId: "",

    issueType: "",

    severity: "",

    description: "",
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

        "/issues",

        {

          vehicleId: Number(
            formData.vehicleId
          ),

          issueType: formData.issueType,

          severity: formData.severity,

          description: formData.description,
        }
      );

      setSuccess(
        "Issue reported successfully"
      );

      setFormData({

        vehicleId: "",

        issueType: "",

        severity: "",

        description: "",
      });

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

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Report Vehicle Issue
          </h1>

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

          <select
  name="issueType"
  value={formData.issueType}
  onChange={handleChange}
  className="w-full border p-3 rounded-lg"
  required
>

  <option value="">
    Choose Issue Type
  </option>

  <option value="ENGINE">
    Engine
  </option>

  <option value="TRANSMISSION">
    Transmission
  </option>

  <option value="ELECTRICAL">
    Electrical
  </option>

  <option value="BRAKE">
    Brake
  </option>

  <option value="TIRE">
    Tire
  </option>

  <option value="OTHER">
    Other
  </option>

</select>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >

            <option value="">
              Choose Severity
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

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Issue Description"
            className="w-full border p-3 rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >

            {loading
              ? "Submitting..."
              : "Report Issue"}

          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}