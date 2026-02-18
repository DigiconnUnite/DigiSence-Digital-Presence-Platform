import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register Your Business - Create Business Profile on DigiSence",
  description: "Register your business on DigiSence. Create a professional business profile, showcase your products and services, and connect with potential clients worldwide.",
  keywords: ['business registration', 'company registration', 'business profile', 'product showcase', 'business directory', 'create business listing'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterBusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
