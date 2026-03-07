import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Login - Access Your Mydigisence Account",
  description: "Sign in to your Mydigisence account to manage your digital presence. Access your business or professional dashboard and connect with clients worldwide.",
  keywords: ['login', 'sign in', 'digital presence login', 'business dashboard login', 'professional login', 'account access', 'Mydigisence login'],
  openGraph: {
    title: 'Login - Mydigisence Account',
    description: 'Sign in to your Mydigisence account to manage your digital presence.',
    url: 'https://mydigisence.com/login',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login - Mydigisence Account',
    description: 'Sign in to your Mydigisence account to manage your digital presence.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/login',
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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
