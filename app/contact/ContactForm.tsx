'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const schema = z.object({
    name: z.string().min(1, t.contact.validation.nameRequired),
    email: z.string().email(t.contact.validation.emailRequired),
    message: z.string().min(10, t.contact.validation.messageMin),
  });

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
      setError(json.error ?? t.contact.failedToSend);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="glass rounded-xl p-8 border border-accent-cyan/20 text-center">
        <h2 className="text-xl font-semibold text-accent-cyan mb-2">{t.contact.successTitle}</h2>
        <p className="text-foreground/80">
          {t.contact.successMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm text-foreground/80 mb-2">{t.contact.name}</label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground focus:border-accent-cyan focus:outline-none"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-foreground/80 mb-2">{t.contact.email}</label>
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
        <label className="block text-sm text-foreground/80 mb-2">{t.contact.message}</label>
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
        {t.contact.send}
      </button>
    </form>
  );
}
