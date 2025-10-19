// src/app/components/Canvas.tsx

"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // <-- IMPORT useRouter

type BrushType =
  | "Sky" | "Mountain" | "Lake" | "Trees" | "Flowers"
  | "Boulders" | "Waterfall" | "Path" | "Grass" | "Dirt" | "Eraser";

// This color map perfectly matches the one in your Python server
const brushColors: Record<BrushType, string> = {
  Sky: "rgb(179,229,252)",
  Mountain: "rgb(97,115,97)",
  Lake: "rgb(74,163,210)",       // Backend knows as WATER_BODY
  Trees: "rgb(46,139,87)",      // Backend knows as FOREST_TREES
  Flowers: "rgb(231,154,184)",
  Boulders: "rgb(164,159,154)",  // Backend knows as BOULDERS_CLIFF
  Waterfall: "rgb(137,214,255)",
  Path: "rgb(191,168,147)",      // Backend knows as PATH_ROAD
  Grass: "rgb(122,180,96)",     // Backend knows as GRASS_FIELD
  Dirt: "rgb(137,115,96)",       // Backend knows as EARTH_LAND
  Eraser: "rgb(179,229,252)",    // Eraser paints the sky color
};

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brush, setBrush] = useState<BrushType>("Mountain");
  const [brushSize, setBrushSize] = useState(50);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false); // <-- NEW: Loading state
  const router = useRouter(); // <-- NEW: Router for navigation

  // (useEffect, getCursorPosition, startDrawing, draw, stopDrawing... 
  // ...all remain exactly the same as your file)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = brushColors.Eraser;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  const getCursorPosition = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsPainting(true);
    setLastPos(getCursorPosition(e));
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isPainting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCursorPosition(e);
    if (lastPos) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle =
        brush === "Eraser" ? brushColors.Eraser : brushColors[brush];
      ctx.globalCompositeOperation = "source-over";
      ctx.stroke();
      ctx.closePath();
    }
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsPainting(false);
    setLastPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = brushColors.Eraser;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ==========================================================
  // START: MODIFIED SUBMIT FUNCTION
  // ==========================================================
  const submitCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true); // Start loading

    // Save the sketch as a dataURL for the results page
    const sketchDataURL = canvas.toDataURL("image/png");
    sessionStorage.setItem('userSketch', sketchDataURL);

    // Convert canvas to a Blob (file)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Error creating image file.");
        setIsLoading(false);
        return;
      }

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", blob, "sketch.png");

      try {
        // Send FormData to the proxy URL
        const response = await fetch("/api/search", {
          method: "POST",
          body: formData,
          // No 'Content-Type' header, browser sets it for FormData
        });

        if (response.ok) {
          const data = await response.json();
          
          // Store results in session storage to pass to the next page
          sessionStorage.setItem('searchResults', JSON.stringify(data.results));
          
          // Redirect to the results page
          router.push('/results');
          
        } else {
          const errorData = await response.json();
          alert(`Failed to submit: ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error submitting image:", error);
        alert("Error submitting image. Is the Python server running?");
      } finally {
        setIsLoading(false); // Stop loading
      }
    }, "image/png");
  };
  // ==========================================================
  // END: MODIFIED SUBMIT FUNCTION
  // ==========================================================

  const exportCanvas = () => {
    // (This function remains unchanged)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "painting.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex flex-wrap justify-center gap-3 items-center">
        {(Object.keys(brushColors) as BrushType[]).map((type) => (
          <button
            key={type}
            onClick={() => setBrush(type)}
            className={`px-4 py-2 rounded-2xl shadow-md font-semibold transition-all ${
              brush === type
                ? "bg-blue-500 text-white"
                : "bg-gray-600 hover:bg-gray-700 cursor-pointer"
            }`}
          >
            {type}
          </button>
        ))}
        {/* ... (Brush Size, Clear, and Export buttons remain the same) ... */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Size:</label>
          <input
            type="range" min="10" max="100" value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 cursor-pointer"
          />
        </div>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-2xl bg-[rgb(223,84,86)] text-white font-semibold hover:bg-[rgb(187,58,61)] transition-all cursor-pointer"
        >
          Clear
        </button>
        
        {/* MODIFIED SUBMIT BUTTON */}
        <button
          onClick={submitCanvas}
          disabled={isLoading} // <-- NEW: Disable when loading
          className="px-4 py-2 rounded-2xl bg-[rgb(84,190,121)] text-white font-semibold hover:bg-[rgb(60,162,96)] transition-all cursor-pointer disabled:bg-gray-500"
        >
          {isLoading ? "Searching..." : "Submit"}
        </button>

        <button
          onClick={exportCanvas}
          className="px-4 py-2 rounded-2xl bg-[rgb(235,195,117)] text-white font-semibold hover:bg-[rgb(216,175,87)] transition-all cursor-pointer"
        >
          Export
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="cursor-crosshair rounded-lg"
      />
    </div>
  );
};

export default Canvas;