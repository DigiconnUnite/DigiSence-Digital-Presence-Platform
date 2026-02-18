import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register as Professional - Create Your Professional Profile",
  description: "Create your professional profile on DigiSence. Showcase your skills, experience, and services to connect with clients and grow your career.",
  keywords: ['professional registration', 'expert profile', 'skill showcase', 'career growth', 'professional networking', 'create professional profile'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
