import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Drishti - Mental Wellness App',
  description: 'A mental wellness app that helps you find new perspectives on your challenges',
  manifest: '/manifest.json',
  themeColor: '#f093fb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#f093fb" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500">
          {children}
        </div>
      </body>
    </html>
  )
} 