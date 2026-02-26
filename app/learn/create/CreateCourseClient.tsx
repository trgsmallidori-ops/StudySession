'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CreateCourseClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [totalXpReward, setTotalXpReward] = useState(100);
  const [modules, setModules] = useState<{ title: string; content: string }[]>([
    { title: 'Introduction', content: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const addModule = () => {
    setModules((m) => [...m, { title: `Module ${m.length + 1}`, content: '' }]);
  };

  const removeModule = (i: number) => {
    setModules((m) => m.filter((_, idx) => idx !== i));
  };

  const updateModule = (i: number, field: 'title' | 'content', value: string) => {
    setModules((m) => {
      const next = [...m];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setUpgradeRequired(false);

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        duration_days: durationDays,
        difficulty,
        total_xp_reward: totalXpReward,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      if (res.status === 403 && data.upgradeRequired) {
        setUpgradeRequired(true);
        setSubmitError(t.learn.upgradeToCreateMore);
      } else {
        setSubmitError(data.error ?? 'Failed to create course');
      }
      return;
    }

    const course = data;

    for (let i = 0; i < modules.length; i++) {
      await fetch(`/api/courses/${course.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: modules[i].title,
          order_index: i,
          content: { type: 'text', text: modules[i].content },
        }),
      });
    }

    setLoading(false);
    router.push(`/learn/${course.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create Course</h1>
        <Link
          href="/learn"
          className="text-foreground/70 hover:text-accent-pink"
        >
          ← Back to Learn
        </Link>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl border border-accent-pink/40 bg-accent-pink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground/90">{submitError}</p>
          {upgradeRequired && (
            <Link
              href="/pricing?feature=learn"
              className="shrink-0 px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold text-center"
            >
              {t.dashboard.upgradePlan}
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-xl p-6 border border-accent-pink/20">
          <h2 className="text-lg font-semibold mb-4">Course Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-foreground/80 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground/80 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground/80 mb-2">Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 7)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/80 mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-foreground/80 mb-2">Total XP Reward</label>
              <input
                type="number"
                min={10}
                value={totalXpReward}
                onChange={(e) => setTotalXpReward(parseInt(e.target.value, 10) || 100)}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-accent-pink/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Modules</h2>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 text-sm font-medium"
            >
              <Plus size={18} />
              Add Module
            </button>
          </div>
          <div className="space-y-4">
            {modules.map((m, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-background/30 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    value={m.title}
                    onChange={(e) => updateModule(i, 'title', e.target.value)}
                    placeholder="Module title"
                    className="flex-1 px-3 py-2 rounded bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeModule(i)}
                    disabled={modules.length <= 1}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <textarea
                  value={m.content}
                  onChange={(e) => updateModule(i, 'content', e.target.value)}
                  placeholder="Module content..."
                  rows={4}
                  className="w-full px-3 py-2 rounded bg-background/50 border border-white/10 text-foreground focus:border-accent-pink focus:outline-none text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <Link
            href="/learn"
            className="px-8 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
