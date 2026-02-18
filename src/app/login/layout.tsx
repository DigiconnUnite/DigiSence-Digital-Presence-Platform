import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Login - Access Your DigiSence Account",
  description: "Sign in to your DigiSence account to manage your digital presence. Access your business or professional dashboard and connect with clients worldwide.",
  keywords: ['login', 'sign in', 'digital presence login', 'business dashboard login', 'professional login', 'account access'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
