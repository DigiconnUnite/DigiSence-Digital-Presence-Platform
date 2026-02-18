import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Login - DigiSence Administration",
  description: "Secure admin access to DigiSence platform management. Manage users, businesses, professionals, and platform settings.",
  keywords: ['admin login', 'administration', 'platform management', 'user management', 'super admin', 'dashboard admin'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
