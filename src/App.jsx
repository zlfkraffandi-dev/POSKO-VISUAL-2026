import { useEffect, useState } from 'react'
import ExpenseForm from './components/ExpenseForm.jsx'
import LoginForm from './components/LoginForm.jsx'

export default function App() {
  const [serverReady, setServerReady] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('povi_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health')
        if (res.ok) setServerReady(true)
      } catch {
        setServerError('Server tidak tersambung.')
      }
    }
    const interval = setInterval(checkServer, 2000)
    checkServer()
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (userData) => setUser(userData)

  const handleLogout = () => {
    localStorage.removeItem('povi_user')
    setUser(null)
  }

  if (!serverReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">
            {serverError ? serverError : 'Menghubungkan ke server...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginForm onLogin={handleLogin} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-primary/5 py-8 px-4">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <header className="mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark">Expense Recorder</h1>
            <p className="text-sm text-gray-500">POVI 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">{user.nama}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-border rounded-lg hover:border-danger hover:text-danger transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="pb-12">
        <ExpenseForm user={user} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-bg via-bg/80 to-transparent pt-6 pb-4">
        <p className="text-center text-xs text-gray-400">
          © 2026 POVI · Expense Management System
        </p>
      </footer>
    </div>
  )
}
