import { useState, useCallback } from 'react'
import CameraCapture from './CameraCapture.jsx'

const STATIC_OPTIONS = {
  departemen: [
    'BPH',
    'DEPT. ART LEAD',
    'DEPT. EVENT ORGANIZER',
    'DEPT. PRODUCTION MANAGER',
    'DEPT. PUBLIC RELATION',
    'DEPT. SOCIAL MEDIA',
  ],
  departemenDivisiMap: {
    'BPH':                      ['KETUA & WAKIL KETUA', 'SEKRETARIS', 'BENDAHARA'],
    'DEPT. ART LEAD':           ['ART DESIGN', 'CINEMATOGRAPHY', 'WEBSITE'],
    'DEPT. PUBLIC RELATION':    ['SPONSORSHIP', 'MEDIA PARTNER', 'SALES & COMMERCE', 'LIAISON OFFICER', 'OFFLINE PUBLICATION'],
    'DEPT. PRODUCTION MANAGER': ['EQUIPMENT', 'EVENT SECURITY', 'DECORATION'],
    'DEPT. SOCIAL MEDIA':       ['CONTENT CREATOR', 'COPYWRITING', 'ADMIN', 'CONTENT PLANNING'],
    'DEPT. EVENT ORGANIZER':    ['CONSUMPTION', 'EVENT MANAGEMENT', 'EXHIBITION DISPLAY', 'CURATIONAL'],
  },
}

const EMPTY = {
  departemen: '',
  divisi: '',
  pic: '',
  expense: '',
  amount: '',
  photoBase64: null,
  pakaiUangPribadi: false,
  bank: '',
  rekening: '',
}

const fmtIDR = (val) => {
  const num = val.replace(/\D/g, '')
  return num ? new Intl.NumberFormat('id-ID').format(Number(num)) : ''
}

export default function ExpenseForm({ user }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [cameraKey, setCameraKey] = useState(0)
  const options = STATIC_OPTIONS

  const set = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'departemen' ? { divisi: '' } : {}),
    }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const getDivisiOptions = () => {
    if (!form.departemen) return []
    return options.departemenDivisiMap[form.departemen] || options.divisi
  }

  const validate = () => {
    const e = {}
    if (!form.departemen) e.departemen = 'Wajib dipilih'
    if (!form.divisi) e.divisi = 'Wajib dipilih'
    if (!form.pic?.trim()) e.pic = 'Wajib diisi'
    if (!form.expense?.trim()) e.expense = 'Wajib diisi'
    if (!form.amount || Number(form.amount.replace(/\D/g, '')) <= 0) e.amount = 'Wajib diisi, harus > 0'
    return e
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departemen: form.departemen,
          divisi: form.divisi,
          pic: form.pic.trim(),
          expense: form.expense.trim(),
          amount: form.amount.replace(/\D/g, ''),
          photoBase64: form.photoBase64,
          pakaiUangPribadi: form.pakaiUangPribadi,
          bank: form.bank,
          rekening: form.rekening,
          pembuat: user?.nama,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan expense')
      }

      setSubmitted(true)

      setTimeout(() => {
        setSubmitted(false)
        setForm(EMPTY)
        setErrors({})
        setCameraKey(k => k + 1)
      }, 3000)
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message }))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [form])

  const handleClear = () => {
    setForm(EMPTY)
    setErrors({})
  }

  const divisiOptions = getDivisiOptions()

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Success Popup */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center gap-4 animate-scale-pop max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-dark tracking-wide">TRANSAKSI KAMU UDAH TERSIMPAN</p>
            <p className="text-sm text-gray-400">Data berhasil masuk ke Notion</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-dark">Input Expense Nota</h1>
            <p className="text-sm text-gray-500 mt-1">Lengkapi semua field dan ambil foto nota</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error global */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-danger rounded-lg">
              <p className="text-sm text-danger">{errors.submit}</p>
            </div>
          )}

          {/* Departemen & Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Departemen *" error={errors.departemen}>
              <select
                value={form.departemen}
                onChange={e => set('departemen', e.target.value)}
                disabled={false}
                className={inputClass(errors.departemen)}
              >
                <option value="">— Pilih —</option>
                {options.departemen.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Divisi *" error={errors.divisi}>
              <select
                value={form.divisi}
                onChange={e => set('divisi', e.target.value)}
                disabled={!form.departemen}
                className={inputClass(errors.divisi)}
              >
                <option value="">— Pilih —</option>
                {divisiOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>
          </div>

          {/* PIC - Text Input */}
          <FieldGroup label="PIC (Person in Charge) *" error={errors.pic}>
            <input
              type="text"
              value={form.pic}
              onChange={e => set('pic', e.target.value)}
              placeholder="Contoh: Andi Wijaya, Bella Santoso"
              className={inputClass(errors.pic)}
            />
          </FieldGroup>

          {/* Expense Title */}
          <FieldGroup label="Apa Expense-nya? *" error={errors.expense}>
            <input
              type="text"
              value={form.expense}
              onChange={e => set('expense', e.target.value)}
              placeholder="Contoh: Pembelian Laptop, Biaya Transportasi, dll"
              className={inputClass(errors.expense)}
            />
          </FieldGroup>

          {/* Amount */}
          <FieldGroup label="Jumlah (IDR) *" error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
              <input
                type="text"
                value={form.amount}
                onChange={e => set('amount', fmtIDR(e.target.value))}
                placeholder="0"
                className={`${inputClass(errors.amount)} pl-9`}
                inputMode="numeric"
              />
            </div>
            {form.amount && !errors.amount && (
              <p className="mt-1 text-xs text-success">= Rp {form.amount}</p>
            )}
          </FieldGroup>

          {/* Pilihan Dana */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Sumber Dana *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set('pakaiUangPribadi', false)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
                  form.pakaiUangPribadi === false
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-border bg-white text-gray-400 hover:border-gray-300'
                }`}
              >
                  Uang Departemen
              </button>
              <button
                type="button"
                onClick={() => set('pakaiUangPribadi', true)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
                  form.pakaiUangPribadi === true
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-border bg-white text-gray-400 hover:border-gray-300'
                }`}
              >
                  Dana Pribadi
              </button>
            </div>
            {form.pakaiUangPribadi === true && (
              <p className="mt-2 text-xs text-amber-600">Akan diajukan reimburse ke departemen</p>
            )}
          </div>

          {/* Bank & Rekening — hanya jika Dana Pribadi */}
          {form.pakaiUangPribadi === true && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <FieldGroup label="Bank - Atas Nama Lengkap">
                <input
                  type="text"
                  value={form.bank}
                  onChange={e => set('bank', e.target.value)}
                  placeholder="Contoh: BCA - Bintang Fajri Martani"
                  className={inputClass()}
                />
              </FieldGroup>
              <FieldGroup label="No. Rekening">
                <input
                  type="text"
                  value={form.rekening}
                  onChange={e => set('rekening', e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className={inputClass()}
                  inputMode="numeric"
                />
              </FieldGroup>
            </div>
          )}

          {/* Camera */}
          <FieldGroup label="Foto Nota/Bukti *" error={errors.photo}>
            <CameraCapture
              key={cameraKey}
              onCapture={base64 => set('photoBase64', base64)}
            />
          </FieldGroup>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Bersihkan
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                submitted
                  ? 'bg-success text-white animate-scale-pop'
                  : loading || optionsLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {submitted ? '✓ Tersimpan ke Notion!' : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : 'Simpan ke Notion →'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer info */}
      <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
        <p>Expense akan tersimpan langsung ke database Notion</p>
        <p>POVI 2026 · Expense Recorder v2</p>
      </div>
    </div>
  )
}

function FieldGroup({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  )
}

const inputClass = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm bg-white transition-all ${
    err
      ? 'border-danger bg-red-50 focus:ring-danger/20'
      : 'border-border focus:border-primary focus:ring-primary/20'
  } focus:outline-none focus:ring-2`
