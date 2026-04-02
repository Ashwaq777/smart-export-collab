import { useAutoTranslate } from '../../hooks/useAutoTranslate'

export const AutoTranslate = ({ text }) => {
  const translated = useAutoTranslate(text)
  return <>{translated}</>
}
