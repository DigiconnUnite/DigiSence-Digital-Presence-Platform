"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function BusinessRegistrationPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Simulate API call for business registration
      const response = await fetch("/api/auth/register/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Business registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login/business");
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
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
            <span className="font-bold text-xl text-slate-800 ">
              DigiSence
            </span>
          </Link>
          <Button
            onClick={() => router.push("/register")}
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
              Business Account
            </h1>
            <p className="text-base text-slate-500">
              Expand your business reach with us
            </p>
          </div>

          {/* Sleek Card */}
          <Card className="border-slate-200 shadow-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="businessName"
                    className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                  >
                    Business Name
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Acme Corporation"
                      className="pl-9 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                    />
                  </div>
                </div>

                {/* Email */}
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
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="business@example.com"
                      className="pl-9 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                    />
                  </div>
                </div>

                {/* Phone & Address Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                    >
                      Phone
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="+1 234 567 890"
                        className="pl-9 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                    >
                      Address
                    </Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="City, Country"
                        className="pl-9 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
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
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="••••••••"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-bold uppercase text-slate-500 tracking-wider"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-11 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <Alert
                    variant="destructive"
                    className="py-3 text-sm border-red-100 bg-red-50/50"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="py-3 text-sm border-green-100 bg-green-50 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 shadow-none bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Business Account"}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-slate-500 pt-2">
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary/80 font-semibold"
                    onClick={() => router.push("/login/business")}
                  >
                    Log in
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-slate-400">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
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
