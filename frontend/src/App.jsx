import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import DashboardLayout from './pages/DashboardLayout';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Items from './pages/Items';
import Invoices from './pages/Invoices';
import useAuthStore from './store/authStore';

// Main Dashboard Placeholder (We will build this next)
function Dashboard() {
  const { logout } = useAuthStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root based on auth status */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />

        {/* Public Routes */}
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />
        } />

        {/* Protected Dashboard Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="clients" element={<Clients />} />
          <Route path="items" element={<Items />} />
          <Route path="settings" element={<Settings />} />
          <Route path="invoices" element={<Invoices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
