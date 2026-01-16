"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<
    "business" | "professional"
  >("business");
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    location: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingInquiry, setExistingInquiry] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  // Check for existing inquiries on mount
  useEffect(() => {
    const checkExistingInquiry = async () => {
      if (typeof window !== "undefined" && window.localStorage) {
        const email = localStorage.getItem("registration_email");
        if (email) {
          try {
            const response = await fetch(
              `/api/registration-inquiries?email=${encodeURIComponent(email)}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.inquiries && data.inquiries.length > 0) {
                const latestInquiry = data.inquiries[0];
                setExistingInquiry(latestInquiry);

                if (latestInquiry.status === "REJECTED") {
                  setShowForm(true);
                  setExistingInquiry(null);
                }
              }
            }
          } catch (error) {
            console.error("Error checking existing inquiry:", error);
          }
        }
      }
    };
    checkExistingInquiry();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submissionData = {
        type: registrationType.toUpperCase(),
        name: formData.name,
        businessName:
          registrationType === "business" ? formData.businessName : undefined,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
      };

      const response = await fetch("/api/registration-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("registration_email", formData.email);
        }
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Registration submission failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Responsive Layout Wrapper Component to avoid repetition
  const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-white relative z-10">
        {/* Top Header - Absolute Positioning matching Login Page */}
        <div className="w-full absolute top-0 left-0 px-4 py-3 flex justify-between items-center mb-6 sm:mb-10 z-20">
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

        {/* Content - Added top padding to avoid overlapping header on mobile */}
        <div className="w-full max-w-md space-y-6 sm:space-y-8 pt-16 sm:pt-0">
          {children}
        </div>
      </div>

      {/* Right Column - Background Image/Visuals - Matching Login Page Style */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        {/* Optional Text Content for Right Side */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 h-full text-white">
          <div className="max-w-md space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Join the <span className="text-sky-400">DigiSence</span> Community
            </h2>
            <p className="text-lg text-slate-300">
              Start your journey with us today. We are building a platform for
              growth and opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (success) {
    return (
      <ResponsiveLayout>
        <div className="text-center">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Registration Submitted!
              </h1>
              <p className="text-green-700 mb-6">
                Thank you for your interest in joining DigiSence. Our team will
                review your application and contact you soon.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-green-600 hover:bg-green-700 h-11 w-full"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  // Show status if there's an existing inquiry
  if (existingInquiry) {
    return (
      <ResponsiveLayout>
        <Card
          className={`border-2 ${
            existingInquiry.status === "COMPLETED"
              ? "border-green-200 bg-green-50"
              : existingInquiry.status === "REJECTED"
              ? "border-red-200 bg-red-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              {existingInquiry.status === "COMPLETED" && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-green-800 mb-2">
                    Account Created!
                  </h1>
                  <p className="text-green-700 mb-4">
                    Your account has been created successfully. Please check
                    your email for login credentials.
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    className="bg-green-600 hover:bg-green-700 h-11 w-full"
                  >
                    Go to Login
                  </Button>
                </>
              )}

              {existingInquiry.status === "REJECTED" && (
                <>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-red-800 mb-2">
                    Application Rejected
                  </h1>
                  <p className="text-red-700 mb-4">
                    Unfortunately, your application has been rejected. You can
                    submit a new application below.
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        if (
                          typeof window !== "undefined" &&
                          window.localStorage
                        ) {
                          localStorage.removeItem("registration_email");
                        }
                        setExistingInquiry(null);
                        setShowForm(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 h-11 w-full"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Submit New Application
                    </Button>
                    <Button
                      onClick={() => router.push("/")}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 h-11 w-full"
                    >
                      Return to Home
                    </Button>
                  </div>
                </>
              )}

              {existingInquiry.status === "PENDING" && (
                <>
                  <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-yellow-800 mb-2">
                    Under Review
                  </h1>
                  <p className="text-yellow-700 mb-4">
                    Your application is currently under review. We'll notify you
                    once a decision has been made.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Application Type: {existingInquiry.type}</p>
                    <p>
                      Submitted:{" "}
                      {new Date(existingInquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="h-11 w-full"
                  >
                    Return to Home
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  // Show form
  return (
    <ResponsiveLayout>
      {/* Header Text */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Join DigiSence
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Register your business or professional profile
        </p>
      </div>

      {/* Status Check */}
      {typeof window !== "undefined" &&
        window.localStorage &&
        localStorage.getItem("registration_email") && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const email = localStorage.getItem("registration_email");
                if (email) {
                  try {
                    const response = await fetch(
                      `/api/registration-inquiries?email=${encodeURIComponent(
                        email
                      )}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      if (data.inquiries && data.inquiries.length > 0) {
                        setExistingInquiry(data.inquiries[0]);
                      } else {
                        setExistingInquiry(null);
                      }
                    }
                  } catch (error) {
                    console.error("Error checking status:", error);
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
      <Tabs
        value={registrationType}
        onValueChange={(value) =>
          setRegistrationType(value as "business" | "professional")
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
          <Card
            className={`border-2 transition-all duration-300 ${
              registrationType === "business"
                ? "border-primary shadow-lg"
                : "border-border"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Business Registration
              </CardTitle>
              <CardDescription className="text-center">
                Create your business profile on DigiSence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name-business"
                    className="text-sm font-medium"
                  >
                    Contact Person Name *
                  </Label>
                  <Input
                    id="name-business"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter contact person name"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    required
                    disabled={loading}
                    placeholder="Enter business name"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="location-business"
                    className="text-sm font-medium"
                  >
                    Location
                  </Label>
                  <Input
                    id="location-business"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={loading}
                    placeholder="City, Country"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email-business"
                    className="text-sm font-medium"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email-business"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter business email"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone-business"
                    className="text-sm font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone-business"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                    placeholder="+91 8080808080"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transition-colors h-11 font-medium"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Business Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="mt-0 focus:outline-none">
          <Card
            className={`border-2 transition-all duration-300 ${
              registrationType === "professional"
                ? "border-primary shadow-lg"
                : "border-border"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Professional Registration
              </CardTitle>
              <CardDescription className="text-center">
                Create your professional profile on DigiSence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name-professional"
                    className="text-sm font-medium"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name-professional"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your full name"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="location-professional"
                    className="text-sm font-medium"
                  >
                    Location
                  </Label>
                  <Input
                    id="location-professional"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={loading}
                    placeholder="City, Country"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email-professional"
                    className="text-sm font-medium"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email-professional"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your email"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone-professional"
                    className="text-sm font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone-professional"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                    placeholder="+91 8080808080"
                    className="h-11 focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transition-colors h-11 font-medium"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Professional Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ResponsiveLayout>
  );
}
