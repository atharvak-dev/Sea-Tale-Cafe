import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sea Tale Restaurant',
  description: 'Maritime dining experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-inter antialiased" suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}