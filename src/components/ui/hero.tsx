"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Android } from "./android";

const images = [
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
  "profile-1.png",
  "profile-2.png",
];

export default function HeroSectionOne() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

  const handleImageClick = (index: number) => {
    if (!isDragging) {
      setActiveIndex(index);
    }
  };

  // Auto-scroll functionality for infinite carousel
  useEffect(() => {
    if (isHovered || isDragging) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  // Responsive values
  const getResponsiveValues = () => {
    if (typeof window === "undefined") return { radius: 700, cardWidth: 200, dragSensitivity: 100 };
    const width = window.innerWidth;
    if (width < 640) return { radius: 350, cardWidth: 120, dragSensitivity: 60 };
    if (width < 1024) return { radius: 500, cardWidth: 160, dragSensitivity: 80 };
    return { radius: 700, cardWidth: 200, dragSensitivity: 100 };
  };

  const [responsiveValues, setResponsiveValues] = useState({ radius: 1500, cardWidth: 300, dragSensitivity: 0 });

  useEffect(() => {
    const handleResize = () => setResponsiveValues(getResponsiveValues());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radius, cardWidth, dragSensitivity } = responsiveValues;
  const totalCards = images.length;
  const angleStep = (2 * Math.PI) / totalCards;

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartIndex.current = activeIndex;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX.current;
    const indexDelta = Math.round(-deltaX / dragSensitivity);
    const newIndex = (dragStartIndex.current + indexDelta + totalCards) % totalCards;
    setActiveIndex(newIndex);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative py-30 h-fit overflow-hidden primary-gradient">

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex items-center justify-center -translate-x-1/2"
      >
        <div className="h-[600px] w-[600px] sm:h-[700px] sm:w-[700px] lg:h-[700px] lg:w-[1200px] rounded-full bg-cyan-700 opacity-20 blur-3xl shadow-2xl " />
      </div>

      <div className="relative mx-auto    flex max-w-7xl flex-col items-center justify-center px-4">
        <div className="py-8 md:py-16 lg:py-20 w-full">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-slate-50">
            {"Launch your website in hours, not days"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
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
            className="relative z-10 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <button className="w-full sm:w-48 md:w-60 transform rounded-lg bg-slate-800 px-6 py-2.5 font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg border border-white/50 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Explore Now
            </button>
            <button className="w-full sm:w-48 md:w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>

      <div
        className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] flex max-w-screen mx-auto items-center justify-center overflow-hidden select-none"
        style={{
          perspective: "12000px",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleDragEnd();
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >

        <div
          className="relative mx-auto flex h-full w-full items-center justify-center"
          style={{
            width: cardWidth,
            height: cardWidth * 2,
            transformStyle: "preserve-3d",
          }}
        >
          {images.map((image, i) => {
            // Calculate angle for each card on the cylinder
            const angle = angleStep * i - angleStep * activeIndex;

            // Calculate 3D position on cylinder
            const translateX = Math.sin(angle) * radius;
            const translateZ = Math.cos(angle) * radius - radius;
            const rotateY = (angle * 0) / Math.PI;

            // Cards in front are more visible
            const isFront = Math.cos(angle) > 0;
            // const opacity = isFront ? 0.5 + Math.cos(angle) * 0.5 : 0.3;
            const scale = isFront ? 0.9 + Math.cos(angle) * 0.9 : 0.2;
            const zIndex = Math.round(Math.cos(angle) * 100) + 100;

            return (
              <motion.div
                key={`card-${i}`}
                className="absolute left-1/2 top-1/2 mx-auto flex items-center justify-center pointer-events-auto"
                animate={{
                  x: translateX - cardWidth / 3,
                  y: -cardWidth,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  // opacity: opacity,
                }}
                transition={{
                  duration: isDragging ? 0.18 : 0.5,
                  ease: isDragging ? [0.33, 1, 0.68, 1] : [0.23, 1, 0.32, 1],
                }}
                style={{
                  zIndex,
                  transformStyle: "preserve-3d",
                  width: cardWidth,
                }}
                onClick={() => handleImageClick(i)}
              >
                <Android
                  src={image}
                  className="h-full w-full  object-contain pointer-events-none"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
