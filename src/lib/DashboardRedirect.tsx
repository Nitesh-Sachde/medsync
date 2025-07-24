import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'super-admin':
      return <Navigate to="/superadmin" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor-dashboard" replace />;
    case 'pharmacist':
      return <Navigate to="/pharmacy-dashboard" replace />;
    case 'receptionist':
      return <Navigate to="/receptionist-dashboard" replace />;
    case 'patient':
      return <Navigate to="/patient-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRedirect;
