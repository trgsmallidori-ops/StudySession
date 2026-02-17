'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface AchievementBadgeProps {
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  unlockedAt?: string;
  locked?: boolean;
}

export default function AchievementBadge({
  name,
  description,
  iconUrl,
  unlockedAt,
  locked = false,
}: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        glass rounded-xl p-4 border flex items-center gap-4
        ${locked ? 'border-white/5 opacity-50' : 'border-accent-purple/20'}
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${locked ? 'bg-white/5' : 'bg-accent-purple/20'}
        `}
      >
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl} alt="" className="w-8 h-8" />
        ) : (
          <Award className={locked ? 'text-foreground/40' : 'text-accent-purple'} size={24} />
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-semibold ${locked ? 'text-foreground/60' : ''}`}>{name}</p>
        {description && (
          <p className="text-sm text-foreground/60 truncate">{description}</p>
        )}
        {unlockedAt && (
          <p className="text-xs text-foreground/50 mt-1">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
