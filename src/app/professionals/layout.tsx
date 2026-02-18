import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Professionals - Connect with Experts & Specialists',
  description: 'Discover skilled professionals and experts on DigiSence. Find doctors, lawyers, developers, designers, and more. Connect with top professionals in your area.',
  keywords: ['professional directory', 'find professionals', 'expert search', 'skilled workers', 'consultants', 'professionals India', 'hire professionals'],
  openGraph: {
    title: 'Find Professionals - DigiSence Directory',
    description: 'Discover skilled professionals and experts on DigiSence.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ProfessionalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
