import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './components/Auth/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserSite from './components/User/UserSite';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

const AdminLoginWrapper: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = (username: string, password: string) => {
    const success = login(username, password);
    if (success) {
      navigate('/admin');
    }
  };
  
  return <AdminLogin onLogin={handleLogin} />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginWrapper />} />
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* User Site - Public Access */}
        <Route path="/" element={<UserSite />} />
        <Route path="/user" element={<UserSite />} />
        
        {/* Redirect any other routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
