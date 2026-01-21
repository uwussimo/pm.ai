"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CursorPosition } from "@/lib/hooks/use-realtime";

interface CursorCanvasProps {
    cursors: Map<string, CursorPosition>;
    getUserColor: (userId: string) => string;
}

// Individual cursor component with optimized rendering
const CanvasCursor = ({
    cursor,
    color,
}: {
    cursor: CursorPosition;
    color: string;
}) => {
    return (
        <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                x: cursor.x - 2,
                y: cursor.y - 2,
                opacity: 1,
                scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
                type: "spring",
                damping: 30,
                stiffness: 350,
                mass: 0.4,
            }}
        >
            {/* Cursor SVG */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
            >
                {/* White outline for visibility */}
                <path
                    d="M2 2L2 16L8 10L11 16L13 15L10 9L16 8L2 2Z"
                    fill="white"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.5"
                />
                {/* Colored fill */}
                <path
                    d="M3 3L3 14L8 9L10.5 14L11.5 13.5L9 8.5L14 7.5L3 3Z"
                    fill={color}
                />
            </svg>

            {/* Name label with improved visibility */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.15 }}
                className="absolute top-5 left-3 whitespace-nowrap"
            >
                <div
                    className="px-2 py-0.5 rounded text-[11px] font-medium text-white shadow-md backdrop-blur-sm"
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 2px 8px ${color}40, 0 0 0 1px ${color}20`,
                    }}
                >
                    {cursor.userName}
                </div>
            </motion.div>
        </motion.div>
    );
};

export function CursorCanvas({ cursors, getUserColor }: CursorCanvasProps) {
    // Use a canvas overlay for better performance with many cursors
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Update canvas size
        const updateCanvasSize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
        };
    }, []);

    return (
        <>
            {/* Canvas overlay for advanced cursor effects */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0 z-[9998]"
                style={{ mixBlendMode: "normal" }}
            />

            {/* Render individual cursors with DOM for better interactivity */}
            <AnimatePresence>
                {Array.from(cursors.values()).map((cursor) => {
                    const color = getUserColor(cursor.userId);
                    return (
                        <CanvasCursor
                            key={cursor.userId}
                            cursor={cursor}
                            color={color}
                        />
                    );
                })}
            </AnimatePresence>
        </>
    );
}
