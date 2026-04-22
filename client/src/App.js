import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 60px)', background: '#0f172a' }}>
      {children}
    </main>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          </Route>

          <Route element={<PrivateRoute roles={['admin', 'manager', 'sales']} />}>
            <Route path="/orders" element={<Layout><Orders /></Layout>} />
          </Route>

          <Route element={<PrivateRoute roles={['admin', 'manager']} />}>
            <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
          </Route>

          <Route element={<PrivateRoute roles={['admin']} />}>
            <Route path="/users" element={<Layout><Users /></Layout>} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
