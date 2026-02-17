'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import type { CalendarEvent } from '@/lib/database.types';
import { downloadIcalFile } from '@/lib/icalExport';

interface ExportButtonProps {
  events: CalendarEvent[];
  disabled?: boolean;
}

export default function ExportButton({ events, disabled }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    downloadIcalFile(events);
    setIsOpen(false);
  };

  const handleOpenInCalendar = () => {
    // Download .ics file - user can double-click to import into their default calendar app
    downloadIcalFile(events);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/50 hover:bg-accent-purple/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Export
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-lg border border-white/10 py-1 z-50 shadow-xl">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors"
          >
            <Download size={18} className="text-foreground/70" />
            <span>Download .ics file</span>
          </button>
          <button
            type="button"
            onClick={handleOpenInCalendar}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors"
          >
            <Calendar size={18} className="text-foreground/70" />
            <span>Import to default calendar</span>
          </button>
        </div>
      )}
    </div>
  );
}
