'use client';

import ContactForm from './ContactForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">{t.contact.title}</h1>
      <p className="text-foreground/70 mb-12">
        {t.contact.subtitle}
      </p>
      <ContactForm />
    </div>
  );
}
