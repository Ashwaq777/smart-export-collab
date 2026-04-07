import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ship, Calculator, Settings, FileText, Menu, X, Anchor } from 'lucide-react'

const menuItems = [
  { path: '/', icon: Calculator, label: 'Simulation' },
  { path: '/admin', icon: Settings, label: 'Administration' },
]

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-blue-200 p-2 rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6 text-maritime-navy" /> : <Menu className="w-6 h-6 text-maritime-navy" />}
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-blue-200 z-40
          transition-all duration-300 ease-out shadow-xl
          ${isOpen ? 'w-72' : 'w-0 lg:w-20'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-blue-200">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-maritime-navy to-maritime-ocean rounded-xl flex items-center justify-center shadow-lg">
                <Ship className="w-6 h-6 text-white" />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-lg font-bold text-maritime-navy tracking-tight flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-maritime-ocean" />
                    Smart Export
                  </h1>
                  <p className="text-xs text-maritime-ocean leading-relaxed">Maritime Platform</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-5 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group relative flex items-center gap-4 px-4 py-3.5 rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive
                      ? 'bg-gradient-to-r from-maritime-ocean/20 to-blue-100 text-maritime-navy font-semibold shadow-md border border-maritime-ocean/30'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-maritime-navy border border-transparent'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-maritime-ocean to-maritime-wave rounded-r-full shadow-md"></div>
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-maritime-ocean' : 'group-hover:text-maritime-ocean'}`} />
                  {isOpen && <span className="leading-relaxed">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="p-5 border-t border-blue-200">
            <div className={`flex items-center gap-4 px-4 py-3 ${isOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-maritime-navy to-maritime-ocean rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">U</span>
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-maritime-navy truncate leading-relaxed">Utilisateur</p>
                  <p className="text-xs text-maritime-ocean truncate leading-relaxed">user@smartexport.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
