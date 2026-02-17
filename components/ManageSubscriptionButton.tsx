'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-accent-cyan text-sm hover:underline disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage subscription'} →
    </button>
  );
}
