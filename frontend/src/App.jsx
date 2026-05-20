import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Unauthorized from "./pages/Unauthorized";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FleetDashboard from "./pages/fleet/FleetDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}

        <Route path="/" element={<Login />} />

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        {/* ADMIN */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* FLEET MANAGER */}

        <Route
          path="/fleet/dashboard"
          element={
            <ProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
              <FleetDashboard />
            </ProtectedRoute>
          }
        />

        {/* DRIVER */}

        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={["DRIVER"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* MECHANIC */}

        <Route
          path="/mechanic/dashboard"
          element={
            <ProtectedRoute allowedRoles={["MECHANIC"]}>
              <MechanicDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;