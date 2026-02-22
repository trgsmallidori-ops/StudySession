'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const SAMPLE_PASSAGES = [
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly. Bright vixens jump; dozy fowl quack. Jackdaws love my big sphinx of quartz. Fix problem quickly with galvanized jets.',
  'Success is not final, failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle. Your time is limited, so don\'t waste it living someone else\'s life. Have the courage to follow your heart and intuition.',
  'Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish. The people who are crazy enough to think they can change the world are the ones who do. Design is not just what it looks like and feels like — design is how it works.',
  'Learning never exhausts the mind. The roots of education are bitter, but the fruit is sweet. Knowledge is power, but wisdom is knowing how to use it. Education is the passport to the future, for tomorrow belongs to those who prepare for it today. The beautiful thing about learning is that nobody can take it away from you.',
  'The future belongs to those who believe in the beauty of their dreams. It does not matter how slowly you go as long as you do not stop. Perseverance is not a long race; it is many short races one after the other. Our greatest glory is not in never falling, but in rising every time we fall. Believe you can and you are halfway there.',
  'In the middle of every difficulty lies opportunity. Imagination is more important than knowledge, for knowledge is limited while imagination embraces the entire world. Logic will get you from A to B, but imagination will take you everywhere. Life is like riding a bicycle — to keep your balance, you must keep moving forward.',
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit. The measure of intelligence is the ability to change. It is not that I am so smart; it is just that I stay with problems longer. Strive not to be a success, but rather to be of value. A person who never made a mistake never tried anything new.',
];

export interface TypingScore {
  wpm: number;
  accuracy: number;
}

interface TypingTestProps {
  passage?: string;
  onComplete?: (score: TypingScore) => void;
  isPractice?: boolean;
  practiceRunsUsed?: number;
  maxPracticeRuns?: number;
  onRestart?: () => void;
}

function getRandomPassage(): string {
  return SAMPLE_PASSAGES[Math.floor(Math.random() * SAMPLE_PASSAGES.length)];
}

export default function TypingTest({
  passage: propPassage,
  onComplete,
  isPractice = true,
  practiceRunsUsed = 0,
  maxPracticeRuns = 5,
  onRestart,
}: TypingTestProps) {
  // Start with null so server and client render the same initial HTML (no random content on SSR)
  const [passage, setPassage] = useState<string | null>(propPassage ?? null);

  useEffect(() => {
    if (!passage) setPassage(getRandomPassage());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chars = (passage ?? '').split('');
  const typedChars = input.split('');

  const correctCount = typedChars.filter((c, i) => c === chars[i]).length;
  const totalTyped = typedChars.length;
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round((correctCount / 5) / elapsedMinutes) : 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isDone) {
        e.preventDefault();
        return;
      }
      if (!startTime) setStartTime(Date.now());
      if (e.key === 'Backspace' && input.length === 0) e.preventDefault();
    },
    [isDone, startTime, input.length]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (isDone) return;
      if (!startTime) setStartTime(Date.now());

      if (value.length >= chars.length) {
        setInput(value.slice(0, chars.length));
        setIsDone(true);
        const finalCorrect = value
          .slice(0, chars.length)
          .split('')
          .filter((c, i) => c === chars[i]).length;
        const finalAccuracy =
          chars.length > 0 ? Math.round((finalCorrect / chars.length) * 100) : 100;
        const finalElapsed = (Date.now() - (startTime || Date.now())) / 60000;
        const finalWpm = finalElapsed > 0 ? Math.round((finalCorrect / 5) / finalElapsed) : 0;
        onComplete?.({ wpm: finalWpm, accuracy: finalAccuracy });
      } else {
        setInput(value);
      }
    },
    [chars, isDone, startTime, onComplete]
  );

  const canRestart = isPractice && practiceRunsUsed < maxPracticeRuns;

  const handleRestart = useCallback(() => {
    if (!canRestart) return;
    if (!propPassage) setPassage(getRandomPassage());
    setInput('');
    setStartTime(null);
    setIsDone(false);
    onRestart?.();
    inputRef.current?.focus();
  }, [propPassage, canRestart, onRestart]);

  useEffect(() => {
    if (isDone && !isPractice) return;
    inputRef.current?.focus();
  }, [isDone, isPractice]);

  if (!passage) {
    return (
      <div className="min-h-[200px] rounded-lg bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm">
          <span>
            <strong className="text-accent-cyan">{wpm}</strong> WPM
          </span>
          <span>
            <strong className="text-accent-cyan">{accuracy}%</strong> accuracy
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isPractice && (
            <span className="text-sm text-foreground/60">
              Practice runs: <strong className={practiceRunsUsed >= maxPracticeRuns ? 'text-red-400' : 'text-accent-cyan'}>{practiceRunsUsed}</strong>/{maxPracticeRuns}
            </span>
          )}
          {canRestart && (
            <button
              type="button"
              onClick={handleRestart}
              className="text-sm text-foreground/70 hover:text-accent-cyan"
            >
              New passage
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="min-h-[100px] p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-lg leading-relaxed break-words">
          {chars.map((char, i) => {
            const typed = typedChars[i];
            const isCorrect = typed === undefined ? null : typed === char;
            return (
              <span
                key={i}
                className={
                  typed === undefined
                    ? 'text-foreground/50'
                    : isCorrect
                      ? 'text-accent-cyan'
                      : 'text-red-400 bg-red-500/20'
                }
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDone && !isPractice}
          placeholder="Start typing here..."
          className="w-full min-h-[80px] p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {isDone && (
        <p className="text-sm text-foreground/70">
          {isPractice
            ? practiceRunsUsed >= maxPracticeRuns
              ? 'All practice runs used. Submit your final score below.'
              : 'Practice complete! Click "New passage" to try again.'
            : 'Complete!'}
        </p>
      )}
    </div>
  );
}
