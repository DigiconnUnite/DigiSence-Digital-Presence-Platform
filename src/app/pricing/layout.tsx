import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Pricing - Choose Your DigiSence Plan",
  description: "View DigiSence pricing plans for businesses and professionals. Choose the perfect plan to build your digital presence. Flexible pricing with no hidden fees.",
  keywords: ['pricing', 'plans', 'subscription', 'pricing plans', 'business pricing', 'professional pricing', 'digital presence pricing', 'India pricing'],
  openGraph: {
    title: 'Pricing - DigiSence Plans',
    description: 'View DigiSence pricing plans for businesses and professionals.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
