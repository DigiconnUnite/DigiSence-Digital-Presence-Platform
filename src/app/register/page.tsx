'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<'business' | 'professional'>('business')
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    location: '',
    email: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingInquiry, setExistingInquiry] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  // Check for existing inquiries on mount
  useEffect(() => {
    const checkExistingInquiry = async () => {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const email = localStorage.getItem('registration_email')
        if (email) {
          try {
            const response = await fetch(`/api/registration-inquiries?email=${encodeURIComponent(email)}`)
            if (response.ok) {
              const data = await response.json()
              if (data.inquiries && data.inquiries.length > 0) {
                const latestInquiry = data.inquiries[0]
                setExistingInquiry(latestInquiry)
                
                // Only show status if the inquiry is not rejected
                // If rejected, show the form so they can try again
                if (latestInquiry.status === 'REJECTED') {
                  setShowForm(true)
                  setExistingInquiry(null) // Clear the rejected inquiry to show fresh form
                }
              }
            }
          } catch (error) {
            console.error('Error checking existing inquiry:', error)
          }
        }
      }
    }
    checkExistingInquiry()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submissionData = {
        type: registrationType.toUpperCase(),
        name: formData.name,
        businessName: registrationType === 'business' ? formData.businessName : undefined,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
      }

      const response = await fetch('/api/registration-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        // Store email for future status checks
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('registration_email', formData.email)
        }
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Registration submission failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col p-8 bg-background">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <img
                src="/logo.svg"
                alt="DigiSence Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-slate-800">DigiSence</span>
            </Link>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Registration Submitted!</h1>
                    <p className="text-green-700 mb-6">
                      Thank you for your interest in joining DigiSence. Our team will review your application and contact you soon.
                    </p>
                    <Button
                      onClick={() => router.push('/')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
          role="img"
          aria-label="Professional business illustration"
        />
      </div>
    )
  }

  // Show status if there's an existing inquiry
  if (existingInquiry) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col p-8 bg-background">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <img
                src="/logo.svg"
                alt="DigiSence Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-slate-800">DigiSence</span>
            </Link>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              <Card className={`border-2 ${
                existingInquiry.status === 'COMPLETED' ? 'border-green-200 bg-green-50' :
                existingInquiry.status === 'REJECTED' ? 'border-red-200 bg-red-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    {existingInquiry.status === 'COMPLETED' && (
                      <>
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-green-800 mb-2">Account Created!</h1>
                        <p className="text-green-700 mb-4">
                          Your account has been created successfully. Please check your email for login credentials.
                        </p>
                        <Button
                          onClick={() => router.push('/login')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Go to Login
                        </Button>
                      </>
                    )}
                    
                    {existingInquiry.status === 'REJECTED' && (
                      <>
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-red-800 mb-2">Application Rejected</h1>
                        <p className="text-red-700 mb-4">
                          Unfortunately, your application has been rejected. You can submit a new application below.
                        </p>
                        <div className="space-y-4">
                          <Button
                            onClick={() => {
                              // Clear the stored email to allow fresh registration
                              if (typeof window !== 'undefined' && window.localStorage) {
                                localStorage.removeItem('registration_email')
                              }
                              setExistingInquiry(null)
                              setShowForm(true)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Submit New Application
                          </Button>
                          <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Return to Home
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {existingInquiry.status === 'PENDING' && (
                      <>
                        <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-yellow-800 mb-2">Under Review</h1>
                        <p className="text-yellow-700 mb-4">
                          Your application is currently under review. We'll notify you once a decision has been made.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Application Type: {existingInquiry.type}</p>
                          <p className="text-sm text-gray-600">Submitted: {new Date(existingInquiry.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          onClick={() => router.push('/')}
                          variant="outline"
                          className="mt-4"
                        >
                          Return to Home
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
          role="img"
          aria-label="Professional business illustration"
        />
      </div>
    )
  }

  // Show form if explicitly requested or no existing inquiry
  if (showForm || !existingInquiry) {
    return (
      <div className="min-h-screen flex">
        {/* Left Column - Form */}
        <div className="flex-1 flex flex-col p-8 bg-background">
          {/* Top Header with Logo and Back Button */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <img
                src="/logo.svg"
                alt="DigiSence Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-slate-800">DigiSence</span>
            </Link>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>

          {/* Centered Form */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Join DigiSence</h1>
                <p className="text-muted-foreground mt-2">Register your business or professional profile</p>
              </div>
              
              {/* Status Check */}
              {typeof window !== 'undefined' && window.localStorage && localStorage.getItem('registration_email') && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const email = localStorage.getItem('registration_email')
                      if (email) {
                        try {
                          const response = await fetch(`/api/registration-inquiries?email=${encodeURIComponent(email)}`)
                          if (response.ok) {
                            const data = await response.json()
                            if (data.inquiries && data.inquiries.length > 0) {
                              setExistingInquiry(data.inquiries[0])
                            } else {
                              setExistingInquiry(null)
                            }
                          }
                        } catch (error) {
                          console.error('Error checking status:', error)
                        }
                      }
                    }}
                    className="rounded-xl"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Check Application Status
                  </Button>
                </div>
              )}

              {/* Toggle Switcher */}
              <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'business' | 'professional')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="business" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                    Register as Business
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                    Register as Professional
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="business" className="mt-6">
                  <Card className={`border-2 transition-all duration-300 ${registrationType === 'business' ? 'border-primary shadow-lg' : 'border-border'}`}>
                    <CardHeader>
                      <CardTitle className="text-center">Business Registration</CardTitle>
                      <CardDescription className="text-center">
                        Create your business profile on DigiSence
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name-business">Contact Person Name *</Label>
                          <Input
                            id="name-business"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter contact person name"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input
                            id="businessName"
                            type="text"
                            value={formData.businessName}
                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter business name"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location-business">Location</Label>
                          <Input
                            id="location-business"
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={loading}
                            placeholder="City, Country"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-business">Email *</Label>
                          <Input
                            id="email-business"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter business email"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone-business">Phone Number</Label>
                          <Input
                            id="phone-business"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={loading}
                            placeholder="+91 8080808080"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit Business Registration'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="professional" className="mt-6">
                  <Card className={`border-2 transition-all duration-300 ${registrationType === 'professional' ? 'border-primary shadow-lg' : 'border-border'}`}>
                    <CardHeader>
                      <CardTitle className="text-center">Professional Registration</CardTitle>
                      <CardDescription className="text-center">
                        Create your professional profile on DigiSence
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name-professional">Full Name *</Label>
                          <Input
                            id="name-professional"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your full name"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location-professional">Location</Label>
                          <Input
                            id="location-professional"
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={loading}
                            placeholder="City, Country"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-professional">Email *</Label>
                          <Input
                            id="email-professional"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your email"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone-professional">Phone Number</Label>
                          <Input
                            id="phone-professional"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={loading}
                            placeholder="+91 8080808080"
                            className="focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit Professional Registration'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right Column - Background Image */}
        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
          role="img"
          aria-label="Professional business illustration"
        />
      </div>
    )
  }

  // If we reach here, show the existing inquiry status
  if (existingInquiry) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col p-8 bg-background">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <img
                src="/logo.svg"
                alt="DigiSence Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-slate-800">DigiSence</span>
            </Link>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              <Card className={`border-2 ${
                existingInquiry.status === 'COMPLETED' ? 'border-green-200 bg-green-50' :
                existingInquiry.status === 'REJECTED' ? 'border-red-200 bg-red-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    {existingInquiry.status === 'COMPLETED' && (
                      <>
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-green-800 mb-2">Account Created!</h1>
                        <p className="text-green-700 mb-4">
                          Your account has been created successfully. Please check your email for login credentials.
                        </p>
                        <Button
                          onClick={() => router.push('/login')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Go to Login
                        </Button>
                      </>
                    )}
                    
                    {existingInquiry.status === 'REJECTED' && (
                      <>
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-red-800 mb-2">Application Rejected</h1>
                        <p className="text-red-700 mb-4">
                          Unfortunately, your application has been rejected. You can submit a new application below.
                        </p>
                        <div className="space-y-4">
                          <Button
                            onClick={() => {
                              // Clear the stored email to allow fresh registration
                              if (typeof window !== 'undefined' && window.localStorage) {
                                localStorage.removeItem('registration_email')
                              }
                              setExistingInquiry(null)
                              setShowForm(true)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Submit New Application
                          </Button>
                          <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Return to Home
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {existingInquiry.status === 'PENDING' && (
                      <>
                        <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-yellow-800 mb-2">Under Review</h1>
                        <p className="text-yellow-700 mb-4">
                          Your application is currently under review. We'll notify you once a decision has been made.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Application Type: {existingInquiry.type}</p>
                          <p className="text-sm text-gray-600">Submitted: {new Date(existingInquiry.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          onClick={() => router.push('/')}
                          variant="outline"
                          className="mt-4"
                        >
                          Return to Home
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
          role="img"
          aria-label="Professional business illustration"
        />
      </div>
    )
  }
}