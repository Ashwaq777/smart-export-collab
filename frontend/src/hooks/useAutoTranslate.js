import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translateText } from '../context/LanguageContext'

export const useAutoTranslate = (text) => {
  const { lang } = useLanguage()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (lang === 'fr' || !text) {
      setTranslated(text)
      return
    }
    translateText(text, lang).then(setTranslated)
  }, [text, lang])

  return translated
}
