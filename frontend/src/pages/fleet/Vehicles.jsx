import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import UpdateOdometerModal from "../../components/UpdateOdometerModal";
import RetireVehicleModal from "../../components/RetireVehicleModal";
import { useAuth } from "../../context/AuthContext";

export default function Vehicles() {

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const { user } = useAuth();
  const isFleetManager = user?.role === "FLEET_MANAGER";

const [retireVehicle, setRetireVehicle] = useState(null);

const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVehicles = async () => {

    try {

      const response = await API.get("/vehicles");

      setVehicles(response.data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Vehicles
        </h1>

      <button
  onClick={() => navigate("/fleet/vehicles/add")}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  Add Vehicle
</button>

      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-200">

            <tr>

              <th className="p-4 text-left">Registration</th>

              <th className="p-4 text-left">Type</th>

              <th className="p-4 text-left">Make</th>

              <th className="p-4 text-left">Fuel Type</th>

              <th className="p-4 text-left">Odometer</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {vehicles.map((vehicle) => (

              <tr
                key={vehicle.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {vehicle.registrationNumber}
                </td>

                <td className="p-4">
                  {vehicle.vehicleType}
                </td>

                <td className="p-4">
                  {vehicle.make}
                </td>

                <td className="p-4">
                  {vehicle.fuelType}
                </td>

                <td className="p-4">
                  {vehicle.odometerReading} km
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm
                      
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

                </td>

                <td className="p-4 flex gap-2">

                 <button
  onClick={() => navigate(`/fleet/vehicles/${vehicle.id}`)}
  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
>
  View
</button>

                  <button
  onClick={() => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  }}
  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
>
  Update KM
</button>

                 {isFleetManager && (
                   <button

  onClick={() => {
    setRetireVehicle(vehicle);
    setShowRetireModal(true);
  }}

  disabled={vehicle.status === "RETIRED"}

  className={`px-3 py-1 rounded-lg text-white

    ${
      vehicle.status === "RETIRED"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }
  `}
>
  Retire Vehicle
</button>
                 )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {loading && (
          <p className="p-5 text-center">
            Loading vehicles...
          </p>
        )}

      </div>
{showModal && selectedVehicle && (

  <UpdateOdometerModal
    vehicle={selectedVehicle}
    onClose={() => setShowModal(false)}
    onSuccess={fetchVehicles}
  />

)}
{showRetireModal && retireVehicle && (

  <RetireVehicleModal

    vehicle={retireVehicle}

    onClose={() => setShowRetireModal(false)}

    onSuccess={fetchVehicles}

  />

)}
    </DashboardLayout>
  );
}