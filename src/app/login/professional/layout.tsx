import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Professional Login - Access Your Professional Dashboard | Mydigisence",
  description: "Sign in to your Mydigisence professional account. Manage your profile, showcase your skills, find work opportunities, and grow your professional network.",
  keywords: ['professional login', 'expert login', 'profile management', 'professional dashboard', 'skill showcase', 'work opportunities', 'Mydigisence professional login'],
  openGraph: {
    title: 'Professional Login - Mydigisence',
    description: 'Sign in to your Mydigisence professional account.',
    url: 'https://mydigisence.com/login/professional',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/login/professional',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function ProfessionalLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
