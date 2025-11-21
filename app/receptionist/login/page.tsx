'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ReceptionistLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'setup'>('phone')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const sendOTP = async () => {
    setLoading(true)
    
    // Check admin phones first
    const adminRes = await supabase.from('system_config').select('value').eq('key', 'admin_phones').single()
    const adminPhones = adminRes.data?.value?.split(',') || []
    const isAdmin = adminPhones.includes(phone)

    if (isAdmin) {
      // Admin bypasses all checks and goes directly to admin panel
      localStorage.setItem('user_role', 'admin')
      localStorage.setItem('receptionist_auth', phone)
      router.push('/admin')
      setLoading(false)
      return
    }

    // For non-admin users, check receptionist status
    const receptionistRes = await supabase.from('system_config').select('value').eq('key', 'receptionist_phone').single()
    const currentReceptionist = receptionistRes.data?.value

    if (!currentReceptionist) {
      // No receptionist, allow setup
      setStep('setup')
    } else if (currentReceptionist === phone) {
      // Existing receptionist
      console.log(`Sending OTP to ${phone}`)
      setStep('otp')
    } else {
      alert('Unauthorized phone number')
    }
    
    setLoading(false)
  }

  const verifyOTP = async () => {
    // Mock OTP verification (in real app, verify with SMS service)
    if (otp === '1234') {
      localStorage.setItem('user_role', 'receptionist')
      localStorage.setItem('receptionist_auth', phone)
      router.push('/receptionist')
    } else {
      alert('Invalid OTP')
    }
  }

  const setupReceptionist = async () => {
    setLoading(true)
    
    const { error } = await supabase
      .from('system_config')
      .update({ value: phone })
      .eq('key', 'receptionist_phone')

    if (!error) {
      localStorage.setItem('user_role', 'receptionist')
      localStorage.setItem('receptionist_auth', phone)
      router.push('/receptionist')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center wave-pattern">
      <div className="maritime-card p-8 max-w-md mx-4 w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-ocean-900">⚓ Staff Login</h1>
          <p className="text-ocean-600">Sea Tale Restaurant</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={sendOTP}
              disabled={loading || !phone}
              className="w-full bg-coral-500 text-white py-3 rounded-lg hover:bg-coral-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">OTP sent to {phone}</p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={verifyOTP}
              disabled={!otp}
              className="w-full bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 disabled:opacity-50"
            >
              Verify & Login
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                No receptionist registered. You will be set as the receptionist for this restaurant.
              </p>
            </div>
            <p className="text-sm">Phone: {phone}</p>
            <button
              onClick={setupReceptionist}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Register as Receptionist'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}