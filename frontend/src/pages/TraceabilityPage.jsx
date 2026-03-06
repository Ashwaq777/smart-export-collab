import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import TraceabilityForm from '../traceability/components/LotForm.jsx'

export const TraceabilityPage = () => {
  const { user } = useAuth()
  const [error, setError] = useState(null)

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setTimeout(() => setError(null), 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">🌿 Traçabilité</h1>
              {user?.email && (
                <span className="ml-4 text-sm text-gray-300">{user.email}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TraceabilityForm onError={handleError} />
      </div>
    </div>
  )
}

export default TraceabilityPage
