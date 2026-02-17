import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import CreateRaceForm from './CreateRaceForm';

export default async function AdminRacesPage() {
  const supabase = await createClient();

  const { data: periods } = await supabase
    .from('race_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(12);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Race Management</h1>
      <CreateRaceForm />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Race Periods</h2>
        <div className="space-y-4">
          {(periods ?? []).map((p) => (
            <div
              key={p.id}
              className="glass rounded-xl p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">
                  {format(new Date(p.start_date), 'MMM yyyy')} - {p.status}
                </p>
                <p className="text-sm text-foreground/60">
                  {format(new Date(p.start_date), 'MMM d')} - {format(new Date(p.end_date), 'MMM d')}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <span>1st: ${p.prize_pool_1st}</span>
                <span>2nd: ${p.prize_pool_2nd}</span>
                <span>3rd: ${p.prize_pool_3rd}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
