'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RaceRulesPage() {
  const { locale } = useLanguage();
  const isFr = locale === 'fr';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">
        {isFr ? 'Règlement officiel de la compétition' : 'Official Competition Rules'}
      </h1>

      <div className="prose prose-invert max-w-none space-y-8">
        {isFr ? (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aperçu de la compétition</h2>
              <p>
                Compétition mensuelle de productivité basée sur les compétences. Gratuite — incluse avec les abonnements Champion et Ultimate.
                Les prix sont financés par Spaxio (promotion financée par l'entreprise). Les montants des prix varient selon le nombre de participants.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Conditions d'éligibilité</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Doit avoir un abonnement Champion ou Ultimate actif</li>
                <li>Doit s'inscrire avant la fin de la période de course</li>
                <li>Limité à une inscription par utilisateur par période de course</li>
                <li>Ouvert à tous les abonnés (sans restrictions géographiques sauf obligation légale)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Comment participer</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cliquez sur le bouton "Rejoindre le défi de productivité du mois"</li>
                <li>Consultez les règles et les prix</li>
                <li>Confirmez : "Je choisis de participer au défi de productivité de ce mois"</li>
                <li>Aucun paiement requis — c'est un avantage abonné</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Système de notation (100% basé sur les compétences)</h2>
              <p>Les gagnants sont déterminés uniquement par les XP gagnés pendant la période de course. Sources de XP :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complétion de cours : 100-500 XP (selon la difficulté)</li>
                <li>Questions de quiz : 10-25 XP par bonne réponse</li>
                <li>Bonus de rapidité : 50 XP pour compléter les cours avant le calendrier</li>
                <li>Séries d'étude quotidiennes : 20 XP par jour consécutif</li>
              </ul>
              <p className="mt-4 font-semibold">AUCUN élément aléatoire : Pas de tirages au sort, multiplicateurs aléatoires ou notation basée sur la chance.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Règles de départage</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Premier départage : Horodatage d'inscription plus ancien</li>
                <li>Deuxième départage : Pourcentage de précision des quiz plus élevé</li>
                <li>Pas de sélection aléatoire pour les égalités</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Détermination des gagnants</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculé automatiquement à la fin de la période de course (dernier jour du mois, 23h59)</li>
                <li>Top 3 des utilisateurs par XP gagnés pendant la course</li>
                <li>Les gagnants sont notifiés par courriel dans les 48 heures</li>
                <li>Les paiements sont traités dans les 7-10 jours ouvrables</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Prix</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les montants des prix sont fixés au début de chaque période de course</li>
                <li>Entièrement financés par Spaxio</li>
                <li>1ère place : 100$-500$ (varie)</li>
                <li>2e place : 60$-300$ (varie)</li>
                <li>3e place : 40$-200$ (varie)</li>
                <li>Payé via virement Stripe, PayPal ou virement bancaire (au choix du gagnant)</li>
                <li>Les gagnants sont responsables des taxes applicables</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Exigence d'abonnement</h2>
              <p>
                Doit maintenir un abonnement Champion ou Ultimate actif pendant toute la course.
                Si l'abonnement est annulé pendant la course, l'utilisateur est disqualifié.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Disqualification</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Triche, bots automatisés ou manipulation des XP</li>
                <li>Comptes multiples ou partage de comptes</li>
                <li>Violation des conditions d'utilisation de la plateforme</li>
                <li>Annulation de l'abonnement pendant une course active</li>
                <li>La plateforme se réserve le droit de disqualifier et de perdre des prix</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Avertissements légaux</h2>
              <p>
                Il s'agit d'une compétition promotionnelle pour les abonnés. Aucun achat nécessaire au-delà de l'abonnement existant.
                Nul là où la loi l'interdit. La plateforme n'est pas responsable des défaillances techniques.
                Les règles peuvent être mises à jour avec un préavis raisonnable.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Competition Overview</h2>
              <p>
                Monthly skill-based productivity competition. Free to enter — included with Champion and Ultimate subscriptions.
                Prizes funded by Spaxio (company-funded promotion). Prize amounts vary by participant count.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility Requirements</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Must have active Champion or Ultimate subscription</li>
                <li>Must opt-in before race period ends</li>
                <li>Limited to one entry per user per race period</li>
                <li>Open to all subscribers (no geographic restrictions unless legally required)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How to Enter</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click &quot;Join This Month&apos;s Productivity Challenge&quot; button</li>
                <li>Review rules and prizes</li>
                <li>Confirm: &quot;I choose to participate in this month&apos;s productivity challenge&quot;</li>
                <li>No payment required — it&apos;s a subscriber benefit</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Scoring System (100% Skill-Based)</h2>
              <p>Winners determined solely by XP earned during race period. XP sources:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Course completion: 100-500 XP (based on difficulty)</li>
                <li>Quiz questions: 10-25 XP per correct answer</li>
                <li>Speed bonuses: 50 XP for completing courses ahead of schedule</li>
                <li>Daily study streaks: 20 XP per consecutive day</li>
              </ul>
              <p className="mt-4 font-semibold">NO random elements: No lucky draws, random multipliers, or chance-based scoring.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Tie-Breaker Rules</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>First tie-breaker: Earlier opt-in timestamp</li>
                <li>Second tie-breaker: Higher quiz accuracy percentage</li>
                <li>No random selection for ties</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Winner Determination</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculated automatically at end of race period (last day of month, 11:59 PM)</li>
                <li>Top 3 users by XP earned during race</li>
                <li>Winners notified via email within 48 hours</li>
                <li>Payouts processed within 7-10 business days</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Prizes</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prize amounts set at beginning of each race period</li>
                <li>Funded entirely by Spaxio</li>
                <li>1st Place: $100-$500 (varies)</li>
                <li>2nd Place: $60-$300 (varies)</li>
                <li>3rd Place: $40-$200 (varies)</li>
                <li>Paid via Stripe payout, PayPal, or bank transfer (winner&apos;s choice)</li>
                <li>Winners responsible for applicable taxes</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Subscription Requirement</h2>
              <p>
                Must maintain active Champion or Ultimate subscription throughout race.
                If subscription is cancelled during race, user is disqualified.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Disqualification</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cheating, automated bots, or XP manipulation</li>
                <li>Multiple accounts or sharing accounts</li>
                <li>Violating platform Terms of Service</li>
                <li>Cancelling subscription during active race</li>
                <li>Platform reserves right to disqualify and forfeit prizes</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Legal Disclaimers</h2>
              <p>
                This is a promotional competition for subscribers. No purchase necessary beyond existing subscription.
                Void where prohibited by law. Platform not responsible for technical failures.
                Rules may be updated with reasonable notice.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
