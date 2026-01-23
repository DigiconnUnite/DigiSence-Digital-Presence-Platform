"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const images = [
  "d-1.png",
  "m-1.png",
  "d-1.png",
  "m-1.png",
  "d-1.png",
  "m-1.png",
];

export default function HeroSectionOne() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleImageClick = (index: number) => {
    if (!isDragging) {
      setActiveIndex(index);
    }
  };

  // Auto-scroll functionality for infinite carousel
  useEffect(() => {
    if (!isClient || isHovered || isDragging) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, isDragging, isClient]);

  // Responsive values
  const getResponsiveValues = () => {
    if (typeof window === "undefined")
      return {
        radius: 700,
        cardWidth: 200,
        dragSensitivity: 100,
        containerHeight: 500,
        perspective: 12000,
      };

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mobile specific optimizations
    if (width < 640) {
      // Adjust for mobile viewport
      const mobileHeight = Math.min(height * 0.6, 400);
      return {
        radius: Math.min(width * 0.8, 280),
        cardWidth: Math.min(width * 0.4, 120),
        dragSensitivity: 60,
        containerHeight: mobileHeight,
        perspective: 8000,
      };
    }

    // Tablet specific optimizations
    if (width < 1024) {
      return {
        radius: 500,
        cardWidth: 160,
        dragSensitivity: 80,
        containerHeight: 600,
        perspective: 10000,
      };
    }

    // Desktop
    return {
      radius: 700,
      cardWidth: 200,
      dragSensitivity: 100,
      containerHeight: 800,
      perspective: 12000,
    };
  };

  const [responsiveValues, setResponsiveValues] = useState({
    radius: 700,
    cardWidth: 200,
    dragSensitivity: 100,
    containerHeight: 500,
    perspective: 12000,
  });

  useEffect(() => {
    const handleResize = () => {
      const newValues = getResponsiveValues();
      setResponsiveValues(newValues);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radius, cardWidth, dragSensitivity, containerHeight, perspective } =
    responsiveValues;
  const totalCards = images.length;
  const angleStep = (2 * Math.PI) / totalCards;

  // Drag handlers with improved touch support
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartIndex.current = activeIndex;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX.current;
    const indexDelta = Math.round(-deltaX / dragSensitivity);
    const newIndex =
      (dragStartIndex.current + indexDelta + totalCards) % totalCards;
    setActiveIndex(newIndex);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Prevent scrolling when dragging on mobile
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      return () => {
        document.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [isDragging]);

  return (

    <div className="relative py-20 md:py-30 h-fit overflow-hidden bg-linear-to-t to-[#5757FF] via-[#A89CFE] from-white">
     
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "160px", height: "160px", top: "5%", left: "5%" }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "60px", height: "60px", top: "10%", left: "85%" }}
        animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "120px", height: "120px", top: "25%", left: "40%" }}
        animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "200px", height: "200px", top: "40%", left: "75%" }}
        animate={{ y: [0, 15, 0], x: [0, -20, 0] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 2,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "80px", height: "80px", top: "60%", left: "10%" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.2,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "50px", height: "50px", top: "55%", left: "50%" }}
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1.5,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "140px", height: "140px", top: "70%", left: "30%" }}
        animate={{ y: [0, -10, 0], x: [0, 25, 0] }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.8,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "90px", height: "90px", top: "85%", left: "80%" }}
        animate={{ y: [0, 35, 0], x: [0, -5, 0] }}
        transition={{
          duration: 7.2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.3,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "40px", height: "40px", top: "20%", left: "20%" }}
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1.2,
        }}
      />
      <motion.div
        className="absolute border-t rounded-full shadow-md bg-linear-to-b to-[#5757FF] via-[#A89CFE] from-white z-0"
        style={{ width: "110px", height: "110px", top: "45%", left: "5%" }}
        animate={{ y: [0, 25, 0], x: [0, -25, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.7,
        }}
      />


      <div className="absolute inset-0 w-full h-full backdrop-blur-[5px] z-10 pointer-events-none bg-white/5"></div>

      {/* LAYER 3: Content (z-20 & z-30) */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 z-20">
        <div className="py-8 md:py-16 lg:py-20 w-full">
          <h1 className="relative mx-auto max-w-4xl text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-slate-50">
            {"Your One-Stop Solution for a Stunning Digital Profiles"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(50px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="mr-1 sm:mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <button className="w-full sm:w-48 md:w-60 transform rounded-lg px-6 py-2.5 font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg border border-white/50 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Explore Now
            </button>
            <button className="w-full sm:w-48 md:w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="w-full relative z-10 pb-12">
        <div className="flex items-center">
          <motion.div
            className="flex gap-6 md:gap-10"
            animate={{
              x: [0, -3000], 
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {[...images, ...images, ...images, ...images].map((img, i) => {
              // Alternate between 16:9 and 9:16
              const isPortrait = i % 2 !== 0;

              return (
                <div
                  key={`marquee-${i}`}
                  className="relative flex-shrink-0 z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white/30 duration-300"
                  style={{
                  
                    width: isPortrait ? "auto" : "40rem",
                    height: isPortrait ? "24rem" : "auto",

                    aspectRatio: isPortrait ? "9/16" : "16/9",

                    maxWidth: "90vw",
                  }}
                >
                  <div className="w-full h-full bg-white backdrop-blur-sm flex items-center justify-center">
                    <Image
                      src={`/${img}`}
                      alt="slider"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
