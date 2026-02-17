'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Failed to send');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="glass rounded-xl p-8 border border-accent-cyan/20 text-center">
        <h2 className="text-xl font-semibold text-accent-cyan mb-2">Message Sent!</h2>
        <p className="text-foreground/80">
          Thanks for reaching out. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm text-foreground/80 mb-2">Name</label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-foreground/80 mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-foreground/80 mb-2">Message</label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>
      {error && <p className="text-red-400">{error}</p>}
      <button
        type="submit"
        className="px-8 py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold"
      >
        Send Message
      </button>
    </form>
  );
}
