import { useRef, useState, useCallback } from 'react'

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const openCamera = useCallback(async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      setError('Tidak bisa akses kamera. Pastikan permission diizinkan.')
      console.error(err)
    }
  }, [])

  const closeCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsCameraOpen(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    const video = videoRef.current
    canvasRef.current.width = video.videoWidth
    canvasRef.current.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.9)
    setPreview(base64)
    onCapture(base64)
    closeCamera()
  }, [onCapture, closeCamera])

  const retakePhoto = useCallback(() => {
    setPreview(null)
    openCamera()
  }, [openCamera])

  const removePhoto = useCallback(() => {
    setPreview(null)
    onCapture(null)
  }, [onCapture])

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      onCapture(ev.target.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      {!isCameraOpen && !preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCamera}
            className="flex-1 px-4 py-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">📷</span>
            <p className="text-xs font-medium text-gray-600">Kamera</p>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 px-4 py-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">📁</span>
            <p className="text-xs font-medium text-gray-600">Upload</p>
          </button>
        </div>
      )}

      {isCameraOpen && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl border border-border bg-black"
            style={{ aspectRatio: '4/3' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeCamera}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 px-3 py-2 rounded-lg bg-success text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Ambil ✓
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <img src={preview} alt="preview" className="w-full rounded-xl border border-border" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={removePhoto}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={retakePhoto}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Ambil Ulang
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-danger rounded-lg">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}
    </div>
  )
}
