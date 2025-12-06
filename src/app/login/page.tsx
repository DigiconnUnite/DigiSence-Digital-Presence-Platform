'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'business' | 'professional'>('business')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForceButton, setShowForceButton] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowForceButton(false)
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
      if (result.error === 'This account is already logged in on another device.') {
        setShowForceButton(true)
      }
    }

    setLoading(false)
  }

  const handleForceLogin = async () => {
    setError('')
    setShowForceButton(false)
    setLoading(true)

    const result = await login(email, password, true)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }

    setLoading(false)
  }

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
            <span className="font-bold text-xl text-primary">DigiSence</span>
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
              <h1 className="text-2xl font-bold text-foreground">Welcome to DigiSence</h1>
              <p className="text-muted-foreground mt-2">Sign in to your account</p>
            </div>

            {/* Toggle Switcher */}
            <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'business' | 'professional')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                  Login as Business
                </TabsTrigger>
                <TabsTrigger value="professional" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                  Login as Professional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="mt-6">
                <Card className={`border-2 transition-all duration-300 ${loginType === 'business' ? 'border-primary shadow-lg' : 'border-border'}`}>
                  <CardHeader>
                    <CardTitle className="text-center">Business Login</CardTitle>
                    <CardDescription className="text-center">
                      Access your business dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-business">Email or Username</Label>
                        <Input
                          id="email-business"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Enter your business email"
                          className="focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-business">Password</Label>
                        <div className="relative">
                          <Input
                            id="password-business"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="pr-10 focus:ring-2 focus:ring-primary transition-all"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-accent transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="link" className="p-0 h-auto text-sm hover:text-primary transition-colors">
                          Forgot Password?
                        </Button>
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      {showForceButton && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full hover:bg-accent transition-colors"
                          onClick={handleForceLogin}
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Force Logout Everywhere'}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login as Business'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="mt-6">
                <Card className={`border-2 transition-all duration-300 ${loginType === 'professional' ? 'border-primary shadow-lg' : 'border-border'}`}>
                  <CardHeader>
                    <CardTitle className="text-center">Professional Login</CardTitle>
                    <CardDescription className="text-center">
                      Access your professional dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-professional">Email or Username</Label>
                        <Input
                          id="email-professional"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Enter your professional email"
                          className="focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-professional">Password</Label>
                        <div className="relative">
                          <Input
                            id="password-professional"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="pr-10 focus:ring-2 focus:ring-primary transition-all"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-accent transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="link" className="p-0 h-auto text-sm hover:text-primary transition-colors">
                          Forgot Password?
                        </Button>
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      {showForceButton && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full hover:bg-accent transition-colors"
                          onClick={handleForceLogin}
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Force Logout Everywhere'}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login as Professional'}
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