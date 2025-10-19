// src/app/results/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Use Next.js Image for optimization
import HomeNav from "../components/HomeNav"; // Re-use your nav bar

// This type MUST match the JSON response from your Python server
interface SearchResult {
  id: string;
  score: number;
  original_image_url: string; // e.g., /images/original/hike_1.webp
  segmentation_map_url: string; // e.g., /images/processed/hike_1_ui_map.png
}

export default function ResultsPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [userSketch, setUserSketch] = useState<string | null>(null); // <-- NEW STATE
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "rgb(88,128,115)" }}>
      <HomeNav />
      <div className="container mx-auto p-4 pt-20">
        <h1 className="text-4xl text-white font-bold text-center mb-4">
          Your Visual Matches!
        </h1>

        {/* --- NEW SECTION: DISPLAY USER SKETCH --- */}
        {userSketch && (
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-2xl text-white font-semibold mb-3">Your Sketch</h2>
            {/* We use a regular <img> tag here because the src is a dataURL string */}
            <img
              src={userSketch}
              alt="User's original sketch"
              className="rounded-lg shadow-xl border-4 border-white"
              style={{ width: '300px', height: '300px' }} // Display it a bit smaller
            />
          </div>
        )}
        {/* --- END NEW SECTION --- */}


        {isLoading && (
          <p className="text-white text-center">Loading results...</p>
        )}

        {!isLoading && results.length === 0 && (
          <div className="text-center">
            <p className="text-white text-xl mb-4">No results found.</p>
            <Link href="/paint">
              <button className="bg-[rgb(76,101,112)] hover:bg-[rgb(106,132,146)] text-white text-xl font-semibold px-8 py-3 rounded-full shadow-lg">
                Try Painting Again
              </button>
            </Link>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-[rgb(106,132,146)] rounded-lg shadow-xl overflow-hidden"
              >
                <div className="grid grid-cols-2">
                  {/* We must use a relative position container for Next.js Image */}
                  <div className="relative w-full h-60">
                    <Image
                      src={result.original_image_url}
                      alt={`Original image of ${result.id}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="relative w-full h-60">
                    <Image
                      src={result.segmentation_map_url}
                      alt={`Segmentation map for ${result.id}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="p-4 text-white">
                  <h3 className="text-lg font-semibold truncate">{result.id}</h3>
                  <p className="text-sm">
                    Match Score: {result.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back button */}
        <div className="text-center mt-12 mb-8">
          <Link href="/paint">
            <button className="bg-[rgb(235,199,148)] text-[rgb(32,74,65)] text-xl font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-[rgb(216,175,87)] transition-all">
              ← Back to Painting
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}