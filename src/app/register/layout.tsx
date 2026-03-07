import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register - Create Your Mydigisence Account",
  description: "Join Mydigisence, India's leading digital presence platform. Create a professional or business account to build your online presence and connect with clients worldwide.",
  keywords: ['register', 'sign up', 'create account', 'professional registration', 'business registration', 'digital presence signup', 'Mydigisence registration'],
  openGraph: {
    title: 'Register - Mydigisence Account',
    description: 'Join Mydigisence and build your digital presence.',
    url: 'https://mydigisence.com/register',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register - Mydigisence Account',
    description: 'Join Mydigisence and build your digital presence.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/register',
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

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
