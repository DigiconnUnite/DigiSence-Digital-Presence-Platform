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
import Aurora from '@/components/Aurora'

export default function LoginPage() {
   const [loginType, setLoginType] = useState<'admin' | 'business' | 'professional'>('business')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForceButton, setShowForceButton] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

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

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col px-8 py-6 bg-white">
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
            className="hover:bg-accent border rounded-full py-1 px-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        {/* Centered Form */}
        <div className="flex-1 flex flex-col justify-center  px-20  mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome to DigiSence</h1>
            <p className="text-sm text-muted-foreground mt-4">
              New to DigiSence?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Register your business or professional profile
              </Link>
            </p>
          </div>

          {/* Toggle Switcher */}
          <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'admin' | 'business' | 'professional')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="admin" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Login as Admin
              </TabsTrigger>
              <TabsTrigger value="business" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Login as Business
              </TabsTrigger>
              <TabsTrigger value="professional" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Login as Professional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-0">
              <Card className={`border-2 transition-all duration-300 rounded-2xl ${loginType === 'admin' ? 'border-primary shadow-lg' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="text-center">Admin Login</CardTitle>
                  <CardDescription className="text-center">
                    Access the admin dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="email-admin">Email or Username</Label>
                      <Input
                        id="email-admin"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Enter your admin email"
                        className="focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-admin">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-admin"
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
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm hover:text-primary transition-colors"
                        onClick={handleForgotPassword}
                        type="button"
                      >
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
                      {loading ? 'Logging in...' : 'Login as Admin'}
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      Sign in with Google
                    </Button>

                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <Card className={`border-2 transition-all duration-300 rounded-2xl ${loginType === 'business' ? 'border-primary shadow-lg' : 'border-border'}`}>
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
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm hover:text-primary transition-colors"
                        onClick={handleForgotPassword}
                        type="button"
                      >
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
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      Sign in with Google
                    </Button>

                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="mt-0">
              <Card className={`border-2 transition-all duration-300 rounded-2xl ${loginType === 'professional' ? 'border-primary shadow-lg' : 'border-border'}`}>
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
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm hover:text-primary transition-colors"
                        onClick={handleForgotPassword}
                        type="button"
                      >
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
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                    >
                      Sign in with Google
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Background Image with Aurora Effect */}
      <div className="flex-1 relative bg-linear-30 from-slate-900 bg-sky-900 hidden md:block">

        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Join DigiSence Today</h2>
            <p className="text-lg opacity-90 mb-8">
              Connect with businesses and professionals in your industry. Grow your network and opportunities.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-left">Create a professional profile to showcase your skills</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-left">Connect with businesses looking for talent</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-left">Discover opportunities tailored to your expertise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}