import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function VehicleDetails() {

  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchVehicle = async () => {

    try {

      const response = await API.get(`/vehicles/${id}`);

      setVehicle(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading vehicle details...</p>
      </DashboardLayout>
    );
  }

  return (

    <DashboardLayout>

      <div className="bg-white rounded-xl shadow-md p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              {vehicle.registrationNumber}
            </h1>

            <p className="text-gray-500 mt-1">
              Vehicle Details
            </p>

          </div>

          <span
            className={`px-4 py-2 rounded-full text-white font-medium
              
              ${
                vehicle.status === "ACTIVE"
                  ? "bg-green-500"
                  : vehicle.status === "UNDER_MAINTENANCE"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
            `}
          >
            {vehicle.status}
          </span>

        </div>

        {/* Vehicle Info */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Vehicle Type
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.vehicleType}
            </h3>

          </div>

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Make
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.make}
            </h3>

          </div>

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Model
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.model}
            </h3>

          </div>

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Fuel Type
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.fuelType}
            </h3>

          </div>

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Odometer Reading
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.odometerReading} km
            </h3>

          </div>

          <div className="bg-gray-100 p-5 rounded-lg">

            <p className="text-gray-500 mb-1">
              Year Of Manufacture
            </p>

            <h3 className="text-xl font-semibold">
              {vehicle.yearOfManufacture}
            </h3>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}