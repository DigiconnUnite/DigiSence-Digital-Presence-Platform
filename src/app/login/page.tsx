"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, ArrowLeft, User, Briefcase } from "lucide-react";

// Reusable Form Component to reduce code duplication
function AuthForm({
  title,
  description,
  submitLabel,
  email,
  password,
  showPassword,
  setEmail,
  setPassword,
  setShowPassword,
  loading,
  error,
  showForceButton,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onForceLogin,
  onGoogleLogin,
}: any) {
  return (
    <Card className="border-2 transition-all duration-300 rounded-2xl border-primary shadow-lg w-full overflow-hidden">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-xl sm:text-2xl">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email or Username
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="name@example.com"
              className="h-11 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs text-primary hover:text-primary/80"
                onClick={onForgotPassword}
              >
                Forgot Password?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10 h-11 focus:ring-2 focus:ring-primary transition-all"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                onClick={onTogglePassword}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="py-3 text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Force Login Button */}
          {showForceButton && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 hover:bg-accent transition-colors text-sm"
              onClick={onForceLogin}
              disabled={loading}
            >
              {loading ? "Processing..." : "Force Logout Everywhere"}
            </Button>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors text-base font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : submitLabel}
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-slate-200 hover:bg-slate-50 transition-colors"
            onClick={onGoogleLogin}
            disabled={loading}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoginContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-white relative z-10">
        <div className="w-full absolute top-0 px-4 py-3 flex justify-between items-center mb-6 sm:mb-10">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="DigiSence Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-slate-800">DigiSence</span>
          </Link>
          <Button
            onClick={() => router.push("/login")}
            variant="ghost"
            className="hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        <div className="w-full max-w-7xl space-y-6 sm:space-y-8">
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="border-2 transition-all hover:bg-sky-50  duration-300 rounded-2xl border-primary shadow-lg w-full overflow-hidden cursor-pointer hover:shadow-2xl"
              onClick={() => router.push("/login/professional")}
            >
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-xl sm:text-2xl">
                  <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                  Continue as Professional
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base">
                  Access your professional dashboard and manage your profile.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-2 transition-all duration-300 hover:bg-sky-50 rounded-2xl border-primary shadow-lg w-full overflow-hidden cursor-pointer hover:shadow-xl"
              onClick={() => router.push("/login/business")}
            >
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-xl sm:text-2xl">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
                  Continue as Business
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base">
                  Manage your business dashboard and connect with professionals.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center text-sm text-slate-500 space-y-2">
            <p>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
