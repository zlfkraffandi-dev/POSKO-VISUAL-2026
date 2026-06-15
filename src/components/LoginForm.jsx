import { useState } from 'react'

export default function LoginForm({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nama: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('povi_user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegistered(true)
      setForm({ nama: '', username: '', password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setRegistered(false)
    setForm({ nama: '', username: '', password: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-8 border-b border-border text-center">
            <h1 className="text-2xl font-bold text-dark">Expense Recorder</h1>
            <p className="text-sm text-gray-400 mt-1">POVI 2026</p>
          </div>

          {/* Tab */}
          <div className="flex border-b border-border">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Daftar
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-danger rounded-lg">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {registered && (
              <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Akun berhasil dibuat! Silakan masuk.</p>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading || !form.username || !form.password} className={btnClass(loading || !form.username || !form.password)}>
                  {loading ? <Spinner /> : 'Masuk'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={e => set('nama', e.target.value)}
                    placeholder="Contoh: Bintang Fajri"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="Contoh: bintang"
                    autoComplete="username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Buat password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading || !form.nama || !form.username || !form.password} className={btnClass(loading || !form.nama || !form.username || !form.password)}>
                  {loading ? <Spinner /> : 'Daftar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 transition-all'

const btnClass = (disabled) => `w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
  disabled
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
}`

const Spinner = () => (
  <span className="flex items-center justify-center gap-2">
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    Memproses...
  </span>
)
