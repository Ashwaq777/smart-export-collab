import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import Calculator from './pages/Calculator'
import TraceabilityPage from './pages/TraceabilityPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { ProfilePage } from './pages/ProfilePage'
import ContainerDashboard from './pages/containers/ContainerDashboard'
import ContainersPage from './pages/containers/ContainersPage'
import MatchesPage from './pages/containers/MatchesPage'
import TransactionsPage from './pages/containers/TransactionsPage'
import EirDocumentsPage from './pages/containers/EirDocumentsPage'
import MarketplacePage from './pages/containers/MarketplacePage'
import OfferDetailPage from './pages/containers/OfferDetailPage'
import SendDirectRequestPage from './pages/containers/SendDirectRequestPage'
import SupportPage from './pages/support/SupportPage'
import VesselTrackingPage from './pages/vessels/VesselTrackingPage'

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Route racine avec redirection selon rôle */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomeRedirect />
              </ProtectedRoute>
            } />

            {/* Routes protégées */}
            <Route path="/calculator" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <Calculator />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/traceability" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <TraceabilityPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <MainLayout>
                  <About />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Container Routes */}
            <Route path="/containers" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <Navigate to="/containers/marketplace" replace />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/containers/marketplace" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <MarketplacePage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/containers/marketplace/:id/request" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <SendDirectRequestPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/containers/marketplace/:id" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <OfferDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/containers/transactions" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <TransactionsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/containers/eir-documents" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <EirDocumentsPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Vessel Tracking Route */}
            <Route path="/vessels" element={
              <ProtectedRoute excludeRole="ADMIN">
                <MainLayout>
                  <VesselTrackingPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Support Route */}
            <Route path="/support" element={
              <ProtectedRoute>
                <MainLayout>
                  <SupportPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Route Admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Redirect par défaut */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  </LanguageProvider>
)
}

export default App
