import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="bg-white/50 backdrop-blur shadow-sm border-b min-w-screen sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              DigiSence
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/businesses" className="text-muted-foreground hover:text-primary transition-colors">
              Businesses
            </Link>
            <Link href="/professionals" className="text-muted-foreground hover:text-primary transition-colors">
              Professionals
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}