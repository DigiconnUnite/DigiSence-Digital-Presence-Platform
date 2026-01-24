'use client'

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
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForceButton, setShowForceButton] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForceLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const success = await login(email, password, true);
      if (success) {
        router.push("/dashboard/admin");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard/admin");
      } else {
        // If login fails, check if it's due to active session
        const errorData = await (await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })).json();
        
        if (errorData.error === 'This account is already logged in on another device.') {
          setError("This account is already logged in on another device.");
          setShowForceButton(true);
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-white relative z-10">
        <div className="w-full absolute top-0 px-4 py-3 flex justify-between items-center mb-6 sm:mb-10">
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

        <div className="w-full max-w-md">
          <Card className="border-2 transition-all duration-300 rounded-2xl border-primary shadow-lg w-full overflow-hidden">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-xl sm:text-2xl">
                Admin Login
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="admin@example.com"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
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
                      onClick={handleTogglePassword}
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

                {error && (
                  <Alert variant="destructive" className="py-3 text-sm">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {showForceButton && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 hover:bg-accent transition-colors text-sm mb-4"
                    onClick={handleForceLogin}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Force Logout Everywhere"}
                  </Button>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors text-base font-medium"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}