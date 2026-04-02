import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const savedLang = localStorage.getItem('i18nextLng') || 'fr'

import('./i18n/index.js').then((i18nModule) => {
  const i18n = i18nModule.default
  i18n.changeLanguage(savedLang).then(() => {
    import('./App.jsx').then(({ default: App }) => {
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      )
    })
  })
})
