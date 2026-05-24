import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../../api/axios";

export default function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      setLoading(true);

      await API.post("/auth/register", formData);

      setSuccess(
        "Registration successful"
      );

      navigate("/login");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Register into Fleet Management System
          </p>

        </div>

        {error && (

          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">

            {error}

          </div>

        )}

        {success && (

          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">

            {success}

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <div>

            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>

          {/* Email */}

          <div>

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>

          {/* Password */}

          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>

          {/* Role */}

          <div>

            <label className="block mb-2 font-medium">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          </div>

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>

        {/* Login */}

        <p className="text-center text-gray-500 mt-6">

          Already have an account?

          <Link
            to="/login"
            className="text-blue-600 ml-1 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}