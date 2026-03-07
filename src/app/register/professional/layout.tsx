import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register as Professional - Create Your Professional Profile | Mydigisence",
  description: "Create your professional profile on Mydigisence. Showcase your skills, experience, and services to connect with clients and grow your career.",
  keywords: ['professional registration', 'expert profile', 'skill showcase', 'career growth', 'professional networking', 'create professional profile', 'Mydigisence professional registration'],
  openGraph: {
    title: 'Register as Professional - Mydigisence',
    description: 'Create your professional profile on Mydigisence.',
    url: 'https://mydigisence.com/register/professional',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/register/professional',
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

export default function RegisterProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
