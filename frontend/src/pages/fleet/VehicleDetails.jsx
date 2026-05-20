import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function VehicleDetails() {

  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);

  const [maintenanceRecords, setMaintenanceRecords] =
    useState([]);

  const [costSummary, setCostSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // Fetch Vehicle Details

  const fetchVehicleDetails = async () => {

    try {

      const [
        vehiclesResponse,
        maintenanceResponse,
        summaryResponse,
      ] = await Promise.all([

        API.get("/vehicles"),

        API.get(
          `/maintenance/vehicle/${id}`
        ),

        API.get(

          `/costs/summary?vehicleId=${id}&year=${new Date().getFullYear()}`
        ),
      ]);

      // Find Selected Vehicle

      const foundVehicle =
        vehiclesResponse.data.find(
          (vehicle) =>
            vehicle.id === Number(id)
        );

      setVehicle(foundVehicle);

      setMaintenanceRecords(
        maintenanceResponse.data
      );

      setCostSummary(
        summaryResponse.data
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  // Loading State

  if (loading) {

    return (

      <DashboardLayout>

        <p>Loading vehicle details...</p>

      </DashboardLayout>
    );
  }

  // Vehicle Not Found

  if (!vehicle) {

    return (

      <DashboardLayout>

        <p>Vehicle not found</p>

      </DashboardLayout>
    );
  }

  return (

    <DashboardLayout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Vehicle Details
        </h1>

        <p className="text-gray-500 mt-1">
          {
            vehicle.registrationNumber
          }
        </p>

      </div>

      {/* Vehicle Overview */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        {/* Vehicle Type */}

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Vehicle Type
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {vehicle.vehicleType}
          </h2>

        </div>

        {/* Fuel Type */}

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Fuel Type
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {vehicle.fuelType}
          </h2>

        </div>

        {/* Odometer */}

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Odometer Reading
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {vehicle.odometerReading} km
          </h2>

        </div>

        {/* Status */}

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Vehicle Status
          </p>

          <span
            className={`inline-block mt-3 px-4 py-2 rounded-full text-white text-sm

              ${
                vehicle.status === "ACTIVE"

                  ? "bg-green-500"

                  : vehicle.status ===
                    "UNDER_MAINTENANCE"

                  ? "bg-yellow-500"

                  : "bg-red-500"
              }
            `}
          >
            {vehicle.status}
          </span>

        </div>

      </div>

      {/* Cost Summary */}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Maintenance Cost Summary
        </h2>

        <div className="flex items-center justify-between">

          <div>

            <p className="text-gray-500">
              Total Maintenance Cost
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">

              ₹ {
                costSummary?.totalMaintenanceCost || 0
              }

            </h2>

          </div>

          <div className="text-right">

            <p className="text-gray-500">
              Year
            </p>

            <h3 className="text-2xl font-semibold mt-2">

              {costSummary?.year}

            </h3>

          </div>

        </div>

      </div>

      {/* Maintenance History */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Maintenance History
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Service Type
              </th>

              <th className="p-4 text-left">
                Cost
              </th>

              <th className="p-4 text-left">
                Parts Replaced
              </th>

              <th className="p-4 text-left">
                Remarks
              </th>

            </tr>

          </thead>

          <tbody>

            {maintenanceRecords.map((record) => (

              <tr
                key={record.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {record.serviceType}
                </td>

                <td className="p-4">
                  ₹ {record.cost}
                </td>

                <td className="p-4">
                  {
                    record.partsReplaced ||
                    "-"
                  }
                </td>

                <td className="p-4">
                  {record.remarks || "-"}
                </td>

              </tr>

            ))}

            {maintenanceRecords.length === 0 && (

              <tr>

                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500"
                >
                  No maintenance records found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}