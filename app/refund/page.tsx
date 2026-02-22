'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RefundPage() {
  const { locale } = useLanguage();
  const isFr = locale === 'fr';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">
        {isFr ? 'Politique de remboursement' : 'Refund Policy'}
      </h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-foreground/80">
          {isFr ? 'Dernière mise à jour : ' : 'Last updated: '}
          <span suppressHydrationWarning>{new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>
        </p>
        {isFr ? (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Annulations d'abonnement</h2>
              <p>
                Vous pouvez annuler votre abonnement à tout moment. L'accès se poursuit jusqu'à la fin
                de la période de facturation en cours. Aucun remboursement pour les périodes partielles.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Demandes de remboursement</h2>
              <p>
                Les demandes de remboursement dans les 7 jours suivant l'achat initial peuvent être examinées au cas par cas.
                Contactez-nous via la page Contact avec votre demande.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Prix des compétitions</h2>
              <p>
                Les prix de compétition ne sont pas remboursables une fois versés. Les litiges doivent être soulevés
                dans les 7 jours suivant la fin de la course conformément au Règlement de compétition.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p>
                Pour toute demande de remboursement, utilisez la page Contact.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Subscription Cancellations</h2>
              <p>
                You may cancel your subscription at any time. Access continues until the end
                of the current billing period. No refunds for partial periods.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Refund Requests</h2>
              <p>
                Refund requests within 7 days of initial purchase may be considered on a
                case-by-case basis. Contact us via the Contact page with your request.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Competition Prizes</h2>
              <p>
                Competition prizes are non-refundable once paid. Disputes must be raised
                within 7 days of race completion per the Competition Rules.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p>
                For refund inquiries, use the Contact page.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
