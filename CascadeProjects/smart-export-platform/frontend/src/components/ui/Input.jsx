import React from 'react'

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-3 leading-relaxed">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border border-dark-border
            ${Icon ? 'pl-12 pr-4' : 'px-4'} py-3.5
            text-white placeholder-gray-500
            bg-dark-hover
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20
            hover:border-gray-600
            transition-all duration-300 ease-out
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 leading-relaxed">{error}</p>
      )}
    </div>
  )
}
