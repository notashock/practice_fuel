import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function MechanicDashboard() {

  const [issues, setIssues] = useState([]);

  const [maintenance, setMaintenance] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {

    try {

      const [
        issuesResponse,
        maintenanceResponse,
      ] = await Promise.all([

        API.get("/issues/open"),

        API.get("/maintenance/overdue"),

      ]);

      setIssues(issuesResponse.data);

      setMaintenance(maintenanceResponse.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats

  const totalIssues = issues.length;

  const criticalIssues = issues.filter(
    (issue) => issue.severity === "CRITICAL"
  ).length;

  const highIssues = issues.filter(
    (issue) => issue.severity === "HIGH"
  ).length;

  const overdueMaintenance = maintenance.filter(
    (item) => item.status === "OVERDUE"
  ).length;

  if (loading) {

    return (
      <DashboardLayout>
        <p>Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  return (

    <DashboardLayout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Mechanic Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Maintenance and issue management overview
        </p>

      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Open Issues
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalIssues}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Critical Issues
          </p>

          <h2 className="text-4xl font-bold text-red-500 mt-2">
            {criticalIssues}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            High Severity Issues
          </p>

          <h2 className="text-4xl font-bold text-orange-500 mt-2">
            {highIssues}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Overdue Maintenance
          </p>

          <h2 className="text-4xl font-bold text-yellow-500 mt-2">
            {overdueMaintenance}
          </h2>

        </div>

      </div>

      {/* Open Issues */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto mb-8">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Recent Open Issues
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Issue Type
              </th>

              <th className="p-4 text-left">
                Severity
              </th>

              <th className="p-4 text-left">
                Reported At
              </th>

            </tr>

          </thead>

          <tbody>

            {issues.map((issue) => (

              <tr
                key={issue.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">

                  {
                    issue.vehicle
                      ?.registrationNumber
                  }

                </td>

                <td className="p-4">
                  {issue.issueType}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        issue.severity === "LOW"
                          ? "bg-green-500"

                          : issue.severity === "MEDIUM"
                          ? "bg-yellow-500"

                          : issue.severity === "HIGH"
                          ? "bg-orange-500"

                          : "bg-red-500"
                      }
                    `}
                  >
                    {issue.severity}
                  </span>

                </td>

                <td className="p-4">

                  {
                    new Date(
                      issue.reportedAt
                    ).toLocaleDateString()
                  }

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {issues.length === 0 && (

          <p className="p-6 text-center text-gray-500">
            No open issues found
          </p>

        )}

      </div>

      {/* Maintenance Section */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Overdue Maintenance
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Schedule Type
              </th>

              <th className="p-4 text-left">
                Next Due KM
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {maintenance.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">

                  {
                    item.vehicle
                      ?.registrationNumber
                  }

                </td>

                <td className="p-4">
                  {item.scheduleType}
                </td>

                <td className="p-4">
                  {item.nextServiceDueKM} km
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        item.status === "OVERDUE"
                          ? "bg-red-500"

                          : item.status === "COMPLETED"
                          ? "bg-green-500"

                          : item.status === "IN_PROGRESS"
                          ? "bg-yellow-500"

                          : "bg-blue-500"
                      }
                    `}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {maintenance.length === 0 && (

          <p className="p-6 text-center text-gray-500">
            No overdue maintenance found
          </p>

        )}

      </div>

    </DashboardLayout>
  );
}