import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import CompleteMaintenanceModal from "../../components/CompleteMaintenanceModal";
export default function Maintenance() {

  const [maintenances, setMaintenances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

const [selectedMaintenance, setSelectedMaintenance] = useState(null);
 const navigate = useNavigate();

  const fetchMaintenance = async () => {

    try {

      const response = await API.get(
        "/maintenance/overdue"
      );

      setMaintenances(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Maintenance Management
        </h1>
<button
  onClick={() =>
    navigate("/fleet/maintenance/schedule")
  }
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  Schedule Maintenance
</button>

      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-200">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Schedule Type
              </th>

              <th className="p-4 text-left">
                Last Service KM
              </th>

              <th className="p-4 text-left">
                Next Due KM
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {maintenances.map((maintenance) => (

              <tr
                key={maintenance.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {maintenance.vehicleRegistrationNumber}
                </td>

                <td className="p-4">
                  {maintenance.scheduleType}
                </td>

                <td className="p-4">
                  {maintenance.lastServiceKM} km
                </td>

                <td className="p-4">
                  {maintenance.nextServiceDueKM} km
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        maintenance.status === "COMPLETED"
                          ? "bg-green-500"

                          : maintenance.status === "OVERDUE"
                          ? "bg-red-500"

                          : maintenance.status === "IN_PROGRESS"
                          ? "bg-yellow-500"

                          : "bg-blue-500"
                      }
                    `}
                  >
                    {maintenance.status}
                  </span>

                </td>

                <td className="p-4 flex gap-2">

                 <button

  onClick={() => {
    setSelectedMaintenance(maintenance);
    setShowCompleteModal(true);
  }}

  disabled={
    maintenance.status === "COMPLETED"
  }

  className={`px-3 py-1 rounded-lg text-white

    ${
      maintenance.status === "COMPLETED"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }
  `}
>
  Complete
</button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {loading && (
          <p className="p-5 text-center">
            Loading maintenance records...
          </p>
        )}

      </div>
      {showCompleteModal && selectedMaintenance && (

  <CompleteMaintenanceModal

    maintenance={selectedMaintenance}

    onClose={() =>
      setShowCompleteModal(false)
    }

    onSuccess={fetchMaintenance}

  />

)}

    </DashboardLayout>
  );
}