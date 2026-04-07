import React from 'react'

export const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  )
}

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  )
}

export const TableBody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

export const TableRow = ({ children, className = '', hover = true }) => {
  return (
    <tr className={`${hover ? 'hover:bg-gray-50 transition-colors' : ''} ${className}`}>
      {children}
    </tr>
  )
}

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}
