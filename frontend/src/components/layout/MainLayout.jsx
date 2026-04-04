import { Header } from './Header'
import { Footer } from './Footer'

export const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ marginTop: '64px', flex: 1, padding: 0, margin: 0 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
