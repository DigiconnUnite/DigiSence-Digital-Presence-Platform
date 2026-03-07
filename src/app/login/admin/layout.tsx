import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Login - Mydigisence Administration",
  description: "Secure admin access to Mydigisence platform management. Manage users, businesses, professionals, and platform settings.",
  keywords: ['admin login', 'administration', 'platform management', 'user management', 'super admin', 'dashboard admin', 'Mydigisence admin'],
  openGraph: {
    title: 'Admin Login - Mydigisence',
    description: 'Secure admin access to Mydigisence platform management.',
    url: 'https://mydigisence.com/login/admin',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/login/admin',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
