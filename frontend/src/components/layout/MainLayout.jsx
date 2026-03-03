import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-maritime-cream">
      {showHeader && <Header />}
      
      <main className="min-h-screen">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}
