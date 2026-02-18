import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Reset Password - Create New Password",
  description: "Create a new secure password for your DigiSence account. Choose a strong password to protect your account and digital presence.",
  keywords: ['reset password', 'new password', 'create password', 'secure password', 'password change'],
  robots: {
    index: false,
    follow: true,
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
