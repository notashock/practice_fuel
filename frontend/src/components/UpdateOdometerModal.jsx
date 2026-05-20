import { useState } from "react";
import API from "../api/axios";

export default function UpdateOdometerModal({
  vehicle,
  onClose,
  onSuccess,
}) {

  const [odometerReading, setOdometerReading] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    // Validation
    if (
      Number(odometerReading) <= vehicle.odometerReading
    ) {
      setError(
        "Odometer reading must be greater than previous reading"
      );

      return;
    }

    try {

      setLoading(true);

      await API.put(
        `/vehicles/${vehicle.id}/odometer?reading=${Number(odometerReading)}`
      );

      onSuccess();

      onClose();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to update odometer"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-5">
          Update Odometer
        </h2>

        <p className="mb-4 text-gray-600">
          Current Reading:
          <span className="font-semibold">
            {" "} {vehicle.odometerReading} km
          </span>
        </p>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="number"
            placeholder="Enter New Odometer Reading"
            value={odometerReading}
            onChange={(e) =>
              setOdometerReading(e.target.value)
            }
            className="w-full border p-3 rounded-lg"
            required
          />

          <div className="flex gap-3">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {loading ? "Updating..." : "Update"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}