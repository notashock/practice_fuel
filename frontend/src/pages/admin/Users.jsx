import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import API from "../../api/axios";

export default function Users() {

  const [users, setUsers] = useState([]);

  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Fetch Users

  const fetchUsers = async (role = "") => {

    try {

      setLoading(true);

      const url = role
        ? `/users?role=${role}`
        : "/users";

      const response = await API.get(url);

      setUsers(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Users

  const handleFilter = (e) => {

    const role = e.target.value;

    setRoleFilter(role);

    fetchUsers(role);
  };

  // Form Change

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create User

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      await API.post("/users", formData);

      setSuccess("User created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
      });

      fetchUsers(roleFilter);

      setShowForm(false);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to create user"
      );
    }
  };

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage system users and roles
          </p>

        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          {showForm ? "Close" : "Create User"}
        </button>

      </div>

      {/* Create User Form */}

      {showForm && (

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Create New User
          </h2>

          {error && (
            <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </p>
          )}

          {success && (
            <p className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">
              {success}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            >

              <option value="">
                Select Role
              </option>

              <option value="ADMIN">
                ADMIN
              </option>

              <option value="FLEET_MANAGER">
                FLEET_MANAGER
              </option>

              <option value="DRIVER">
                DRIVER
              </option>

              <option value="MECHANIC">
                MECHANIC
              </option>

            </select>

            <div className="md:col-span-2">

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg"
              >
                Create User
              </button>

            </div>

          </form>

        </div>

      )}

      {/* Filter */}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">

        <label className="block mb-3 font-medium">
          Filter By Role
        </label>

        <select
          value={roleFilter}
          onChange={handleFilter}
          className="w-full md:w-80 border p-3 rounded-lg"
        >

          <option value="">
            All Users
          </option>

          <option value="ADMIN">
            ADMIN
          </option>

          <option value="FLEET_MANAGER">
            FLEET_MANAGER
          </option>

          <option value="DRIVER">
            DRIVER
          </option>

          <option value="MECHANIC">
            MECHANIC
          </option>

        </select>

      </div>

      {/* Users Table */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Role
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                      ${
                        user.role === "ADMIN"
                          ? "bg-red-500"

                          : user.role === "FLEET_MANAGER"
                          ? "bg-blue-500"

                          : user.role === "DRIVER"
                          ? "bg-green-500"

                          : "bg-yellow-500"
                      }
                    `}
                  >
                    {user.role}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {!loading && users.length === 0 && (

          <p className="p-6 text-center text-gray-500">
            No users found
          </p>

        )}

        {loading && (

          <p className="p-6 text-center">
            Loading users...
          </p>

        )}

      </div>

    </DashboardLayout>
  );
}