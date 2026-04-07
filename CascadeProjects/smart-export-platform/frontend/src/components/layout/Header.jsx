import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ship, Anchor, Menu, X } from 'lucide-react'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/', label: 'Calculator', hash: '#calculator' },
    { path: '/about', label: 'About Us' },
    { path: '/admin', label: 'Admin' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg py-3'
          : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-maritime-navy via-maritime-deepBlue to-accent-500 rounded-xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border-2 border-accent-500/20">
                <Ship className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Anchor className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-maritime-navy leading-tight tracking-tight">
                Smart Export
              </h1>
              <p className="text-xs font-medium text-gray-600 leading-tight">
                Global Maritime Trade
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path + (link.hash || '')}
                to={link.path + (link.hash || '')}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === link.path && !link.hash
                    ? 'text-accent-500'
                    : 'text-gray-700 hover:text-accent-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Link
            to="/#calculator"
            className="hidden md:block bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Simulation
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-maritime-navy"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path + (link.hash || '')}
                  to={link.path + (link.hash || '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    location.pathname === link.path && !link.hash
                      ? 'text-accent-500'
                      : 'text-gray-700 hover:text-accent-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/#calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-2.5 rounded-lg font-semibold text-center shadow-lg"
              >
                Start Simulation
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
