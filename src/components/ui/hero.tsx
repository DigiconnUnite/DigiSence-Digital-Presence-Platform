"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const images = [
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",
  "https://assets.aceternity.com/pro/aceternity-landing.webp",
  "https://assets.aceternity.com/pro/dashboard.webp",

];

export default function HeroSectionOne() {
  const [activeIndex, setActiveIndex] = useState(2); // Start with middle image active
  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
  };

  // Auto-scroll functionality for infinite carousel
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <>
      <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Launch your website in hours, not days"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          With AI, you can launch your website in hours, not days. Try our best
          in class, state of the art, cutting edge AI tools to get your website
          up.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Explore Now
          </button>
          <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
            Contact Support
          </button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
            className="relative border  z-10 mt-20"
          >

          </motion.div>
        </div>

      </div>
      <div
        className="relative flex h-[500px] border items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Only render 11 cards at a time for the carousel effect */}
        {Array.from({ length: 11 }, (_, i) => {
          const cardIndex = (activeIndex - 5 + i + images.length) % images.length;
          const offset = i - 5; // -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5
          const rotateY = 0;
          // Progressive scaling: center big, then smaller as distance increases
          const scale = offset === 0 ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.13);
          const translateX = offset * 190; // Adjust spacing for 11 cards to fit
          const zIndex = offset === 0 ? 10 : 5 - Math.abs(offset);

          return (
            <motion.div
              key={`${cardIndex}-${i}`}
              className="absolute cursor-pointer"
              style={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
              }}
              animate={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={() => handleImageClick(cardIndex)}
            >
              <div className="w-[337px] overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                <img
                  src={images[cardIndex]}
                  alt={`Preview ${cardIndex + 1}`}
                  className="aspect-[9/16] h-auto w-full object-cover"
                  height={600}
                  width={337}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
