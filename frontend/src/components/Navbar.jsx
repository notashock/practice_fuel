import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (

    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-semibold">
          Fleet Management System
        </h2>
      </div>

      <div className="flex items-center gap-4">

        <div className="text-right">
          <p className="font-semibold">
            {user?.email}
          </p>

          <p className="text-sm text-gray-500">
            {user?.role}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}