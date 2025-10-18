"use client"
import { useState, useEffect } from "react";

export default function Home() {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX - innerWidth / 2) / innerWidth) * -30;
      const y = ((e.clientY - innerHeight / 2) / innerHeight) * -30;
      setOffset({ x, y });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return(
    <div className="absolute w-full h-full overflow-hidden">
        <div
            className={`absolute transition-transform`}
            style={{
                left: `calc(${0}% + ${offset.x * 0.5}px)`,
                top: `calc(${0}% + ${offset.y * 0.4}px)`,
            }}
            ><img
                src={"/images/clouds.png"}
                alt={"Clouds"}
                className="object-contain"
                style={{ maxWidth: `100vw` }}
            />
        </div>
        
        <div
            className={`absolute transition-transform`}
            style={{
                left: `calc(${-5}% + ${offset.x * 0.5}px)`,
                bottom: `calc(${0}% + ${offset.y * 0.4}px)`,
            }}
            ><img
                src={"/images/mt3.png"}
                alt={"Mountain"}
                className="object-contain"
                style={{ maxWidth: `100%` }}
            />
        </div>

        <div
            className={`absolute transition-transform`}
            style={{
                left: `calc(${-5}% + ${offset.x * 0.8}px)`,
                bottom: `calc(${-5}% + ${offset.y * 0.8}px)`,
            }}
            ><img
                src={"/images/mt2.png"}
                alt={"Mountain"}
                className="object-contain"
                style={{ maxWidth: `110%` }}
            />
        </div>

        <div
            className={`absolute transition-transform`}
            style={{
                left: `calc(${-5}% + ${offset.x * 1.5}px)`,
                bottom: `calc(${-10}% + ${offset.y * 2.0}px)`,
            }}
            ><img
                src={"/images/mt1.png"}
                alt={"Mountain"}
                className="object-contain"
                style={{ maxWidth: `110%` }}
            />
        </div>
        
        <div
            className={`absolute transition-transform`}
            style={{
                left: `calc(${-5}% + ${offset.x * 1.0}px)`,
                bottom: `calc(${-4}% + ${offset.y * 1.0}px)`,
            }}
            ><img
                src={"/images/trees.png"}
                alt={"Trees"}
                className="object-contain"
                style={{ maxWidth: `105%` }}
            />
        </div>
      </div>
  )
}