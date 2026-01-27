"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forceLogout, setForceLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, force: forceLogout }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
      } else {
        // Check if user is admin
        if (data.user.role !== "SUPER_ADMIN") {
          setError("Access denied. Admin privileges required.");
          return;
        }
        router.push("/dashboard/admin");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full flex flex-col justify-center items-center relative bg-white px-4 sm:px-8 lg:px-16 py-12 md:py-0 z-10 overflow-y-auto">
        {/* Top Header */}
        <div className="absolute top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-20">
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
            onClick={() => router.push("/")}
            variant="ghost"
            className="hover:bg-slate-100 text-slate-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-lg space-y-8 pt-8 md:pt-0">
          {/* Header Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-800">
              Admin Login
            </h1>
            <p className="text-base text-slate-500">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Sleek Card */}
          <CardContent className="p-0 space-y-5">
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
                    placeholder="admin@example.com"
                    className="pl-9 h-11 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                    className="pl-9 pr-9 h-11 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Force Logout Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-logout"
                  checked={forceLogout}
                  onCheckedChange={(checked) => setForceLogout(checked as boolean)}
                  disabled={loading}
                />
                <Label
                  htmlFor="force-logout"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Force login (logout other sessions)
                </Label>
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 shadow-lg bg-linear-to-r from-[#5757FF] to-[#A89CFE] cursor-pointer hover:opacity-90 text-white font-medium transition-all transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Forgot Password */}
              <div className="text-center text-sm text-slate-500 pt-2">
                Forgot your password?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80 font-semibold"
                  onClick={() => router.push("/forgot-password")}
                >
                  Reset here
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
}