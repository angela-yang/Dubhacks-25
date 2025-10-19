"use client";
import React, { useRef, useState, useEffect } from "react";

type BrushType = "Sky" | "Mountain" | "Lake" | "Trees" | "Flowers" | "Boulders" | "Waterfall" | "Path" | "Grass" | "Dirt" | "Eraser";

const brushColors: Record<BrushType, string> = {
  Sky: "#B3E5FC",
  Mountain: "#617361",
  Lake: "#4AA3D2",
  Trees: "#2E8B57",
  Flowers: "#E79AB8",
  Boulders: "#A49F9A",
  Waterfall: "#89D6FF",
  Path: "#BFA893",
  Grass: "#7AB460",
  Dirt: "#897360",
  Eraser: "rgb(239,215,198)",
};

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brush, setBrush] = useState<BrushType>("Mountain");
  const [brushSize, setBrushSize] = useState(50);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(
    null
  );

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

  const submitCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");

    try {
      const response = await fetch("/api/send-to-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: dataURL }),
      });

      if (response.ok) {
        alert("Image submitted successfully!");
      } else {
        alert("Failed to submit image.");
      }
    } catch (error) {
      console.error("Error submitting image:", error);
      alert("Error submitting image.");
    }
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
                : "bg-gray-400 hover:bg-gray-500 cursor-pointer"
            }`}
          >
            {type}
          </button>
        ))}

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Size:</label>
          <input
            type="range"
            min="10"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
        </div>

        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-2xl bg-red-400 text-white font-semibold hover:bg-red-600 transition-all cursor-pointer"
        >
          Clear
        </button>

        <button
          onClick={submitCanvas}
          className="px-4 py-2 rounded-2xl bg-emerald-500 text-white font-semibold hover:bg-emerald-700 transition-all cursor-pointer"
        >
          Submit
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
