import React from 'react'

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 hover:from-primary-500 hover:to-accent-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 border border-primary-500/30',
  secondary: 'bg-dark-hover hover:bg-dark-border text-gray-300 border border-dark-border hover:border-gray-600 hover:text-white',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 border border-red-500/30',
  success: 'bg-gradient-to-r from-success-600 to-success-500 hover:from-success-500 hover:to-success-600 text-white shadow-lg shadow-success-500/30 hover:shadow-success-500/50 border border-success-500/30',
  outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-300',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-base',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-medium
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2.5
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  )
}
