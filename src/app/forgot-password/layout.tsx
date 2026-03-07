import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Forgot Password - Reset Your Mydigisence Account",
  description: "Forgot your password? Enter your email to receive a secure password reset link and regain access to your Mydigisence account.",
  keywords: ['forgot password', 'reset password', 'password recovery', 'account recovery', 'secure password reset', 'Mydigisence password reset'],
  openGraph: {
    title: 'Forgot Password - Mydigisence Account',
    description: 'Reset your Mydigisence account password.',
    url: 'https://mydigisence.com/forgot-password',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password - Mydigisence Account',
    description: 'Reset your Mydigisence account password.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/forgot-password',
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

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
