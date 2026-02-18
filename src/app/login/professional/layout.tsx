import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Professional Login - Access Your Professional Dashboard",
  description: "Sign in to your DigiSence professional account. Manage your profile, showcase your skills, find work opportunities, and grow your professional network.",
  keywords: ['professional login', 'expert login', 'profile management', 'professional dashboard', 'skill showcase', 'work opportunities'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function ProfessionalLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
