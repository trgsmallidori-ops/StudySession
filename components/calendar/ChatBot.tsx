'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const STUDY_ACTION_REGEX = /\[STUDY_ACTION:\s*([^|]+)\s*\|\s*([^\]]+)\]/;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  onGenerateStudyCourse: (topic: string) => void;
  onCalendarUpdated?: () => void;
}

export default function ChatBot({ onGenerateStudyCourse, onCalendarUpdated }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to get response');
      }

      const reply = typeof data.reply === 'string' ? data.reply : 'No response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      if (data.calendarUpdated === true && onCalendarUpdated) {
        onCalendarUpdated();
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent-cyan/20 text-accent-cyan border-2 border-accent-cyan/50 hover:bg-accent-cyan/30 flex items-center justify-center shadow-lg transition-all"
        aria-label={isOpen ? 'Close chat' : 'Open study assistant'}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[70vh] flex flex-col glass rounded-2xl border border-accent-cyan/20 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold text-accent-cyan">Study Assistant</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/70"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !streaming && (
              <p className="text-sm text-foreground/60">
                Ask about your calendar or make quick edits. Try &quot;When is my next assignment?&quot; or &quot;Move my math test to Friday&quot;
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <AssistantBubble
                      content={msg.content}
                      onGenerateStudyCourse={onGenerateStudyCourse}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-4 py-2 text-sm bg-white/5 border border-white/10 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-accent-cyan" />
                  <span className="text-foreground/60">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your calendar..."
                disabled={streaming}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/40 focus:border-accent-cyan focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="px-4 py-2.5 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {streaming ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function AssistantBubble({
  content,
  onGenerateStudyCourse,
}: {
  content: string;
  onGenerateStudyCourse: (topic: string) => void;
}) {
  const match = content.match(STUDY_ACTION_REGEX);
  if (!match) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  const [fullMatch, topic, className] = match;
  const before = content.slice(0, content.indexOf(fullMatch)).trim();
  const after = content.slice(content.indexOf(fullMatch) + fullMatch.length).trim();

  return (
    <div className="space-y-2">
      {before && <p className="whitespace-pre-wrap">{before}</p>}
      <button
        type="button"
        onClick={() => onGenerateStudyCourse(topic.trim())}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-pink/20 text-accent-pink border border-accent-pink/50 hover:bg-accent-pink/30 text-sm font-medium transition-colors"
      >
        Generate Study Course: {topic.trim()}
      </button>
      {after && <p className="whitespace-pre-wrap">{after}</p>}
    </div>
  );
}
