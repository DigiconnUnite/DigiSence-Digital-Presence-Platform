import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register - Create Your DigiSence Account",
  description: "Join DigiSence, India's leading digital presence platform. Create a professional or business account to build your online presence and connect with clients worldwide.",
  keywords: ['register', 'sign up', 'create account', 'professional registration', 'business registration', 'digital presence signup'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
