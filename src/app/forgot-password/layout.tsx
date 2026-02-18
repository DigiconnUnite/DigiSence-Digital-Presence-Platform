import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Forgot Password - Reset Your DigiSence Account",
  description: "Forgot your password? Enter your email to receive a secure password reset link and regain access to your DigiSence account.",
  keywords: ['forgot password', 'reset password', 'password recovery', 'account recovery', 'secure password reset'],
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
