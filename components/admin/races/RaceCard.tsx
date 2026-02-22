'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Trophy, Zap, Trash2, Megaphone } from 'lucide-react';
import type { RacePeriod, RaceStatus, RaceType } from '@/lib/database.types';
import ActivateRaceButton from '@/app/admin/races/ActivateRaceButton';
import AnnouncementModal from './AnnouncementModal';

interface RaceCardProps {
  race: RacePeriod;
}

const typeLabels: Record<RaceType, string> = {
  xp: 'XP',
  typing: 'Typing',
};

const statusColors: Record<RaceStatus, string> = {
  upcoming: 'bg-foreground/20 text-foreground/80',
  active: 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
  completed: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

export default function RaceCard({ race }: RaceCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this race? This cannot be undone.')) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/races?id=${race.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
    }
  };

  const title = race.title || `${typeLabels[race.race_type]} Race`;
  const typeIcon = race.race_type === 'typing' ? Zap : Trophy;

  return (
    <>
      <div className="glass rounded-xl p-6 border border-white/5 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/40 flex items-center gap-1">
                {typeIcon === Zap ? <Zap size={12} /> : <Trophy size={12} />}
                {typeLabels[race.race_type]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[race.status]}`}>
                {race.status}
              </span>
            </div>
            <p className="text-sm text-foreground/60">
              {format(new Date(race.start_date), 'MMM d')} – {format(new Date(race.end_date), 'MMM d')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActivateRaceButton racePeriodId={race.id} status={race.status} />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 border border-red-500/30 disabled:opacity-50"
              title="Delete race"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setAnnounceOpen(true)}
              className="p-2 rounded-lg text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/30"
              title="Send announcement"
            >
              <Megaphone size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>{race.participant_count} participants</span>
          <span>1st: ${race.prize_pool_1st}</span>
          <span>2nd: ${race.prize_pool_2nd}</span>
          <span>3rd: ${race.prize_pool_3rd}</span>
        </div>

        {race.description && (
          <p className="text-sm text-foreground/70 line-clamp-2">{race.description}</p>
        )}
      </div>

      <AnnouncementModal
        isOpen={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        racePeriodId={race.id}
        raceTitle={title}
        onSent={() => router.refresh()}
      />
    </>
  );
}
