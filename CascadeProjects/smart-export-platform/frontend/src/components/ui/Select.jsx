import React from 'react'

export const Select = ({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  children,
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          className={`
            w-full rounded-xl border border-dark-border
            ${Icon ? 'pl-12 pr-12' : 'px-4 pr-12'} py-3.5
            text-white
            bg-dark-hover
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20
            hover:border-gray-600
            transition-all duration-300 ease-out
            appearance-none
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 leading-relaxed">{error}</p>
      )}
    </div>
  )
}
