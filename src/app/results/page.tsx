"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDown, FaArrowLeft } from "react-icons/fa";
import HomeNav from "../components/HomeNav";

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

  useEffect(() => {
    const hardcodedResults: SearchResult[] = [
      {
        id: "Hike_1",
        original_image_url: "/images/temp/hike1.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "hard",
        region: "Mount Mountain",
        trailhead: "Trailhead 1",
        latitude: -10.0,
        longitude: 15.0,
      },
      {
        id: "Hike_2",
        original_image_url: "/images/temp/hike2.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "easy",
        region: "Mountain",
        trailhead: "Trailhead 2",
        latitude: 112.0,
        longitude: 17.0,
      },
      {
        id: "Hike_3",
        original_image_url: "/images/temp/hike3.jpg",
        elevation: 10,
        trail_length: 67,
        distance: 420,
        difficulty: "medium",
        region: "Trail Mountain",
        trailhead: "Trailhead 3",
        latitude: -10.0,
        longitude: 15.0,
      },
    ];

    setResults(hardcodedResults);
    setUserSketch(sessionStorage.getItem("userSketch"));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isScrolling) return;
      setIsScrolling(true);

      if (e.deltaY > 0) {
        setCurrentIndex((prev) => (prev + 1) % results.length);
      } else if (e.deltaY < 0) {
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

      {isLoading && <p className="text-white text-center mt-20">Loading results...</p>}

      {!isLoading && results.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-white text-xl mb-4">No results found.</p>
          <Link href="/paint">
            <button className="bg-[rgb(76,101,112)] hover:bg-[rgb(106,132,146)] text-white text-xl font-semibold px-8 py-3 rounded-full shadow-lg">
              Try Painting Again
            </button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 w-full flex flex-col items-center pt-20">
        <motion.div className="text-center pt-5 mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your Imagination Comes to Life...
          </motion.h1>

          <motion.h3
            className="mt-4 text-2xl md:text-3xl text-gray-100 font-light tracking-wide"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            ({results[currentIndex]?.latitude.toFixed(4)}, {results[currentIndex]?.longitude.toFixed(4)})
          </motion.h3>
        </motion.div>

        <div className="flex w-full h-full justify-center items-start space-x-12 px-6 md:px-16">
          {/* LEFT COLUMN */}
          {userSketch && (
            <div className="flex-shrink-0 flex flex-col items-center mt-15">
              <h2 className="text-xl text-white font-semibold mb-3">Your Sketch</h2>
              <img
                src={userSketch}
                alt="User's sketch"
                className="rounded-lg shadow-lg border-2 border-white object-cover"
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          )}

          {/* RIGHT COLUMN */}
            {!isLoading && results.length > 0 && (
            <AnimatePresence mode="wait">
                <motion.div
                key={results[currentIndex].id}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -80 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="flex w-full md:w-1/2 bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-2xl shadow-2xl p-6 py-7 space-x-6 mt-10"
                >
                <div className="relative w-1/2 h-50 md:h-64 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                    <Image
                    src={results[currentIndex].original_image_url}
                    alt={`Original image of ${results[currentIndex].id}`}
                    fill
                    className="object-cover rounded-2xl"
                    />
                </div>

                <div className="flex flex-col justify-start text-gray-100 space-y-2 w-1/2">
                    <h1 className="text-2xl font-bold">{results[currentIndex].region}</h1>
                    <p className="text-xl italic mb-5">{results[currentIndex].trailhead}</p>
                    <p>
                    <span className="font-semibold">Elevation:</span> {results[currentIndex].elevation} mi
                    </p>
                    <p>
                    <span className="font-semibold">Trail Length:</span> {results[currentIndex].trail_length} ft
                    </p>
                    <p>
                    <span className="font-semibold">Distance:</span> {results[currentIndex].distance} ft
                    </p>
                    <p>
                    <span className="font-semibold">Difficulty:</span> {results[currentIndex].difficulty}
                    </p>
                </div>
                </motion.div>
            </AnimatePresence>
            )}
        </div>
      </div>

      {/* Scrolling indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="text-lg mb-2">Scroll to see more results</p>
        <FaArrowDown className="text-2xl animate-bounce" />
      </motion.div>

      {/* Back button */}
      <div className="fixed top-5 left-5 translate-x-1/2">
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
