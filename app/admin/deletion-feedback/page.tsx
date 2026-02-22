import { createAdminClient } from '@/lib/supabase/admin';

const REASON_LABELS: Record<string, string> = {
  not_using: "I'm not using the product anymore",
  too_expensive: 'Too expensive',
  better_alternative: 'Found a better alternative',
  privacy: 'Privacy concerns',
  missing_features: 'Missing features I need',
  technical: 'Technical issues',
  other: 'Other',
};

export default async function AdminDeletionFeedbackPage() {
  const admin = createAdminClient();
  const { data: feedback } = await admin
    .from('account_deletion_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Account Deletion Feedback</h1>
      <p className="text-foreground/60 mb-6">
        Optional feedback submitted by users when they delete their account.
      </p>
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="p-4">Date</th>
              <th className="p-4">Email</th>
              <th className="p-4">Primary Reason</th>
              <th className="p-4">Additional Feedback</th>
            </tr>
          </thead>
          <tbody>
            {(!feedback || feedback.length === 0) ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-foreground/50">
                  No deletion feedback yet.
                </td>
              </tr>
            ) : (
              feedback.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="p-4 text-sm">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">{row.user_email ?? '-'}</td>
                  <td className="p-4">
                    {row.reason_primary
                      ? REASON_LABELS[row.reason_primary] ?? row.reason_primary
                      : '-'}
                  </td>
                  <td className="p-4 max-w-xs truncate" title={row.reason_other ?? ''}>
                    {row.reason_other ?? '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
