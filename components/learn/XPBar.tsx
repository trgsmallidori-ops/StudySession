'use client';

import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  level?: number;
  showLabel?: boolean;
}

export default function XPBar({ currentXP, level, showLabel = true }: XPBarProps) {
  const xpInLevel = currentXP % 100;
  const displayLevel = level ?? Math.floor(currentXP / 100) + 1;

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Level {displayLevel}</span>
          <span className="font-mono text-xp-start">{currentXP} XP</span>
        </div>
      )}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-xp-start to-xp-end rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${xpInLevel}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
      </div>
    </div>
  );
}
