"use client";
import { useState } from "react";
import Link from "next/link";
import { FaHome, FaBookmark, FaUser, FaFeather } from "react-icons/fa";

export default function HomeNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="fixed top-4 left-4 z-50"
            onMouseEnter={() => {
                setIsOpen(true);
            }}
            onMouseLeave={() => {
                setIsOpen(false);
            }}
        >
            <button className="bg-[rgb(235,199,148)] text-[rgb(32,74,65)] p-3 rounded-full shadow-lg hover:bg-[rgb(106,132,146)] transition cursor-pointer">
                <FaHome size={24} />
            </button>

            {isOpen && (
                <div className="mt-2 bg-[rgb(106,132,146)] text-[rgb(232,215,194)] rounded-xl shadow-lg w-48 p-4 flex flex-col gap-3 cursor-pointer">
                <Link href="/" className="flex items-center gap-2 p-2 rounded-xl hover:bg-[rgb(76,101,112)] transition">
                    <FaHome /> Home
                </Link>
                <Link href="/paint" className="flex items-center gap-2 p-2 rounded-xl hover:bg-[rgb(76,101,112)] transition">
                    <FaFeather /> Paint
                </Link>
                <Link href="/saved" className="flex items-center gap-2 p-2 rounded-xl hover:bg-[rgb(76,101,112)] transition">
                    <FaBookmark /> Saved
                </Link>
                <Link href="/profile" className="flex items-center gap-2 p-2 rounded-xl hover:bg-[rgb(76,101,112)] transition">
                    <FaUser /> Profile
                </Link>
                </div>
            )}
        </div>
    );
}
