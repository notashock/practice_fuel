import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function DriverDashboard() {

  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {

    try {

      const response = await API.get(
        "/issues/open"
      );

      setIssues(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const criticalIssues = issues.filter(
    (issue) =>
      issue.severity === "CRITICAL"
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
          Driver Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Fuel tracking and issue reporting
        </p>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-gray-500">
            Open Issues
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {issues.length}
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
            Reported Vehicles
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {
              new Set(
                issues.map(
                  (issue) => issue.vehicle?.id
                )
              ).size
            }
          </h2>

        </div>

      </div>

      {/* Recent Issues */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Open Issues
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
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {issues.map((issue) => (

              <tr
                key={issue.id}
                className="border-b"
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
                  {issue.severity}
                </td>

                <td className="p-4">
                  {issue.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}