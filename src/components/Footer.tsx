import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <div
      className="w-full md:px-10 px-6  py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/footer-bg.jpg')" }}
    >
        {/* Top Section */}
        <div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-8 border-b border-gray-700 mb-8"
        >
          <div className="mb-6 lg:mb-0 lg:mr-8">
            <Link href="/" className="flex items-center space-x-3 text-3xl font-bold text-white hover:text-cyan-50 transition-colors duration-300  mb-3">
              <img src="/logo.svg" alt="DigiSence Logo" className="h-10 filter invert hue-rotate-180  w-10" />
              <span>DigiSence</span>
            </Link>
            <p className="text-gray-300 text-base max-w-md leading-relaxed">
              Create professional digital profiles for your business. Showcase products, connect with customers, and grow your brand.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            <div>
              <h3 className="font-semibold text-cyan-50 mb-4 text-lg">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/businesses" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Businesses
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-cyan-50 mb-4 text-lg">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-cyan-50 mb-4 text-lg">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center w-full"
        >
          <p className="text-gray-400 text-sm mb-2 sm:mb-0">
            &copy; 2025 <strong className="text-white">DigiSence</strong>. All rights reserved.  
          </p>
          <span className="text-center text-sm text-gray-400 my-2 sm:my-0 flex-1 sm:flex-none">
            A product of <strong className="text-white">Digiconn Unite Pvt. Ltd.</strong>
          </span>

          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
    </div>
  );
}
