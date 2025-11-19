import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Digisence</span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4">Business Digital Presence Platform</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Digital Profiles
            <br />
            <span className="text-gray-900">For Every Business</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamlined, centralized platform that provides every business with a professional, 
            consistent, and high-performance digital profile. No complexity, just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Access Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

  
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join businesses that trust BDPP for their digital presence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild>
                <Link href="/login">Access Your Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">BD</span>
            </div>
            <span className="text-lg font-semibold">BDPP</span>
          </div>
          <p className="text-gray-400">
            Business Digital Presence Platform - Professional profiles for every business.
          </p>
        </div>
      </footer>
    </div>
  )
}