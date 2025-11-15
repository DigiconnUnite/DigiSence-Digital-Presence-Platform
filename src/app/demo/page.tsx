import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BDPP Demo</span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Back to Home
              </Link>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4">Live Demo</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            See BDPP in Action
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore our platform with sample data and experience the full functionality.
          </p>
        </div>
      </section>

      {/* Demo Access */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try the Platform
            </h2>
            <p className="text-xl text-gray-600">
              Use these demo accounts to explore different user roles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Super Admin Demo */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm">
                Admin Access
              </div>
              <CardHeader>
                <CardTitle>Super Admin Dashboard</CardTitle>
                <CardDescription>
                  Complete platform control with user management and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Login Credentials:</p>
                  <p className="text-sm"><strong>Email:</strong> admin@bdpp.com</p>
                  <p className="text-sm"><strong>Password:</strong> admin123</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Create and manage businesses</p>
                  <p>✓ Manage categories</p>
                  <p>✓ View platform analytics</p>
                  <p>✓ User administration</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Try Super Admin</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Business Admin Demo */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm">
                Business Access
              </div>
              <CardHeader>
                <CardTitle>Business Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage business profile, products, and customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Login Credentials:</p>
                  <p className="text-sm"><strong>Email:</strong> john@restaurant.com</p>
                  <p className="text-sm"><strong>Password:</strong> business123</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Edit business profile</p>
                  <p>✓ Manage products/services</p>
                  <p>✓ Respond to inquiries</p>
                  <p>✓ View business analytics</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Try Business Admin</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Public Business Profile Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Public Business Profile</CardTitle>
              <CardDescription>
                See how customers view business profiles on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Sample Business:</p>
                <p className="text-sm"><strong>Name:</strong> John's Fine Dining</p>
                <p className="text-sm"><strong>Category:</strong> Restaurants</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Professional business layout</p>
                <p>✓ Hero slider with images</p>
                <p>✓ Product/service showcase</p>
                <p>✓ Customer inquiry forms</p>
                <p>✓ Contact information</p>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/johns-fine-dining">View Business Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for professional business profiles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure authentication with Super Admin and Business Admin roles, 
                  each with appropriate permissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fixed Template Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Consistent, professional layout across all businesses with 
                  hero sections, product showcases, and contact forms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Easy-to-use interface for business admins to manage their 
                  profile content, products, and services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Integrated inquiry system with product-specific questions and 
                  customer contact management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hierarchical category system for organizing businesses 
                  and improving discoverability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Responsive Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mobile-optimized interface that works perfectly on all 
                  devices and screen sizes.
                </CardDescription>
              </CardContent>
            </Card>
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
                Experience the full power of BDPP with our interactive demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/login">Access Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/johns-fine-dining">View Sample Business</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
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