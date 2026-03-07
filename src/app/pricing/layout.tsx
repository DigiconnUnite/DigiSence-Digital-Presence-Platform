import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Pricing - Choose Your Mydigisence Plan",
  description: "View Mydigisence pricing plans for businesses and professionals. Choose the perfect plan to build your digital presence. Flexible pricing with no hidden fees.",
  keywords: ['pricing', 'plans', 'subscription', 'pricing plans', 'business pricing', 'professional pricing', 'digital presence pricing', 'India pricing', 'Mydigisence pricing'],
  openGraph: {
    title: 'Pricing - Mydigisence Plans',
    description: 'View Mydigisence pricing plans for businesses and professionals.',
    url: 'https://mydigisence.com/pricing',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Mydigisence Plans',
    description: 'View Mydigisence pricing plans for businesses and professionals.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/pricing',
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

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
