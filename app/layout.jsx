import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Drishti - Mental Wellness App',
  description: 'A mental wellness app that helps you find new perspectives on your challenges',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f093fb',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
