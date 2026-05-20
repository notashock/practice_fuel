import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FleetDashboard from "./pages/fleet/FleetDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/fleet/dashboard"
          element={<FleetDashboard />}
        />

        <Route
          path="/driver/dashboard"
          element={<DriverDashboard />}
        />

        <Route
          path="/mechanic/dashboard"
          element={<MechanicDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;