'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { RacePeriod } from '@/lib/database.types';
import RaceCard from '@/components/admin/races/RaceCard';
import CreateRaceModal from '@/components/admin/races/CreateRaceModal';

interface AdminRacesClientProps {
  periods: RacePeriod[];
}

export default function AdminRacesClient({ periods }: AdminRacesClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const activeCount = periods.filter((p) => p.status === 'active').length;
  const upcomingCount = periods.filter((p) => p.status === 'upcoming').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Race Management</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/50 hover:bg-accent-purple/30 font-medium"
        >
          <Plus size={20} />
          Create Race
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="text-sm text-foreground/60">Total Races</p>
          <p className="text-2xl font-bold">{periods.length}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="text-sm text-foreground/60">Active</p>
          <p className="text-2xl font-bold text-accent-cyan">{activeCount}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="text-sm text-foreground/60">Upcoming</p>
          <p className="text-2xl font-bold">{upcomingCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Race Periods</h2>
        <div className="grid gap-4">
          {periods.map((p) => (
            <RaceCard key={p.id} race={p} />
          ))}
        </div>
      </div>

      <CreateRaceModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
