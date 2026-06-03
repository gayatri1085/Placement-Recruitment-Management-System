import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children, roles }) {
  const { state } = useApp();
  if (!state.token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(state.authUser?.role)) {
    return <div className="page-container"><div className="error-state">403 - Access Denied: You don't have permission to view this page.</div></div>;
  }
  return children;
}
