import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import API from "../../api/axios";

export default function Users() {

  const [users, setUsers] = useState([]);

  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(true);

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

  const handleFilter = (e) => {

    const role = e.target.value;

    setRoleFilter(role);

    fetchUsers(role);
  };

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Users Management
        </h1>

        <select
          value={roleFilter}
          onChange={handleFilter}
          className="border p-3 rounded-lg"
        >

          <option value="">
            All Roles
          </option>

          <option value="ADMIN">
            ADMIN
          </option>

          <option value="FLEET_MANAGER">
            FLEET_MANAGER
          </option>

          <option value="MECHANIC">
            MECHANIC
          </option>

          <option value="DRIVER">
            DRIVER
          </option>

        </select>

      </div>

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
                className="border-b"
              >

                <td className="p-4">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4">

                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">

                    {user.role}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {!loading &&
          users.length === 0 && (

          <p className="p-6 text-center text-gray-500">
            No users found
          </p>

        )}

      </div>

    </DashboardLayout>
  );
}