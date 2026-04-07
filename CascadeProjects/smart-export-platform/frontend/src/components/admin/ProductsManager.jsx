import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { tarifService } from '../../services/api'

function ProductsManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    codeHs: '',
    nomProduit: '',
    categorie: '',
    paysDestination: '',
    tauxDouane: '',
    tauxTva: '',
    taxeParafiscale: '0.00'
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await tarifService.getAll()
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        tauxDouane: parseFloat(formData.tauxDouane),
        tauxTva: parseFloat(formData.tauxTva),
        taxeParafiscale: parseFloat(formData.taxeParafiscale)
      }

      if (editingProduct) {
        await tarifService.update(editingProduct.id, data)
      } else {
        await tarifService.create(data)
      }

      loadProducts()
      closeModal()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await tarifService.delete(id)
        loadProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        codeHs: product.codeHs,
        nomProduit: product.nomProduit,
        categorie: product.categorie,
        paysDestination: product.paysDestination,
        tauxDouane: product.tauxDouane.toString(),
        tauxTva: product.tauxTva.toString(),
        taxeParafiscale: product.taxeParafiscale.toString()
      })
    } else {
      setEditingProduct(null)
      setFormData({
        codeHs: '',
        nomProduit: '',
        categorie: '',
        paysDestination: '',
        tauxDouane: '',
        tauxTva: '',
        taxeParafiscale: '0.00'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(product =>
    product.nomProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codeHs.includes(searchTerm) ||
    product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Produit
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code HS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Douane
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {product.codeHs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.nomProduit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.categorie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.paysDestination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.tauxDouane}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.tauxTva}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(product)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code HS
                </label>
                <input
                  type="text"
                  value={formData.codeHs}
                  onChange={(e) => setFormData({ ...formData, codeHs: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={formData.nomProduit}
                  onChange={(e) => setFormData({ ...formData, nomProduit: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays de destination
                </label>
                <input
                  type="text"
                  value={formData.paysDestination}
                  onChange={(e) => setFormData({ ...formData, paysDestination: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Douane (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tauxDouane}
                    onChange={(e) => setFormData({ ...formData, tauxDouane: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TVA (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tauxTva}
                    onChange={(e) => setFormData({ ...formData, tauxTva: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parafiscale (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxeParafiscale}
                    onChange={(e) => setFormData({ ...formData, taxeParafiscale: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingProduct ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsManager
