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
  User,
  Briefcase,
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
        <div className="w-full max-w-7xl space-y-6 sm:space-y-8 pt-16 sm:pt-0">
          {children}
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

      {/* Cards for Professional and Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="border-2 transition-all duration-300 rounded-2xl border-primary shadow-lg w-full overflow-hidden cursor-pointer hover:shadow-xl"
          onClick={() => router.push("/register/professional")}
        >
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl sm:text-2xl">
              <User className="h-8 w-8 mx-auto mb-2 text-primary" />
              Register as Professional
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Create your professional profile and showcase your skills.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="border-2 transition-all duration-300 rounded-2xl border-primary shadow-lg w-full overflow-hidden cursor-pointer hover:shadow-xl"
          onClick={() => router.push("/register/business")}
        >
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl sm:text-2xl">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
              Register as Business
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Create your business profile and connect with professionals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center text-sm text-slate-500 space-y-2">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium transition-all"
          >
            Login here
          </Link>
        </p>
      </div>
    </ResponsiveLayout>
  );
}
