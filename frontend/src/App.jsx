import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAdvisorModal from './components/AIAdvisorModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FinancialProfilePage from './pages/FinancialProfilePage';
import CreditHistoryPage from './pages/CreditHistoryPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenAIAdvisor={isAuthenticated ? () => setIsAIModalOpen(true) : null} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <FinancialProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <CreditHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global AI Advisor Modal Triggerable from Navbar */}
      {isAuthenticated && (
        <AIAdvisorModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          userProfile={user}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
