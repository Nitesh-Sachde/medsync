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
    case 'patient':
      return <Navigate to="/patient-dashboard" replace />;
    default:
      // For removed roles (pharmacist, receptionist), redirect to login with message
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
