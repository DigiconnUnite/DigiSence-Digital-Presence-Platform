import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Businesses - Find Companies & Service Providers',
  description: 'Discover top businesses and service providers on DigiSence. Browse local companies, explore products and services, and connect with the best businesses in your industry.',
  keywords: ['business directory', 'company listings', 'local businesses', 'service providers', 'business search', 'find businesses', 'company directory India'],
  openGraph: {
    title: 'Browse Businesses - DigiSence Business Directory',
    description: 'Discover top businesses and service providers on DigiSence. Browse local companies and explore products and services.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
