"use client";

import React, { useRef, useState } from "react";

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={`group relative rounded-2xl bg-white/5 ${className}`}
        >
            {/* Dynamic Border Glow */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-2xl"
                style={{
                    opacity,
                    background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, rgba(var(--color-primary-rgb), 0.6), transparent 40%)`,
                }}
            />
            {/* Inner background block (clips the inner gradient to faux-1px border) */}
            <div className="absolute inset-[1px] z-0 rounded-2xl bg-[#121212]" />
            {/* Subtle Inner Interior Glow */}
            <div
                className="pointer-events-none absolute inset-[1px] z-0 transition-opacity duration-300 rounded-2xl"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(var(--color-primary-rgb), 0.05), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex h-full flex-col p-6">
                {children}
            </div>
        </div>
    );
}
