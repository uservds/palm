'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { classifyMessage } from '@/lib/chat/filter';
import { generateMockReply } from '@/lib/chat/mockReplies';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  text:
    'Привет! Я ИИ-хиромант — спрашивайте что угодно о линиях, холмах и знаках на ладони. Для разбора именно вашей руки нужен скан, но про хиромантию в целом могу рассказать прямо здесь.',
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const category = classifyMessage(text);
    const delay = 700 + Math.random() * 600;

    window.setTimeout(() => {
      const reply = generateMockReply(text, category);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-content-border bg-surface shadow-xl sm:right-6"
            role="dialog"
            aria-label="Чат с ИИ-хиромантом"
          >
            <div className="flex items-center justify-between border-b border-content-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-content-main">ИИ-хиромант</p>
                  <p className="text-xs text-content-muted">Бесплатно · без ограничений</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-content-muted transition hover:bg-neutral-badge hover:text-content-main"
                aria-label="Закрыть чат"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'border border-content-border bg-background text-content-main'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl border border-content-border bg-background px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 border-t border-content-border bg-neutral-badge px-4 py-2 text-[11px] text-neutral-badgeText">
              <Lock className="h-3 w-3 shrink-0" />
              <span>История чата не сохраняется между сессиями. В подписке — хранится в профиле.</span>
            </div>

            <div className="flex items-end gap-2 border-t border-content-border p-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Спросите о линиях, холмах, знаках..."
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-xl border border-content-border bg-background px-3 py-2 text-sm text-content-main outline-none placeholder:text-content-muted focus:border-primary"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 bg-primary hover:bg-primary-hover"
                aria-label="Отправить сообщение"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:right-6"
        aria-label={isOpen ? 'Закрыть чат с ИИ-хиромантом' : 'Открыть чат с ИИ-хиромантом'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X className="h-6 w-6" /> : <span className="text-sm font-bold tracking-wide">AI</span>}
          </motion.span>
        </AnimatePresence>
      </button>
    </>
  );
}