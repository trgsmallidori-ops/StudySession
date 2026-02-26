'use client';

import { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  racePeriodId: string;
  raceTitle: string;
  onSent?: () => void;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  racePeriodId,
  raceTitle,
  onSent,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/admin/races/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        message: message.trim(),
        race_period_id: racePeriodId,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSentCount(data.sent_to_count ?? 0);
      onSent?.();
      if (data.sent_to_count > 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      setError(data.error || 'Failed to send announcement');
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
      <div className="relative glass rounded-2xl border border-accent-cyan/30 p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="text-accent-cyan" size={24} />
            Send Announcement
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

        <p className="text-sm text-foreground/70 mb-4">
          Sends an email to all Champion subscribers. Race: <strong>{raceTitle}</strong>
        </p>

        {sentCount !== null ? (
          <p className="text-accent-cyan font-medium">
            Sent to {sentCount} subscriber{sentCount !== 1 ? 's' : ''}.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Subject</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Race starts tomorrow!"
                required
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your announcement message..."
                required
                rows={5}
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send to Subscribers'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
