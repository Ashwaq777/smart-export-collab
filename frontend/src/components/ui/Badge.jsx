import React from 'react'

const variants = {
  primary: 'bg-maritime-ocean/20 text-maritime-navy border border-maritime-ocean/40',
  success: 'bg-success-100 text-success-700 border border-success-300',
  warning: 'bg-amber-100 text-amber-700 border border-amber-300',
  danger: 'bg-red-100 text-red-700 border border-red-300',
  info: 'bg-blue-100 text-blue-700 border border-blue-300',
}

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
