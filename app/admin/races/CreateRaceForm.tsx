'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRaceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const startDate = (form.elements.namedItem('start_date') as HTMLInputElement).value;
    const endDate = (form.elements.namedItem('end_date') as HTMLInputElement).value;
    const prize1 = (form.elements.namedItem('prize_1') as HTMLInputElement).value;
    const prize2 = (form.elements.namedItem('prize_2') as HTMLInputElement).value;
    const prize3 = (form.elements.namedItem('prize_3') as HTMLInputElement).value;

    setLoading(true);
    const res = await fetch('/api/admin/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        prize_pool_1st: parseFloat(prize1),
        prize_pool_2nd: parseFloat(prize2),
        prize_pool_3rd: parseFloat(prize3),
      }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 border border-accent-purple/20 mb-8">
      <h2 className="text-xl font-semibold mb-4">Create Race Period</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-foreground/80 mb-2">Start Date</label>
          <input
            name="start_date"
            type="date"
            required
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">End Date</label>
          <input
            name="end_date"
            type="date"
            required
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-foreground/80 mb-2">1st Place Prize ($)</label>
          <input
            name="prize_1"
            type="number"
            defaultValue={100}
            min={0}
            step={10}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">2nd Place Prize ($)</label>
          <input
            name="prize_2"
            type="number"
            defaultValue={60}
            min={0}
            step={10}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">3rd Place Prize ($)</label>
          <input
            name="prize_3"
            type="number"
            defaultValue={40}
            min={0}
            step={10}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/50 hover:bg-accent-purple/30 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Race'}
      </button>
    </form>
  );
}
