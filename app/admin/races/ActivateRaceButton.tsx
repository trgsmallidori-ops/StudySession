'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RaceStatus } from '@/lib/database.types';

interface ActivateRaceButtonProps {
  racePeriodId: string;
  status: RaceStatus;
}

export default function ActivateRaceButton({ racePeriodId, status }: ActivateRaceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: RaceStatus) => {
    setLoading(true);
    const res = await fetch('/api/admin/races', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: racePeriodId, status: newStatus }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  };

  if (status === 'upcoming') {
    return (
      <button
        onClick={() => updateStatus('active')}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/50 hover:bg-accent-purple/30 disabled:opacity-50 text-sm font-medium"
      >
        {loading ? 'Activating...' : 'Activate'}
      </button>
    );
  }

  if (status === 'active') {
    return (
      <button
        onClick={() => updateStatus('completed')}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30 disabled:opacity-50 text-sm font-medium"
      >
        {loading ? 'Completing...' : 'Mark Complete'}
      </button>
    );
  }

  return null;
}
