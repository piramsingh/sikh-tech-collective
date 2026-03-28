import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Sikh Tech Collective',
  description: 'An open playground for Sikh builders to build for the Panth.',
  openGraph: {
    title: 'The Sikh Tech Collective',
    description: 'An open playground for Sikh builders to build for the Panth.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
