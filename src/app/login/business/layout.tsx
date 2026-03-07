import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Business Login - Access Your Business Dashboard | Mydigisence",
  description: "Sign in to your Mydigisence business account. Manage your business profile, connect with professionals, showcase products, and grow your business online.",
  keywords: ['business login', 'company login', 'business dashboard', 'enterprise dashboard', 'product showcase', 'business management', 'Mydigisence business login'],
  openGraph: {
    title: 'Business Login - Mydigisence',
    description: 'Sign in to your Mydigisence business account.',
    url: 'https://mydigisence.com/login/business',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/login/business',
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

export default function BusinessLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
