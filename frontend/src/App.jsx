import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Departments from "./pages/admin/Departments";
import Doctors from "./pages/admin/Doctors";
import Patients from "./pages/admin/Patients";
import Bookings from "./pages/admin/Bookings";
import Schedules from "./pages/admin/Schedules";
import Users from "./pages/admin/Users";
import Signage from "./pages/admin/Signage";
import Display from "./pages/signage/Display";

const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/display/:department_id" element={<Display />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <AdminLayout>
                  <Departments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["super_admin", "supervisor"]}>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute roles={["super_admin", "supervisor"]}>
                <AdminLayout>
                  <Doctors />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedules"
            element={
              <ProtectedRoute
                roles={["super_admin", "supervisor", "receptionist"]}
              >
                <AdminLayout>
                  <Schedules />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute
                roles={["super_admin", "supervisor", "receptionist"]}
              >
                <AdminLayout>
                  <Patients />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute
                roles={["super_admin", "supervisor", "receptionist"]}
              >
                <AdminLayout>
                  <Bookings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/signage"
            element={
              <ProtectedRoute roles={["super_admin", "marketing"]}>
                <AdminLayout>
                  <Signage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
