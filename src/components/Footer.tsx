"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <LampContainer>
      <div className="w-full max-w-7xl   py-12">
        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-8 border-b border-gray-700 mb-8"
        >
          <div className="mb-6 lg:mb-0 lg:mr-8">
            <Link href="/" className="text-3xl font-bold text-white hover:text-cyan-400 transition-colors duration-300 block mb-3">
              DigiSence
            </Link>
            <p className="text-gray-300 text-base max-w-md leading-relaxed">
              Create professional digital profiles for your business. Showcase products, connect with customers, and grow your brand.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="font-semibold text-cyan-400 mb-4 text-lg">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Home
                    </Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/business" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Businesses
                    </Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Dashboard
                    </Link>
                  </motion.div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-semibold text-cyan-400 mb-4 text-lg">Account</h3>
              <ul className="space-y-2">
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Login
                    </Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Get Started
                    </Link>
                  </motion.div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-semibold text-cyan-400 mb-4 text-lg">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Contact Us
                    </Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/support" className="text-gray-300 hover:text-white transition-colors duration-300 text-base">
                      Support
                    </Link>
                  </motion.div>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            &copy; 2024 DigiSence. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Facebook className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Twitter className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Instagram className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <Linkedin className="h-5 w-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </LampContainer>
  );
}