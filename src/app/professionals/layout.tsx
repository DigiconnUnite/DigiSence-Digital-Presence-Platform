import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Professionals - Connect with Experts & Specialists | Mydigisence',
  description: 'Discover skilled professionals and experts on Mydigisence. Find doctors, lawyers, developers, designers, and more. Connect with top professionals in your area. India\'s leading professional directory.',
  keywords: ['professional directory', 'find professionals', 'expert search', 'skilled workers', 'consultants', 'professionals India', 'hire professionals', 'Mydigisence professionals', 'expert directory', 'professionals near me'],
  openGraph: {
    title: 'Find Professionals - Mydigisence Directory',
    description: 'Discover skilled professionals and experts on Mydigisence. Find doctors, lawyers, developers, designers, and more.',
    url: 'https://mydigisence.com/professionals',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Professionals - Mydigisence Directory',
    description: 'Discover skilled professionals and experts on Mydigisence.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/professionals',
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

export default function ProfessionalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
