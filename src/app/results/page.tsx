"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDown, FaArrowLeft } from "react-icons/fa";
import HomeNav from "../components/HomeNav";
import { LargeNumberLike } from "crypto";

interface SearchResult {
  id: string;
  original_image_url: string;
  elevation: number;
  trail_length: number;
  distance: number;
  difficulty: string;
  region: string;
  trailhead: string;
  latitude: number;
  longitude: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSketch, setUserSketch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  /*
  useEffect(() => {
    // On page load, read both items from session storage
    const storedResults = sessionStorage.getItem("searchResults");
    const storedSketch = sessionStorage.getItem("userSketch"); // <-- NEW

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedSketch) {
      setUserSketch(storedSketch); // <-- NEW
    }
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs only once on load
  */

  useEffect(() => {
    // HARDCODED RESULTS
    const hardcodedResults: SearchResult[] = [
      {
        id: "Hike_1",
        original_image_url: "/images/temp/hike1.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "hard",
        region: "Mount Mountain",
        trailhead: "trailhead",
        latitude: -10.000,
        longitude: 15.000,
      },
      {
        id: "Hike_2",
        original_image_url: "/images/temp/hike2.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "easy",
        region: "Mountain",
        trailhead: "trailhead",
        latitude: 112.000,
        longitude: 17.000,
      },
      {
        id: "Hike_3",
        original_image_url: "/images/temp/hike3.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "medium",
        region: "Trail Mountain",
        trailhead: "trailhead",
        latitude: -10.000,
        longitude: 15.000,
      },
      {
        id: "Hike_4",
        original_image_url: "/images/temp/hike4.jpeg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "super hard",
        region: "Mountain",
        trailhead: "trailhead",
        latitude: 20.000,
        longitude: 35.000,
      },
      {
        id: "Hike_5",
        original_image_url: "/images/temp/hike5.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "super easy",
        region: "Mountain",
        trailhead: "trailhead",
        latitude: 10.000,
        longitude: 15.000,
      },
    ];

    setResults(hardcodedResults);
    setIsLoading(false);
  }, []);

  // Scroll handler to move between results
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isScrolling) return;
      setIsScrolling(true);

      if (e.deltaY > 0) {
        // Scroll down
        setCurrentIndex((prev) => (prev + 1) % results.length);
      } else if (e.deltaY < 0) {
        // Scroll up
        setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
      }

      setTimeout(() => setIsScrolling(false), 800);
    };

    window.addEventListener("wheel", handleScroll, { passive: true });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [isScrolling, results.length]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[rgb(106,132,146)]">
      <HomeNav />
      <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center text-white">
        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              key={results[currentIndex].id}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center"
            >
              <motion.h1
                className="text-4xl font-bold mb-4 drop-shadow-lg -translate-y-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Your Imagination Comes to Life...
              </motion.h1>

              <motion.h3
                className="mt-4 text-2xl md:text-3xl text-gray-100 font-light -translate-y-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p><span>(</span>{results[currentIndex].latitude.toFixed(4)}<span>, </span>{results[currentIndex].longitude.toFixed(4)}<span>)</span></p>
              </motion.h3>

              <div className="flex flex-col justify-center w-full md:w-1/3 text-left text-gray-100">
                <p className="text-3xl mb-1 text-bold">{results[currentIndex].region}</p>
                <p className="text-lg italic">{results[currentIndex].trailhead}</p>
              </div>
            
              <div className="flex flex-col w-full md:w-1/3">
                <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={results[currentIndex].original_image_url}
                    alt={`Original image of ${results[currentIndex].id}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="mt-4 text-left text-gray-100 space-y-2">
                  <p><span className="font-semibold">Elevation:</span> {results[currentIndex].elevation} <span className="font-semibold"> mi</span></p>
                  <p><span className="font-semibold">Trail Length:</span> {results[currentIndex].trail_length} <span className="font-semibold"> ft</span></p>
                  <p><span className="font-semibold">Distance:</span> {results[currentIndex].distance}<span className="font-semibold"> ft</span></p>
                  <p><span className="font-semibold">Difficulty:</span> {results[currentIndex].difficulty}</p>
                </div>
              </div>

              <motion.div
                className="absolute bottom-16 flex flex-col items-center text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <p className="text-lg mb-2">Scroll to see more results</p>
                <FaArrowDown className="text-2xl animate-bounce" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back button */}
      <div className="fixed top-5 transform translate-x-1/2">
        <Link href="/paint">
          <button className="flex items-center justify-center text-white text-lg font-semibold py-3 transition-all cursor-pointer">
            <FaArrowLeft className="text-xl mr-2" />
            Back to Painting
          </button>
        </Link>
      </div>
    </div>
  );
}
