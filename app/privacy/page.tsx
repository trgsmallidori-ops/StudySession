'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const isFr = locale === 'fr';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">
        {isFr ? 'Politique de confidentialité' : 'Privacy Policy'}
      </h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          {isFr ? 'Dernière mise à jour : ' : 'Last updated: '}
          <span suppressHydrationWarning>{new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>
        </p>
        {isFr ? (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Informations que nous collectons</h2>
              <p>
                Nous collectons les informations que vous fournissez lors de l'inscription (courriel, nom), les données d'utilisation,
                et les informations de paiement traitées de manière sécurisée via Stripe. Nous utilisons Supabase pour
                l'authentification et le stockage des données.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Comment nous utilisons vos informations</h2>
              <p>
                Vos données sont utilisées pour fournir nos services, traiter les paiements, envoyer des
                courriels transactionnels et améliorer la plateforme. Nous ne vendons pas vos informations personnelles.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Stockage et sécurité des données</h2>
              <p>
                Les données sont stockées dans Supabase (PostgreSQL) avec une sécurité au niveau des lignes. Stripe gère
                toutes les données de paiement. Nous mettons en œuvre des mesures de sécurité conformes aux normes industrielles.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Services tiers</h2>
              <p>
                Nous utilisons Stripe (paiements), Supabase (base de données et authentification), OpenAI (analyse par IA),
                et Gmail SMTP (courriel). Chacun dispose de sa propre politique de confidentialité.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
              <p>
                Pour toute question concernant la confidentialité, contactez-nous via la page Contact.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide when registering (email, name), usage data,
                and payment information processed securely via Stripe. We use Supabase for
                authentication and data storage.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>
                Your data is used to provide our services, process payments, send transactional
                emails, and improve the platform. We do not sell your personal information.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Storage & Security</h2>
              <p>
                Data is stored in Supabase (PostgreSQL) with Row Level Security. Stripe handles
                all payment data. We implement industry-standard security measures.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
              <p>
                We use Stripe (payments), Supabase (database & auth), OpenAI (AI parsing),
                and Gmail SMTP (email). Each has their own privacy policy.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
              <p>
                For privacy questions, contact us via the Contact page.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
