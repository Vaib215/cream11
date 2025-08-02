"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import WetPaintButton from "../ui/wet-button";

function CricketBat({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <path d="M45 10 Q50 8 55 10 L55 70 Q50 75 45 70 Z" fill="currentColor" opacity="0.3" />
            <rect x="48" y="72" width="4" height="16" fill="currentColor" opacity="0.4" />
        </svg>
    );
}

function CricketBall({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="25" fill="currentColor" opacity="0.3" />
            <path d="M30 40 Q50 35 70 40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M30 60 Q50 65 70 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
    );
}

function CricketHelmet({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <path d="M25 50 Q25 25 50 25 Q75 25 75 50 L75 65 Q50 75 25 65 Z" fill="currentColor" opacity="0.3" />
            <rect x="30" y="45" width="40" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        </svg>
    );
}

function CricketPads({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <rect x="35" y="20" width="12" height="60" rx="6" fill="currentColor" opacity="0.3" />
            <rect x="53" y="20" width="12" height="60" rx="6" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

function CricketWickets({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <rect x="22" y="30" width="4" height="60" fill="currentColor" opacity="0.4" />
            <rect x="38" y="30" width="4" height="60" fill="currentColor" opacity="0.4" />
            <rect x="54" y="30" width="4" height="60" fill="currentColor" opacity="0.4" />
            <rect x="20" y="25" width="40" height="4" rx="2" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

function CricketEquipmentShape({
    className,
    delay = 0,
    size = 120,
    rotate = 0,
    equipment = "bat",
    color = "text-white",
}: {
    className?: string;
    delay?: number;
    size?: number;
    rotate?: number;
    equipment?: "bat" | "ball" | "helmet" | "pads" | "wickets";
    color?: string;
}) {
    const equipmentComponents = {
        bat: CricketBat,
        ball: CricketBall,
        helmet: CricketHelmet,
        pads: CricketPads,
        wickets: CricketWickets,
    };

    const EquipmentComponent = equipmentComponents[equipment];

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                    rotate: [0, 10, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width: size,
                    height: size,
                }}
                className="relative"
            >
                <EquipmentComponent
                    className={cn(
                        "w-full h-full",
                        color,
                        "drop-shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGeometric({
    badge = "Design Collective",
    title1 = "Elevate Your Digital Vision",
    title2 = "Crafting Exceptional Websites",
}: {
    badge?: string;
    title1?: string;
    title2?: string;
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

            <div className="absolute inset-0 overflow-hidden">
                <CricketEquipmentShape
                    delay={0.3}
                    size={180}
                    rotate={12}
                    equipment="bat"
                    color="text-indigo-400"
                    className="left-[-5%] md:left-[10%] top-[15%] md:top-[20%]"
                />

                <CricketEquipmentShape
                    delay={0.5}
                    size={120}
                    rotate={-15}
                    equipment="ball"
                    color="text-red-200"
                    className="right-[0%] md:right-[10%] top-[70%] md:top-[75%]"
                />

                <CricketEquipmentShape
                    delay={0.4}
                    size={150}
                    rotate={-8}
                    equipment="helmet"
                    color="text-violet-400"
                    className="left-[10%] md:left-[15%] bottom-[5%] md:bottom-[10%]"
                />

                <CricketEquipmentShape
                    delay={0.6}
                    size={140}
                    rotate={20}
                    equipment="wickets"
                    color="text-amber-400"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 1,
                                    delay: 0.5 + (0 * 0.2),
                                    ease: "easeOut"
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] mb-4 md:mb-8"
                    >
                        <span className="text-3xl text-white font-bold tracking-wide">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 1,
                                    delay: 0.5 + (1 * 0.2),
                                    ease: "easeOut"
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-red-900 via-red-200/90 to-red-700 "
                                )}
                            >
                                {title2}
                            </span>
                        </h1>

                        <WetPaintButton className="bg-red-500 cursor-pointer hover:scale-125 duration-300 transition-all text-xl md:text-3xl md:px-8 md:py-4">Get Started</WetPaintButton>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
        </div>
    );
}
