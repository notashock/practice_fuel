import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function Issues() {

  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Open Issues

  const fetchIssues = async () => {

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
    fetchIssues();
  }, []);

  // Acknowledge Issue

  const acknowledgeIssue = async (id) => {

    try {

      setActionLoading(true);

      await API.put(
        `/issues/${id}/acknowledge`
      );

      fetchIssues();

    } catch (error) {

      console.log(error);

    } finally {

      setActionLoading(false);
    }
  };

  // Resolve Issue

  const resolveIssue = async (id) => {

    try {

      setActionLoading(true);

      await API.put(
        `/issues/${id}/resolve`
      );

      fetchIssues();

    } catch (error) {

      console.log(error);

    } finally {

      setActionLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Open Issues
        </h1>

        <p className="text-gray-500 mt-1">
          Manage and resolve reported issues
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {issues.map((issue) => (

          <div
            key={issue.id}
            className="bg-white rounded-xl shadow-md p-6"
          >

            {/* Header */}

            <div className="flex justify-between items-start mb-4">

              <div>

                <h2 className="text-xl font-bold">
                  {
                    issue.vehicle
                      ?.registrationNumber
                  }
                </h2>

                <p className="text-gray-500">
                  {issue.issueType}
                </p>

              </div>

              {/* Severity Badge */}

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

            </div>

            {/* Description */}

            <div className="mb-5">

              <p className="text-gray-700">
                {issue.description}
              </p>

            </div>

            {/* Report Info */}

            <div className="space-y-2 mb-5 text-sm text-gray-600">

              <p>
                <span className="font-semibold">
                  Reported By:
                </span>

                {" "}
                {issue.reportedBy?.name}
              </p>

              <p>
                <span className="font-semibold">
                  Reported At:
                </span>

                {" "}
                {
                  new Date(
                    issue.reportedAt
                  ).toLocaleString()
                }
              </p>

            </div>

            {/* Severity Alerts */}

            {issue.severity === "CRITICAL" && (

              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">

                CRITICAL issue must be resolved within 24 hours.

              </div>

            )}

            {issue.severity === "HIGH" && (

              <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg mb-5">

                HIGH severity issue should be resolved within 72 hours.

              </div>

            )}

            {/* Actions */}

            <div className="flex gap-3">

              <button
                onClick={() =>
                  acknowledgeIssue(issue.id)
                }
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Acknowledge
              </button>

              <button
                onClick={() =>
                  resolveIssue(issue.id)
                }
                disabled={actionLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
              >
                Resolve
              </button>

            </div>

          </div>

        ))}

      </div>

      {!loading && issues.length === 0 && (

        <div className="bg-white rounded-xl shadow-md p-10 text-center">

          <p className="text-gray-500 text-lg">
            No open issues found
          </p>

        </div>

      )}

      {loading && (

        <div className="bg-white rounded-xl shadow-md p-10 text-center">

          <p>
            Loading issues...
          </p>

        </div>

      )}

    </DashboardLayout>
  );
}