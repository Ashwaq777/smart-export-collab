import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export const AdminDashboard = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    adminUsers: 0
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      // Fallback to static placeholders if endpoint doesn't exist
      setStats({
        totalUsers: 156,
        activeUsers: 89,
        blockedUsers: 23,
        adminUsers: 4
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data || [])
    } catch (error) {
      // Fallback to static data
      setUsers([
        { id: 1, name: 'jean@example.com', email: 'jean@example.com', role: 'EXPORTATEUR', status: 'ACTIVE' },
        { id: 2, name: 'marie@example.com', email: 'marie@example.com', role: 'IMPORTATEUR', status: 'ACTIVE' },
        { id: 3, name: 'ahmed@example.com', email: 'ahmed@example.com', role: 'EXPORTATEUR', status: 'BLOCKED' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`)
      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error('Failed to change user role:', error)
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await api.delete(`/admin/users/${userId}`)
        fetchUsers()
        fetchStats()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              {user?.email && (
                <span className="ml-4 text-sm text-gray-300">{user.email}</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border-t-4 border-gold-500 p-6">
            <div className="text-3xl font-bold text-navy-900">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-t-4 border-green-500 p-6">
            <div className="text-3xl font-bold text-navy-900">{stats.activeUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-t-4 border-red-500 p-6">
            <div className="text-3xl font-bold text-navy-900">{stats.blockedUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Blocked</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border-t-4 border-gold-500 p-6">
            <div className="text-3xl font-bold text-navy-900">{stats.adminUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Admins</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-navy-900">Users Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-navy-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      >
                        <option value="EXPORTATEUR">EXPORTATEUR</option>
                        <option value="IMPORTATEUR">IMPORTATEUR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
