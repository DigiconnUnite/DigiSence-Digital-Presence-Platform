import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Businesses - Find Companies & Service Providers | Mydigisence',
  description: 'Discover top businesses and service providers on Mydigisence. Browse local companies, explore products and services, and connect with the best businesses in your industry. India\'s leading business directory.',
  keywords: ['business directory', 'company listings', 'local businesses', 'service providers', 'business search', 'find businesses', 'company directory India', 'Mydigisence business', 'online business directory', 'businesses near me'],
  openGraph: {
    title: 'Browse Businesses - Mydigisence Business Directory',
    description: 'Discover top businesses and service providers on Mydigisence. Browse local companies and explore products and services.',
    url: 'https://mydigisence.com/businesses',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Businesses - Mydigisence Business Directory',
    description: 'Discover top businesses and service providers on Mydigisence.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/businesses',
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

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
