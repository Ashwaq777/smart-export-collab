import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider } from './context/AuthContext'
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Routes protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } />
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

            {/* Route Admin */}
            <Route path="/admin" element={
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
  )
}

export default App
