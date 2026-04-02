import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { ChevronDown } from 'lucide-react'

const languages = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
]

export const LanguageSelector = ({ variant = 'dark' }) => {
  const { lang, changeLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = languages.find(l => l.code === lang) || languages[0]
  const isDark = variant === 'dark'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {languages.map(({ code, flag, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => { changeLang(code); setOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                  lang === code
                    ? 'bg-[#0B1F3A] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
