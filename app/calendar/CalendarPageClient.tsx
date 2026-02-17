'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import ClassForm from '@/components/calendar/ClassForm';
import UploadOutline from '@/components/calendar/UploadOutline';
import ExportButton from '@/components/calendar/ExportButton';
import EventModal from '@/components/calendar/EventModal';
import type { EventFormPayload } from '@/components/calendar/EventModal';
import { CalendarEvent as DBCalendarEvent, Class } from '@/lib/database.types';
import { addMonths, subMonths } from 'date-fns';
import Link from 'next/link';

interface ParsedOutline {
  courseName: string;
  tests: { date: string; description: string }[];
  assignments: { date: string; description: string }[];
  schedule: {
    days: number[] | 'NEEDS_INPUT';
    startTime: string | 'NEEDS_INPUT';
    endTime: string | 'NEEDS_INPUT';
  };
}

interface CalendarPageClientProps {
  uploadsUsed: number;
  uploadLimit: number;
}

export default function CalendarPageClient({
  uploadsUsed,
  uploadLimit,
}: CalendarPageClientProps) {
  const [events, setEvents] = useState<DBCalendarEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DBCalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [dateRange] = useState({ start: '', end: '' });

  const fetchEvents = useCallback(async () => {
    const start = dateRange.start || subMonths(new Date(), 1).toISOString();
    const end = dateRange.end || addMonths(new Date(), 2).toISOString();

    const res = await fetch(`/api/events?start=${start}&end=${end}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }, [dateRange]);

  const fetchClasses = useCallback(async () => {
    const res = await fetch('/api/classes');
    if (res.ok) {
      const data = await res.json();
      setClasses(data);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchClasses()]);
      setLoading(false);
    };
    load();
  }, [fetchEvents, fetchClasses]);

  const handleCreateClass = async (data: {
    name: string;
    color: string;
    days_of_week: number[];
    start_time?: string;
    end_time?: string;
  }) => {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchClasses();
      setShowClassForm(false);
    }
  };

  const handleUpdateClass = async (data: {
    name: string;
    color: string;
    days_of_week: number[];
    start_time?: string;
    end_time?: string;
  }) => {
    if (!editingClass) return;
    const res = await fetch(`/api/classes/${editingClass.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchClasses();
      setEditingClass(null);
      setShowClassForm(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchClasses();
  };

  const handleParsed = async (parsed: ParsedOutline) => {
    let classId: string | null = null;
    const color = '#00f0ff';

    const days =
      parsed.schedule.days === 'NEEDS_INPUT'
        ? []
        : Array.isArray(parsed.schedule.days)
          ? parsed.schedule.days
          : [];
    const startTime =
      parsed.schedule.startTime === 'NEEDS_INPUT' ? '' : parsed.schedule.startTime ?? '';
    const endTime =
      parsed.schedule.endTime === 'NEEDS_INPUT' ? '' : parsed.schedule.endTime ?? '';

    const classRes = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.courseName,
        color,
        days_of_week: days,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
      }),
    });
    if (classRes.ok) {
      const newClass = await classRes.json();
      classId = newClass.id;
      await fetchClasses();
    }

    const toCreate: { title: string; due_date: string; event_type: 'test' | 'assignment'; description?: string }[] = [];

    for (const t of parsed.tests ?? []) {
      if (t.date) toCreate.push({ title: t.description || 'Test', due_date: t.date, event_type: 'test', description: t.description });
    }
    for (const a of parsed.assignments ?? []) {
      if (a.date) toCreate.push({ title: a.description || 'Assignment', due_date: a.date, event_type: 'assignment', description: a.description });
    }

    for (const ev of toCreate) {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          title: ev.title,
          description: ev.description,
          event_type: ev.event_type,
          due_date: new Date(ev.due_date).toISOString(),
          color,
        }),
      });
    }

    await fetchEvents();
    setShowUpload(false);
  };

  const handleCreateEvent = async (data: EventFormPayload) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchEvents();
      setShowEventModal(false);
      setEditingEvent(null);
      setEventModalDate(null);
    }
  };

  const handleUpdateEvent = async (data: EventFormPayload) => {
    if (!editingEvent) return;
    const res = await fetch(`/api/events/${editingEvent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchEvents();
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (event: DBCalendarEvent) => {
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchEvents();
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  const openEventModal = (event?: DBCalendarEvent | null, date?: Date | null) => {
    setEditingEvent(event ?? null);
    setEventModalDate(date ?? null);
    setShowEventModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex flex-wrap gap-2">
          <ExportButton events={events} disabled={loading} />
          <button
            onClick={() => {
              setEditingClass(null);
              setShowClassForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 font-semibold"
          >
            <Plus size={18} />
            Add Class
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 font-semibold"
          >
            <Upload size={18} />
            Upload Outline
          </button>
        </div>
      </div>

      {showClassForm && (
        <div className="glass rounded-xl p-6 mb-8 border border-accent-cyan/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingClass ? 'Edit Class' : 'New Class'}
            </h2>
            <button onClick={() => { setShowClassForm(false); setEditingClass(null); }}>
              <X size={24} />
            </button>
          </div>
          <ClassForm
            initialData={editingClass ? {
              id: editingClass.id,
              name: editingClass.name,
              color: editingClass.color,
              days_of_week: editingClass.days_of_week ?? [],
              start_time: editingClass.start_time ?? undefined,
              end_time: editingClass.end_time ?? undefined,
            } : undefined}
            onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
            onCancel={() => { setShowClassForm(false); setEditingClass(null); }}
          />
        </div>
      )}

      {showUpload && (
        <div className="glass rounded-xl p-6 mb-8 border border-accent-pink/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload Course Outline</h2>
            <button onClick={() => setShowUpload(false)}>
              <X size={24} />
            </button>
          </div>
          <UploadOutline
            onParsed={handleParsed}
            uploadsUsed={uploadsUsed}
            uploadLimit={uploadLimit}
            onLimitReached={() => setShowPaywall(true)}
          />
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-md border border-accent-cyan/20">
            <h3 className="text-xl font-bold mb-4">Upload Limit Reached</h3>
            <p className="text-foreground/80 mb-6">
              Free accounts get 2 AI-powered outline uploads. Upgrade to Scholar or Ultimate for unlimited uploads.
            </p>
            <div className="flex gap-4">
              <Link
                href="/pricing"
                className="flex-1 py-3 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 text-center font-semibold"
              >
                View Plans
              </Link>
              <button
                onClick={() => setShowPaywall(false)}
                className="px-6 py-3 rounded-lg bg-white/5 border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Your Classes</h3>
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span>{c.name}</span>
              <button
                onClick={() => {
                  setEditingClass(c);
                  setShowClassForm(true);
                }}
                className="text-sm text-accent-cyan hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClass(c.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-foreground/60">No classes yet. Add one or upload an outline.</p>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="h-[600px] flex items-center justify-center glass rounded-xl border border-white/5">
            <div className="animate-pulse text-foreground/60">Loading calendar...</div>
          </div>
        ) : (
          <CalendarView
            events={events}
            onSelectEvent={(e) => openEventModal(e)}
            onSelectDate={(d) => openEventModal(null, d)}
            onSelectSlot={(d) => openEventModal(null, d)}
          />
        )}
      </div>

      <EventModal
        key={editingEvent?.id ?? eventModalDate?.toISOString() ?? 'new'}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
          setEventModalDate(null);
        }}
        event={editingEvent}
        initialDate={eventModalDate}
        classes={classes}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
      />
    </div>
  );
}
