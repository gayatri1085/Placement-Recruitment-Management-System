import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import StudentDetail from './pages/StudentDetail';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetail from './pages/CompanyDetail';
import DrivesPage from './pages/DrivesPage';
import DriveDetail from './pages/DriveDetail';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetail from './pages/ApplicationDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function AppLayout() {
  const { state } = useApp();
  if (!state.token) return null;
  return <Navbar />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
          <Route path="/drives" element={<ProtectedRoute><DrivesPage /></ProtectedRoute>} />
          <Route path="/drives/:id" element={<ProtectedRoute><DriveDetail /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
          <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute roles={['admin','placement_officer']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
