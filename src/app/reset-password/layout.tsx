import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Reset Password - Create New Password | Mydigisence",
  description: "Create a new secure password for your Mydigisence account. Choose a strong password to protect your account and digital presence.",
  keywords: ['reset password', 'new password', 'create password', 'secure password', 'password change', 'Mydigisence password reset'],
  openGraph: {
    title: 'Reset Password - Mydigisence',
    description: 'Create a new secure password for your Mydigisence account.',
    url: 'https://mydigisence.com/reset-password',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/reset-password',
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
