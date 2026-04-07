import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { MainLayout } from './components/layout/MainLayout'
import Home from './pages/Home'
import About from './pages/About'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />
          <Route path="/about" element={
            <MainLayout>
              <About />
            </MainLayout>
          } />
          <Route path="/admin" element={
            <MainLayout showFooter={false}>
              <Admin />
            </MainLayout>
          } />
        </Routes>
      </ToastProvider>
    </Router>
  )
}

export default App
