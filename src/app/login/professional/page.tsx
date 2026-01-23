"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff, ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function ProfessionalLoginPage() {
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

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect to professional dashboard
        router.push("/dashboard/professional");
      } else {
        setError(result.error || "Login failed");
        if (
          result.error ===
          "This account is already logged in on another device."
        ) {
          setShowForceButton(true);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setError("");
    setShowForceButton(false);
    setLoading(true);

    try {
      const result = await login(email, password, true);

      if (result.success) {
        router.push("/dashboard/professional");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative bg-white px-4 sm:px-8 lg:px-16 py-12 md:py-0 z-10 overflow-y-auto">
        {/* Top Header */}
        <div className="absolute top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-20 ">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary/10 p-1.5 rounded-md text-primary">
              <img
                src="/logo.svg"
                alt="DigiSence Logo"
                className="h-5 w-auto"
              />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              DigiSence
            </span>
          </Link>
          <Button
            onClick={() => router.push("/login")}
            variant="ghost"
            className="hover:bg-slate-100 text-slate-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-lg space-y-8 pt-8 md:pt-0">
          {/* Header Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-800 ">
              Professional Login
            </h1>
            <p className="text-base text-slate-500">
              Enter your credentials to access your workspace
            </p>
          </div>

          {/* Sleek Card */}
          <Card className="border-slate-200 shadow-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="professional@example.com"
                      className="pl-9 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                    >
                      Password
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs text-primary hover:text-primary/80 font-medium"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
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
                  <Alert
                    variant="destructive"
                    className="py-3 text-sm border-red-100 bg-red-50/50"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Force Login Button */}
                {showForceButton && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 hover:bg-accent transition-colors text-sm"
                    onClick={handleForceLogin}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Force Logout Everywhere"}
                  </Button>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 shadow-none bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login to Professional Dashboard"}
                </Button>

                {/* Divider */}
                {/* <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div> */}

                {/* Google Login */}
                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-slate-200 hover:bg-slate-50 transition-colors"
                  onClick={handleGoogleLogin}
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
                </Button> */}

                {/* Register Link */}
                <div className="text-center text-sm text-slate-500 pt-2">
                  Don't have a professional account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary/80 font-semibold"
                    onClick={() => router.push("/register/professional")}
                  >
                    Register here
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- RIGHT SIDE: IMAGE --- */}
      <div className="hidden md:flex w-full md:w-1/2 relative bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-in-out hover:scale-105"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        ></div>
        
      </div>
    </div>
  );
}
