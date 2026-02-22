'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TermsPage() {
  const { locale } = useLanguage();
  const isFr = locale === 'fr';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">
        {isFr ? 'Conditions générales d\'utilisation' : 'Terms and Conditions'}
      </h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          {isFr ? 'Dernière mise à jour : ' : 'Last updated: '}{new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
        </p>
        {isFr ? (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptation</h2>
              <p>
                En utilisant StudySession, vous acceptez ces conditions. Si vous n'êtes pas d'accord, n'utilisez pas le service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
              <p>
                StudySession propose une plateforme d'apprentissage gamifiée avec des fonctionnalités de calendrier, des cours
                et des compétitions mensuelles. Les fonctionnalités peuvent varier selon le niveau d'abonnement.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Conduite de l'utilisateur</h2>
              <p>
                Vous vous engagez à ne pas abuser de la plateforme, à ne pas tricher dans les compétitions, à ne pas partager des comptes,
                ni à enfreindre les lois applicables. Nous nous réservons le droit de résilier les comptes.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Abonnements</h2>
              <p>
                Les abonnements sont facturés selon le plan choisi. L'annulation est soumise à notre
                politique de remboursement. Nous pouvons modifier les tarifs avec préavis.
              </p>
              <p>
                Vous n'êtes jamais obligé de dépenser de l'argent au-delà de votre abonnement choisi pour utiliser une fonctionnalité.
                L'abonnement Ultimate n'est pas uniquement destiné aux courses — il débloque tout le potentiel du site,
                y compris les fonctionnalités IA, tous les cours, le calendrier et les compétitions mensuelles.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Compétitions mensuelles</h2>
              <p>
                Le Défi mensuel de productivité est entièrement facultatif. Vous n'êtes en aucun cas obligé de participer.
                Il s'agit d'une fonctionnalité volontaire pour les utilisateurs ayant souscrit un abonnement Champion ou Ultimate.
                Aucun paiement supplémentaire ou frais d'entrée n'est requis — les prix sont financés par Spaxio.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
              <p>
                StudySession et son contenu appartiennent à Spaxio. Le contenu généré par les utilisateurs reste
                le vôtre, mais vous nous accordez une licence pour l'afficher sur la plateforme.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
              <p>
                Des questions ? Utilisez la page Contact.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance</h2>
              <p>
                By using StudySession, you agree to these terms. If you disagree, do not use the service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p>
                StudySession provides a gamified learning platform with calendar features, courses,
                and monthly competitions. Features may vary by subscription tier.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
              <p>
                You agree not to abuse the platform, cheat in competitions, share accounts,
                or violate any applicable laws. We reserve the right to terminate accounts.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Subscriptions</h2>
              <p>
                Subscriptions are billed per the selected plan. Cancellation follows our
                Refund Policy. We may change pricing with notice.
              </p>
              <p>
                You are never required to spend money beyond your chosen subscription to use any feature.
                The Ultimate subscription is not solely for races—it unlocks the site&apos;s full potential,
                including AI features, all courses, the calendar, and monthly competitions.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Monthly Competitions</h2>
              <p>
                The Monthly Productivity Challenge is entirely optional. By no means do you have to participate.
                It is a voluntary feature for users who have purchased the Champion or Ultimate subscription.
                No additional payment or entry fee is required from you—prizes are funded by Spaxio.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p>
                StudySession and its content are owned by Spaxio. User-generated content remains
                yours, but you grant us a license to display it on the platform.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
              <p>
                Questions? Use the Contact page.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
