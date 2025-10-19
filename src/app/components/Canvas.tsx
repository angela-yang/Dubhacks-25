"use client"
import React, { useRef, useState, useEffect } from "react";

type BrushType = "Mountain" | "Lake" | "Forest" | "Sky";

const brushColors: Record<BrushType, string> = {
  Mountain: "#8B7765",
  Lake: "#4AA3D2",
  Forest: "#2E8B57",
  Sky: "#B3E5FC",
};

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brush, setBrush] = useState<BrushType>("Mountain");
  const [brushSize, setBrushSize] = useState(10);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgb(239,215,198)";
        ctx.fillRect(0, 0, 600, 600);
        ctx.lineCap = "round";
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
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    setIsPainting(true);
    const { x, y } = getCursorPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isPainting) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCursorPosition(e);
    ctx.strokeStyle = brushColors[brush];
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
    setIsPainting(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(239,215,198)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
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
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {type}
          </button>
        ))}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Size:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-2xl bg-red-400 text-white font-semibold hover:bg-red-500 transition-all"
        >
          Clear
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
        className="cursor-crosshair"
      />
    </div>
  );
};

export default Canvas;
