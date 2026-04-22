import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Looga Dashboard',
  description: "Dashboard organisateur — Plateforme de billetterie Looga",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="looga" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="min-h-screen bg-base-100 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
