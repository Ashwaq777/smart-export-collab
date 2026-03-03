import React from 'react'

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-blue-200 p-8 ${
        hover ? 'transition-all duration-300 ease-out hover:shadow-xl hover:border-maritime-ocean hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-2xl font-bold text-maritime-navy leading-relaxed-plus tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 mt-3 leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
