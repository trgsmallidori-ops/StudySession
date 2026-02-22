'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Filter, Trash2, Upload } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import ClassForm from '@/components/calendar/ClassForm';
import GenerateCourseModal from '@/components/learn/GenerateCourseModal';
import ChatBot from '@/components/calendar/ChatBot';
import DeleteClassModal from '@/components/calendar/DeleteClassModal';
import UploadOutline from '@/components/calendar/UploadOutline';
import ParsedOutlineReviewModal from '@/components/calendar/ParsedOutlineReviewModal';
import ExportButton from '@/components/calendar/ExportButton';
import EventModal from '@/components/calendar/EventModal';
import type { EventFormPayload } from '@/components/calendar/EventModal';
import { CalendarEvent as DBCalendarEvent, Class } from '@/lib/database.types';
import { addMonths, subMonths } from 'date-fns';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CalendarPageClientProps {
  uploadsUsed?: number;
  uploadLimit?: number;
  canUseAI?: boolean;
  canGenerateStudyCourse?: boolean;
}

export default function CalendarPageClient({ uploadsUsed = 0, uploadLimit = 999, canUseAI = false, canGenerateStudyCourse = false }: CalendarPageClientProps) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<DBCalendarEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DBCalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [dateRange] = useState({ start: '', end: '' });
  const [classFilter, setClassFilter] = useState<Set<string>>(new Set());
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [calendarActionError, setCalendarActionError] = useState<string | null>(null);
  const [clearingCalendar, setClearingCalendar] = useState(false);
  const [showGenerateCourseModal, setShowGenerateCourseModal] = useState(false);
  const [generateCourseTopic, setGenerateCourseTopic] = useState('');
  const [generateCourseFromTests, setGenerateCourseFromTests] = useState(false);
  const [parsedOutline, setParsedOutline] = useState<unknown | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [importingOutline, setImportingOutline] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);

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

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    const id = classToDelete.id;
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setClassToDelete(null);
      setClassFilter((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await Promise.all([fetchClasses(), fetchEvents()]);
    }
  };

  const handleClearCalendar = async () => {
    if (!confirm(t.calendar.confirmClear)) return;
    setClearingCalendar(true);
    const res = await fetch('/api/calendar/clear', { method: 'POST' });
    if (res.ok) {
      setClasses([]);
      setEvents([]);
      setClassFilter(new Set());
      setCalendarActionError(null);
    } else {
      const err = await res.json().catch(() => null);
      setCalendarActionError(err?.error ?? 'Failed to clear calendar.');
    }
    setClearingCalendar(false);
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

  const filteredEvents = useMemo(() => {
    if (classFilter.size === 0) return events;
    return events.filter((e) => e.class_id && classFilter.has(e.class_id));
  }, [events, classFilter]);

  const toggleClassFilter = (classId: string) => {
    setClassFilter((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const handleParsedOutline = (data: unknown) => {
    setParsedOutline(data);
    setShowReviewModal(true);
  };

  const handleImportOutline = async (reviewed: unknown) => {
    setImportingOutline(true);
    try {
      const res = await fetch('/api/calendar/import-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewed),
      });
      if (res.ok) {
        setShowReviewModal(false);
        setParsedOutline(null);
        await Promise.all([fetchEvents(), fetchClasses()]);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Import failed');
      }
    } catch (error) {
      setCalendarActionError(error instanceof Error ? error.message : 'Failed to import');
    } finally {
      setImportingOutline(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold">{t.calendar.title}</h1>
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
            {t.calendar.addClass}
          </button>
          <button
            onClick={handleClearCalendar}
            disabled={clearingCalendar}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} />
            {clearingCalendar ? t.calendar.clearing : t.calendar.clearCalendar}
          </button>
          {canUseAI && (
            <button
              onClick={() => setShowUploadSection((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                showUploadSection
                  ? 'bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/50'
                  : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30'
              }`}
            >
              <Upload size={18} />
              {t.calendar.uploadSyllabus}
            </button>
          )}
        </div>
      </div>

      {canUseAI && showUploadSection && (
        <div className="glass rounded-xl p-6 mb-6 border border-accent-cyan/20">
          <h3 className="text-lg font-semibold mb-4">{t.calendar.importOutline}</h3>
          <UploadOutline
            onParsed={handleParsedOutline}
            uploadsUsed={uploadsUsed}
            uploadLimit={uploadLimit}
            onLimitReached={() => setShowUploadSection(false)}
          />
        </div>
      )}

      <ParsedOutlineReviewModal
        isOpen={showReviewModal}
        parsed={parsedOutline as Parameters<typeof ParsedOutlineReviewModal>[0]['parsed']}
        isSubmitting={importingOutline}
        onConfirm={handleImportOutline}
        onCancel={() => {
          setShowReviewModal(false);
          setParsedOutline(null);
        }}
      />

      {showClassForm && (
        <div className="glass rounded-xl p-6 mb-8 border border-accent-cyan/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingClass ? t.calendar.editClass : t.calendar.newClass}
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

      <DeleteClassModal
        isOpen={!!classToDelete}
        className={classToDelete?.name ?? ''}
        onConfirm={handleDeleteClass}
        onCancel={() => setClassToDelete(null)}
      />

      <div className="mb-4 flex-shrink-0">
        {calendarActionError && (
          <div className="mb-3 space-y-1">
            <p className="text-sm text-red-400">{calendarActionError}</p>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Filter size={18} className="text-foreground/60" />
          {t.calendar.yourClasses}
          {classFilter.size > 0 && (
            <span className="text-sm font-normal text-foreground/60">
              {classFilter.size !== 1 ? t.calendar.filteringByPlural.replace('{n}', String(classFilter.size)) : t.calendar.filteringBy.replace('{n}', String(classFilter.size))}
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg glass border transition-colors ${
                classFilter.size === 0 || classFilter.has(c.id)
                  ? 'border-white/10'
                  : 'border-white/5 opacity-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleClassFilter(c.id)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title={classFilter.size === 0 || classFilter.has(c.id) ? 'Click to hide from calendar' : 'Click to show on calendar'}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
              </button>
              <button
                onClick={() => {
                  setEditingClass(c);
                  setShowClassForm(true);
                }}
                className="text-sm text-accent-cyan hover:underline"
              >
                {t.calendar.edit}
              </button>
              <button
                onClick={() => setClassToDelete(c)}
                className="text-sm text-red-400 hover:underline"
              >
                {t.calendar.delete}
              </button>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-foreground/60">{t.calendar.noClasses}</p>
          )}
        </div>
        {classes.length > 0 && (
          <p className="text-sm text-foreground/50 mt-2">
            {t.calendar.clickToFilter}
            {classFilter.size > 0 && (
              <button
                type="button"
                onClick={() => setClassFilter(new Set())}
                className="ml-2 text-accent-cyan hover:underline"
              >
                {t.calendar.showAll}
              </button>
            )}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-[calc(100dvh-160px)] flex flex-col">
        {loading ? (
          <div className="flex-1 min-h-0 flex items-center justify-center glass rounded-xl border border-white/5">
            <div className="animate-pulse text-foreground/60">{t.calendar.loading}</div>
          </div>
        ) : (
          <CalendarView
            events={filteredEvents}
            classes={classes}
            onSelectEvent={(e) => openEventModal(e)}
            onSelectDate={(d) => openEventModal(null, d)}
            onSelectSlot={(d) => openEventModal(null, d)}
            onGenerateStudyCourse={(topic, fromTests) => {
              setGenerateCourseTopic(topic);
              setGenerateCourseFromTests(!!fromTests);
              setShowGenerateCourseModal(true);
            }}
            canGenerateStudyCourse={canGenerateStudyCourse}
          />
        )}
      </div>

      <GenerateCourseModal
        isOpen={showGenerateCourseModal}
        onClose={() => {
          setShowGenerateCourseModal(false);
          setGenerateCourseTopic('');
          setGenerateCourseFromTests(false);
        }}
        initialTopic={generateCourseTopic}
        fromTests={generateCourseFromTests}
      />

      {canUseAI && (
        <ChatBot
          onGenerateStudyCourse={(topic) => {
            setGenerateCourseTopic(topic);
            setGenerateCourseFromTests(false);
            setShowGenerateCourseModal(true);
          }}
          onCalendarUpdated={fetchEvents}
        />
      )}

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
