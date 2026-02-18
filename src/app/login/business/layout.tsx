import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Business Login - Access Your Business Dashboard",
  description: "Sign in to your DigiSence business account. Manage your business profile, connect with professionals, showcase products, and grow your business online.",
  keywords: ['business login', 'company login', 'business dashboard', 'enterprise dashboard', 'product showcase', 'business management'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function BusinessLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
