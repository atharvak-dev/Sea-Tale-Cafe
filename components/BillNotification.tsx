'use client'
import { useEffect, useState } from 'react'

interface BillNotificationProps {
  show: boolean
  onClose: () => void
}

export default function BillNotification({ show, onClose }: BillNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🧾</div>
          <div>
            <h4 className="font-semibold">Bill Downloaded!</h4>
            <p className="text-sm text-green-100">
              Your Sea Tale restaurant bill has been downloaded successfully.
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-green-200 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}