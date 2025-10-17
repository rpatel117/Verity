import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Verity - Secure Guest Attestation',
  description: 'Streamline hotel check-ins with secure SMS-based verification system',
  generator: 'Next.js',
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
    </>
  )
}
