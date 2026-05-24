import { useState } from "react";
import API from "../api/axios";

export default function RetireVehicleModal({
  vehicle,
  onClose,
  onSuccess,
}) {

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleRetire = async () => {

    try {

      setLoading(true);

      await API.put(
        `/vehicles/${vehicle.id}/retire`
      );

      onSuccess();

      onClose();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to retire vehicle"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4 text-red-500">
          Retire Vehicle
        </h2>

        <p className="text-gray-700 mb-5">

          Are you sure you want to retire vehicle

          <span className="font-semibold">
            {" "} {vehicle.registrationNumber}
          </span>?

        </p>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">

          <button
            onClick={handleRetire}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
          >
            {loading ? "Retiring..." : "Retire"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}