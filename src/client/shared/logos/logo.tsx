"use client";

import { motion } from "framer-motion";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    /** "light" = texte blanc (fond sombre / écran de login), "default" = s'adapte au thème (sidebar) */
    variant?: "light" | "default";
}

const Logo = ({ size = "md", showText = true, variant = "default" }: LogoProps): JSX.Element => {
    // Mapping des tailles : icône (px) + police du texte
    const sizeMap = {
        sm: { icon: 32, text: "text-2xl" },
        md: { icon: 48, text: "text-4xl" },
        lg: { icon: 64, text: "text-6xl" },
    };

    const { icon, text } = sizeMap[size];

    const textColorClass =
        variant === "light"
            ? "text-white"
            : "text-foreground";

    return (
        <div className="flex items-center gap-3 flex-shrink-0">
            {showText && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`font-light tracking-tight whitespace-nowrap ${text} ${textColorClass}`}
                >
                    Yooz
                </motion.span>
            )}

            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex-shrink-0"
                style={{ width: icon, height: icon }}
            >
                <div className="absolute inset-0 rotate-[-8deg] rounded-md bg-[#2b6cb0] translate-x-2" />
                <div className="absolute inset-0 rotate-[6deg] rounded-md bg-[#2fbf9f] translate-y-1" />
                <div className="absolute inset-0 rounded-md bg-[#e11d74] flex items-center justify-center">
                    <svg
                        className="text-white"
                        style={{ width: icon * 0.45, height: icon * 0.45 }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path d="M12 3C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-10z" />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
};

export default Logo;