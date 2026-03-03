import React, { useState } from 'react'
import { Settings, Package, Anchor, FileText, Ship } from 'lucide-react'
import { Card } from '../components/ui/Card'
import ProductsManager from '../components/admin/ProductsManager'
import PortsManager from '../components/admin/PortsManager'
import TariffsManager from '../components/admin/TariffsManager'

function Admin() {
  const [activeTab, setActiveTab] = useState('products')

  const tabs = [
    { id: 'products', name: 'Produits', icon: Package, description: 'Gérer les produits et tarifs' },
    { id: 'ports', name: 'Ports', icon: Ship, description: 'Gérer les ports et frais' },
    { id: 'tariffs', name: 'Tarifs Douaniers', icon: FileText, description: 'Consulter les tarifs' },
  ]

  return (
    <div className="min-h-screen bg-maritime-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-maritime-navy mb-4 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            Administration
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-accent-500 to-accent-600 mb-6"></div>
          <p className="text-xl text-gray-600">
            Manage products, ports and customs tariffs for the platform
          </p>
        </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <nav className="flex gap-2 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white hover:text-maritime-navy border border-transparent hover:border-gray-200'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-sm font-semibold">{tab.name}</div>
                    {activeTab === tab.id && (
                      <div className="text-xs text-gray-400">{tab.description}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-8 bg-white">
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'ports' && <PortsManager />}
          {activeTab === 'tariffs' && <TariffsManager />}
        </div>
      </div>
    </div>
  </div>
  )
}

export default Admin
