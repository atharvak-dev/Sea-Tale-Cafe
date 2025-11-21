'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        // Authorized admin phone numbers
        const AUTHORIZED_ADMINS = ['9518377949', '7499795424']

        // Clean the phone number (remove spaces, dashes, etc.)
        const cleanedPhone = phoneNumber.replace(/\s|-|\(|\)/g, '')

        if (AUTHORIZED_ADMINS.includes(cleanedPhone)) {
            // Store auth token in localStorage
            localStorage.setItem('admin_authenticated', 'true')
            localStorage.setItem('admin_auth_time', Date.now().toString())
            localStorage.setItem('admin_phone', cleanedPhone)
            router.push('/admin')
        } else {
            setError('Unauthorized phone number. Access denied.')
            setPhoneNumber('')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-atlassian-neutral-50 via-sea-cream to-atlassian-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-atlassian-neutral-200">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-sea-gold shadow-lg mx-auto mb-4">
                        <Image
                            src="/logo.jpg"
                            alt="Sea Tale"
                            width={80}
                            height={80}
                            className="object-cover"
                        />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-atlassian-blue-700 mb-2">
                        Admin Portal
                    </h1>
                    <p className="text-atlassian-neutral-500 text-sm">
                        Sea Tale Café Management
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-atlassian-neutral-700 mb-2">
                            📱 Admin Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value)
                                setError('')
                            }}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 bg-atlassian-neutral-50 border border-atlassian-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlassian-blue-400 focus:border-atlassian-blue-500 transition-colors text-lg tracking-wide"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {error}
                            </p>
                        )}
                        <p className="mt-2 text-xs text-atlassian-neutral-500">
                            💡 Enter your registered admin phone number
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-atlassian-blue-700 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-atlassian-blue-800 transition-all hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-atlassian-blue-400"
                    >
                        🔐 Verify & Login
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-atlassian-neutral-200">
                    <p className="text-xs text-atlassian-neutral-500 text-center">
                        🔒 Authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    )
}
