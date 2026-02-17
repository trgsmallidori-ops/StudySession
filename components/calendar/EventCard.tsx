'use client';

import { CalendarEvent } from '@/lib/database.types';
import { format } from 'date-fns';
import { FileText, ClipboardList, BookOpen, Circle } from 'lucide-react';

const EVENT_ICONS = {
  test: FileText,
  assignment: ClipboardList,
  lecture: BookOpen,
  other: Circle,
};

interface EventCardProps {
  event: CalendarEvent;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const Icon = EVENT_ICONS[event.event_type] ?? Circle;

  return (
    <div
      className="glass rounded-lg p-4 border-l-4 hover:border-opacity-100 transition-colors"
      style={{ borderLeftColor: event.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className="text-foreground/60 flex-shrink-0" />
            <span className="font-medium truncate">{event.title}</span>
          </div>
          <p className="text-sm text-foreground/60">
            {format(new Date(event.due_date), 'MMM d, yyyy • h:mm a')}
          </p>
          {event.description && (
            <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="text-sm text-accent-cyan hover:underline"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
