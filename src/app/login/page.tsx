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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

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
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";
  const [loginType, setLoginType] = useState<"business" | "professional">(
    isAdmin ? "business" : "business"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForceButton, setShowForceButton] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowForceButton(false);
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
      if (
        result.error === "This account is already logged in on another device."
      ) {
        setShowForceButton(true);
      }
    }
    setLoading(false);
  };

  const handleForceLogin = async () => {
    setError("");
    setShowForceButton(false);
    setLoading(true);

    const result = await login(email, password, true);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">

      <div className="flex-1 flex  flex-col justify-center items-center w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-white relative z-10">
       
        <div className="w-full absolute top-0   px-4 py-3 flex justify-between items-center mb-6 sm:mb-10">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="DigiSence Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-slate-800">DigiSence</span>
          </Link>
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
  
        </div>

    
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>

          {isAdmin ? (
            <AuthForm
              title="Admin Login"
              description="Secure access for administrators"
              submitLabel="Login as Admin"
              email={email}
              password={password}
              showPassword={showPassword}
              setEmail={setEmail}
              setPassword={setPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              error={error}
              showForceButton={showForceButton}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmit}
              onForgotPassword={handleForgotPassword}
              onForceLogin={handleForceLogin}
              onGoogleLogin={handleGoogleLogin}
            />
          ) : (
            <Tabs
              value={loginType}
              onValueChange={(value) =>
                setLoginType(value as "business" | "professional")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-11 bg-slate-100 p-1">
                <TabsTrigger
                  value="business"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm sm:text-base font-medium"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm sm:text-base font-medium"
                >
                  Professional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="mt-0 focus:outline-none">
                <AuthForm
                  title="Business Login"
                  description="Manage your business dashboard"
                  submitLabel="Login as Business"
                  email={email}
                  password={password}
                  showPassword={showPassword}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  setShowPassword={setShowPassword}
                  loading={loading}
                  error={error}
                  showForceButton={showForceButton}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  onSubmit={handleSubmit}
                  onForgotPassword={handleForgotPassword}
                  onForceLogin={handleForceLogin}
                  onGoogleLogin={handleGoogleLogin}
                />
              </TabsContent>

              <TabsContent
                value="professional"
                className="mt-0 focus:outline-none"
              >
                <AuthForm
                  title="Professional Login"
                  description="Access your professional profile"
                  submitLabel="Login as Professional"
                  email={email}
                  password={password}
                  showPassword={showPassword}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  setShowPassword={setShowPassword}
                  loading={loading}
                  error={error}
                  showForceButton={showForceButton}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  onSubmit={handleSubmit}
                  onForgotPassword={handleForgotPassword}
                  onForceLogin={handleForceLogin}
                  onGoogleLogin={handleGoogleLogin}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Right Column - Background Image/Visuals */}
      {/* Added hidden md:flex to ensure this is ONLY visible on medium screens and up */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 h-full text-white">
          <div className="max-w-md space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Join the <span className="text-sky-400">DigiSence</span> Community
            </h2>
            <p className="text-lg text-slate-300">
              Connect with businesses and professionals in your industry. Grow
              your network and discover new opportunities.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-sky-500/20 border border-sky-500/50 rounded-full p-2">
                  <svg
                    className="h-5 w-5 text-sky-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Showcase your skills
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Create a professional profile that stands out.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-sky-500/20 border border-sky-500/50 rounded-full p-2">
                  <svg
                    className="h-5 w-5 text-sky-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Connect & Grow</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Find businesses looking for your specific expertise.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-sky-500/20 border border-sky-500/50 rounded-full p-2">
                  <svg
                    className="h-5 w-5 text-sky-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Unlock Opportunities
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Get matched with tailored projects instantly.
                  </p>
                </div>
              </div>
            </div>
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
