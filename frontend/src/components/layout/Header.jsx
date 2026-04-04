import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ship, Anchor, Menu, X, UserCircle, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import { useLanguage } from '../../context/LanguageContext'
import { LanguageSelector } from '../ui/LanguageSelector'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  // Suppression du menu langue manuel - utilise LanguageSelector

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: t('nav.home') },
    ...(user?.role !== 'ADMIN' ? [{ path: '/calculator', label: t('nav.calculator') }] : []),
    ...(user?.role !== 'ADMIN' ? [{ path: '/traceability', label: t('nav.traceability') }] : []),
    ...(user?.role !== 'ADMIN' ? [
      { path: '/containers/marketplace', label: t('nav.marketplace') },
      { path: '/containers/transactions', label: t('nav.transactions') },
      { path: '/containers/eir-documents', label: t('nav.documents') },
      { path: '/vessels', label: t('nav.tracking') }
    ] : []),
    { path: '/support', label: t('nav.support') },
    { path: '/about', label: t('nav.about') },
    ...(user?.role === 'ADMIN' ? [{ path: '/admin/dashboard', label: t('nav.admin') }] : []),
  ]

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }


  return (
    <header
      style={{ position: 'relative', zIndex: 100 }}
      className={`fixed top-0 left-0 right-0 transition-all duration-300 z-50 h-16 ${
        isScrolled
          ? 'bg-[#0B1F3A] shadow-lg'
          : 'bg-gradient-to-r from-[#0B1F3A] to-[#1CA7C7]'
      }`}
    >
      <div className="h-16 flex items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-maritime-navy via-maritime-deepBlue to-accent-500 rounded-xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border-2 border-accent-500/20">
              <Ship className="w-4 h-4 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Anchor className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-tight">
              Smart Export
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.path + (link.hash || '')}
              to={link.path + (link.hash || '')}
              className={`text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                location.pathname === link.path && !link.hash
                  ? 'text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

          {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector variant="dark" />
          {user && <NotificationBell />}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:text-maritime-navy hover:border-accent-500 transition-colors"
                title="Menu utilisateur"
              >
                <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {getUserInitials()}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent-500 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    {t('nav.profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:text-accent-500 hover:border-accent-500 transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
