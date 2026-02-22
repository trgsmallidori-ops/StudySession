'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ParsedOutline {
  courseName: string;
  events?: {
    date: string;
    time?: string;
    description: string;
    type: 'test' | 'assignment' | 'lecture' | 'other' | 'quiz' | 'reading' | 'exam' | 'final' | 'midterm' | 'lab' | 'project' | 'homework';
    category?: 'quiz' | 'reading' | 'exam' | 'final' | 'midterm' | 'assignment' | 'lecture' | 'lab' | 'other';
    confidence: number;
    needsReview: boolean;
    sourceSnippet: string;
  }[];
  tests: { date: string; description: string }[];
  assignments: { date: string; description: string }[];
  schedule: {
    days: number[] | 'NEEDS_INPUT';
    startTime: string | 'NEEDS_INPUT';
    endTime: string | 'NEEDS_INPUT';
    confidence?: number;
    needsReview?: boolean;
  };
  meta?: {
    parserVersion?: string;
    warnings?: string[];
    extractedSections?: string[];
  };
}

interface UploadOutlineProps {
  onParsed: (data: ParsedOutline) => void;
  uploadsUsed?: number;
  uploadLimit?: number;
  onLimitReached?: () => void;
}

export default function UploadOutline({
  onParsed,
  uploadsUsed,
  uploadLimit,
  onLimitReached,
}: UploadOutlineProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExt = ['.pdf', '.txt', '.md', '.docx'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isValid =
      validTypes.includes(file.type) || validExt.includes(ext);

    if (!isValid) {
      setError(t.calendar.invalidFile);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t.calendar.fileTooLarge);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-outline', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          onLimitReached?.();
        } else {
          setError(data.error ?? t.calendar.parseFailed);
        }
        return;
      }

      onParsed(data);
    } catch {
      setError(t.calendar.parseFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {typeof uploadsUsed === 'number' && typeof uploadLimit === 'number' ? (
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <span>
            {t.calendar.uploadsUsed.replace('{n}', String(uploadsUsed)).replace('{limit}', String(uploadLimit))}
          </span>
        </div>
      ) : null}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? 'border-accent-cyan bg-accent-cyan/5' : 'border-white/20 hover:border-white/40'}
          ${loading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          onChange={handleChange}
          className="hidden"
        />
        {loading ? (
          <Loader2 className="mx-auto animate-spin text-accent-cyan" size={48} />
        ) : (
          <>
            <Upload className="mx-auto text-accent-cyan mb-4" size={48} />
            <p className="text-foreground font-medium mb-1">
              {t.calendar.dropOutline}
            </p>
            <p className="text-sm text-foreground/60">
              {t.calendar.uploadHint}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <X size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
