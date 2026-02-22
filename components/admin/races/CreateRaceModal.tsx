'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trophy } from 'lucide-react';
import type { RaceType } from '@/lib/database.types';

interface CreateRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RACE_TYPES: { value: RaceType; label: string }[] = [
  { value: 'xp', label: 'XP Race' },
  { value: 'typing', label: 'Typing Speed' },
];

export default function CreateRaceModal({ isOpen, onClose }: CreateRaceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [raceType, setRaceType] = useState<RaceType>('xp');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prize1, setPrize1] = useState(100);
  const [prize2, setPrize2] = useState(60);
  const [prize3, setPrize3] = useState(40);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/admin/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim() || undefined,
        race_type: raceType,
        start_date: startDate,
        end_date: endDate,
        prize_pool_1st: prize1,
        prize_pool_2nd: prize2,
        prize_pool_3rd: prize3,
        description: description.trim() || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setError(data.error || 'Failed to create race');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative glass rounded-2xl border border-accent-purple/30 p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-accent-purple" size={24} />
            Create Race
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. February 2025 Typing Challenge"
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Race Type</label>
            <div className="flex gap-2">
              {RACE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRaceType(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    raceType === t.value
                      ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">1st ($)</label>
              <input
                type="number"
                value={prize1}
                onChange={(e) => setPrize1(Number(e.target.value))}
                min={0}
                step={10}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">2nd ($)</label>
              <input
                type="number"
                value={prize2}
                onChange={(e) => setPrize2(Number(e.target.value))}
                min={0}
                step={10}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">3rd ($)</label>
              <input
                type="number"
                value={prize3}
                onChange={(e) => setPrize3(Number(e.target.value))}
                min={0}
                step={10}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/50 hover:bg-accent-purple/30 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Race'}
          </button>
        </form>
      </div>
    </div>
  );
}
