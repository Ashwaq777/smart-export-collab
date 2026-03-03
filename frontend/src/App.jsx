import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { MainLayout } from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Admin from './pages/Admin'
import MaritimeShipping from './pages/MaritimeShipping'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />
          <Route path="/maritime-shipping" element={
            <MainLayout>
              <MaritimeShipping />
            </MainLayout>
          } />
          <Route path="/about" element={
            <MainLayout>
              <About />
            </MainLayout>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <MainLayout showFooter={false}>
                <Admin />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </Router>
  )
}

export default App
