import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from './lib/ProtectedRoute';
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import DashboardRedirect from './lib/DashboardRedirect';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/patient-dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctor-dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/receptionist-dashboard" element={<ProtectedRoute role="receptionist"><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/pharmacy-dashboard" element={<ProtectedRoute role="pharmacist"><PharmacyDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin" element={<ProtectedRoute role="super-admin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/change-password" element={<ChangePassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
