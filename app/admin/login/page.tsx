'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        // Simple password check - you can change this password
        const ADMIN_PASSWORD = 'seatale2024' // Change this to your desired password

        if (password === ADMIN_PASSWORD) {
            // Store auth token in localStorage
            localStorage.setItem('admin_authenticated', 'true')
            localStorage.setItem('admin_auth_time', Date.now().toString())
            router.push('/admin')
        } else {
            setError('Invalid password. Please try again.')
            setPassword('')
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
                        <label htmlFor="password" className="block text-sm font-medium text-atlassian-neutral-700 mb-2">
                            Admin Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            placeholder="Enter admin password"
                            className="w-full px-4 py-3 bg-atlassian-neutral-50 border border-atlassian-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlassian-blue-400 focus:border-atlassian-blue-500 transition-colors"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-atlassian-blue-700 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-atlassian-blue-800 transition-all hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-atlassian-blue-400"
                    >
                        Login to Admin Panel
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
