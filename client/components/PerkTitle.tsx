import React from 'react';

interface PerkTitleProps {
    title: string;
    type?: 'aura' | 'echo' | 'seasonal' | 'badge' | 'title';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * PerkTitle Component
 * Displays a perk/achievement title with enhanced glowing border styling
 */
export default function PerkTitle({ title, type = 'aura', size = 'md', className = '' }: PerkTitleProps) {
    const sizeClasses = {
        sm: 'text-sm px-3 py-1',
        md: 'text-lg px-4 py-2',
        lg: 'text-2xl px-6 py-3',
    };

    // Enhanced glowing border colors with stronger multi-layer shadows
    const glowStyles: Record<string, string> = {
        aura: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7),0_0_40px_rgba(251,191,36,0.5),0_0_60px_rgba(251,191,36,0.3),0_0_80px_rgba(251,191,36,0.2)] text-amber-600 dark:text-amber-300',
        echo: 'border-purple-400 shadow-[0_0_20px_rgba(167,139,250,0.7),0_0_40px_rgba(167,139,250,0.5),0_0_60px_rgba(167,139,250,0.3)] text-purple-600 dark:text-purple-300',
        seasonal: 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7),0_0_40px_rgba(52,211,153,0.5),0_0_60px_rgba(52,211,153,0.3)] text-emerald-600 dark:text-emerald-300',
        badge: 'border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.7),0_0_40px_rgba(45,212,191,0.5),0_0_60px_rgba(45,212,191,0.3)] text-teal-600 dark:text-teal-300',
        title: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7),0_0_40px_rgba(251,191,36,0.5),0_0_60px_rgba(251,191,36,0.3),0_0_80px_rgba(251,191,36,0.2)] text-amber-600 dark:text-amber-300',
    };

    return (
        <span
            className={`
                inline-flex items-center font-bold italic rounded-lg border-2
                bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20 dark:from-amber-500/25 dark:to-yellow-500/25
                animate-pulse
                backdrop-blur-sm
                ${sizeClasses[size]}
                ${glowStyles[type] || glowStyles.aura}
                ${className}
            `}
            style={{
                filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
            }}
        >
            {title}
        </span>
    );
}
