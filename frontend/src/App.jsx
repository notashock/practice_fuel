import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Unauthorized from "./pages/Unauthorized";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";

import DriverDashboard from "./pages/driver/DriverDashboard";
import FuelLogs from "./pages/driver/FuelLogs";
import AddFuelLog from "./pages/driver/AddFuelLog";
import ReportIssue from "./pages/driver/ReportIssue";

import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import Issues from "./pages/mechanic/Issues";

import ProtectedRoute from "./routes/ProtectedRoute";

import FleetDashboard from "./pages/fleet/FleetDashboard";
import Vehicles from "./pages/fleet/Vehicles";
import AddVehicle from "./pages/fleet/AddVehicle";
import VehicleDetails from "./pages/fleet/VehicleDetails";
import Maintenance from "./pages/fleet/Maintenance";
import ScheduleMaintenance from "./pages/fleet/ScheduleMaintenance";
import Costs from "./pages/fleet/Costs";
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
        <Route
  path="/admin/users"
  element={
    <ProtectedRoute
      allowedRoles={["ADMIN"]}
    >
      <Users />
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
        <Route
  path="/fleet/vehicles"
  element={
    <ProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
      <Vehicles />
    </ProtectedRoute>
  }
/>
<Route
  path="/fleet/vehicles/add"
  element={
    <ProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
      <AddVehicle />
    </ProtectedRoute>
  }
/>
<Route
  path="/fleet/vehicles/:id"
  element={
    <ProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
      <VehicleDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/fleet/maintenance"
  element={
    <ProtectedRoute
      allowedRoles={["FLEET_MANAGER"]}
    >
      <Maintenance />
    </ProtectedRoute>
  }
/>
<Route
  path="/fleet/maintenance/schedule"
  element={
    <ProtectedRoute
      allowedRoles={["FLEET_MANAGER"]}
    >
      <ScheduleMaintenance />
    </ProtectedRoute>
  }
/>
<Route
  path="/fleet/costs"
  element={
    <ProtectedRoute
      allowedRoles={["FLEET_MANAGER"]}
    >
      <Costs />
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
        <Route
  path="/driver/fuel-logs"
  element={
    <ProtectedRoute
      allowedRoles={["DRIVER"]}
    >
      <FuelLogs />
    </ProtectedRoute>
  }
/>
<Route
  path="/driver/fuel-logs/add"
  element={
    <ProtectedRoute
      allowedRoles={["DRIVER"]}
    >
      <AddFuelLog />
    </ProtectedRoute>
  }
/>
<Route
  path="/driver/issues"
  element={
    <ProtectedRoute
      allowedRoles={["DRIVER"]}
    >
      <ReportIssue />
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
        <Route
  path="/mechanic/issues"
  element={
    <ProtectedRoute
      allowedRoles={["MECHANIC"]}
    >
      <Issues />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;