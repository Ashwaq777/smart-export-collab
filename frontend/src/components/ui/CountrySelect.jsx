import React, { useMemo, useState } from 'react'

const normalize = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

export const CountrySelect = ({
  label,
  valueIso2,
  countries,
  onChangeIso2,
  placeholder = '-- Sélectionner pays --',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const selected = useMemo(() => {
    const wanted = String(valueIso2 || '').toUpperCase()
    return (countries || []).find((c) => String(c?.iso2 || '').toUpperCase() === wanted) || null
  }, [countries, valueIso2])

  const filtered = useMemo(() => {
    const query = normalize(q)
    const list = (countries || []).filter((c) => {
      if (!query) return true
      return normalize(c?.name).includes(query) || normalize(c?.iso2).includes(query)
    })

    const groups = new Map()
    list.forEach((c) => {
      const key = c?.region || 'Autres'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(c)
    })

    return Array.from(groups.entries())
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'fr'))
      .map(([region, items]) => ({
        region,
        items: items.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'fr')),
      }))
  }, [countries, q])

  const display = selected ? `${selected.name} (${selected.iso2})` : ''

  return (
    <div className="relative">
      {label && <label className="block text-sm font-semibold text-maritime-navy mb-2">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className={display ? 'text-gray-900' : 'text-gray-400'}>
          {display || placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>

          <div className="max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Aucun résultat</div>
            ) : (
              filtered.map((g) => (
                <div key={g.region}>
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-100">
                    {g.region}
                  </div>
                  {g.items.map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      onClick={() => {
                        onChangeIso2(String(c.iso2 || '').toUpperCase())
                        setOpen(false)
                        setQ('')
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-accent-50 flex items-center gap-3"
                    >
                      <span className="text-lg leading-none">
                        {c.flagPng ? (
                          <img src={c.flagPng} alt={c.iso2} className="w-5 h-4 object-cover rounded-sm border border-gray-200" />
                        ) : (
                          '🌍'
                        )}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-gray-800">{c.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{c.iso2}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CountrySelect
