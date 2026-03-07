import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register Your Business - Create Business Profile on Mydigisence",
  description: "Register your business on Mydigisence. Create a professional business profile, showcase your products and services, and connect with potential clients worldwide.",
  keywords: ['business registration', 'company registration', 'business profile', 'product showcase', 'business directory', 'create business listing', 'Mydigisence business registration'],
  openGraph: {
    title: 'Register Your Business - Mydigisence',
    description: 'Register your business on Mydigisence.',
    url: 'https://mydigisence.com/register/business',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://mydigisence.com/register/business',
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

export default function RegisterBusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
