"use client";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CardProps {
    heading: string;
    description: string;
    imgSrc: string;
}

export const ColorChangeCard = ({ heading, description, imgSrc }: CardProps) => {
    return (
        <motion.div
            transition={{ staggerChildren: 0.035 }}
            whileHover="hover"
            className="group relative h-64 w-full cursor-pointer overflow-hidden bg-black"
        >
            <div
                className="absolute inset-0 saturate-100 transition-all duration-500 md:saturate-0 md:group-hover:saturate-100 bg-center group-hover:bg-top scale-125 group-hover:scale-100"
                style={{
                    backgroundImage: `url(${imgSrc})`,
                    backgroundSize: "cover",
                }}
            />
            <div className="relative z-20 flex h-full flex-col justify-between p-4 pb-0 text-slate-300 transition-colors duration-500 group-hover:text-white">
                <ArrowRight className="ml-auto text-3xl transition-transform duration-500 group-hover:-rotate-45" />
                <h4>
                    {heading.split("").map((letter, index) => (
                        <AnimatedLetter letter={letter} key={index} />
                    ))}
                </h4>
            </div>
        </motion.div>
    );
};

// --- AnimatedLetter Helper Component ---
interface AnimatedLetterProps {
    letter: string;
}

const letterVariants: Variants = {
    hover: {
        y: "-50%",
    },
};

const AnimatedLetter = ({ letter }: AnimatedLetterProps) => {
    return (
        <div className="inline-block h-[36px] overflow-hidden font-semibold text-3xl">
            <motion.span
                className="flex min-w-[4px] flex-col uppercase"
                style={{ y: "0%" }}
                variants={letterVariants}
                transition={{ duration: 0.5 }}
            >
                <span>{letter}</span>
                <span>{letter}</span>
            </motion.span>
        </div>
    );
};