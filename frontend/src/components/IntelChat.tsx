import { useState, useRef, useEffect } from 'react';
import { sendIntelChat, type ChatMessage } from '../api/intel';

interface Props {
  level: 'meal' | 'session' | 'daily' | 'weekly' | 'monthly';
  contextData: Record<string, unknown>;
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

export default function IntelChat({ level, contextData }: Props) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setError(null);
    const userEntry: ChatMessage = { role: 'user', text: msg };
    setHistory(h => [...h, userEntry]);
    setLoading(true);
    try {
      const { reply } = await sendIntelChat({ level, contextData, message: msg, history });
      setHistory(h => [...h, { role: 'assistant', text: reply }]);
    } catch {
      setError('No reply — try again.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Chat thread — renders inside parent scroll area */}
      {(history.length > 0 || loading || error) && (
        <div style={{ marginTop: 32, borderTop: '1px solid var(--ink-4)', paddingTop: 20 }}>
          {history.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 16,
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}>
              <span style={{
                ...mono,
                fontSize: 11,
                lineHeight: 1.55,
                color: msg.role === 'user' ? 'var(--ink-1)' : 'var(--ink-2)',
                display: 'inline-block',
                maxWidth: '85%',
                paddingLeft: msg.role === 'assistant' ? 12 : 0,
              }}>
                {msg.text}
              </span>
            </div>
          ))}
          {loading && (
            <div style={{ ...mono, fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', paddingLeft: 12, marginBottom: 16 }}>
              —
            </div>
          )}
          {error && (
            <div style={{ ...mono, fontSize: 10, color: 'var(--ink-3)', paddingLeft: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Fixed chat input footer */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--ink-4)',
        padding: '10px 20px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        background: 'var(--bg-0)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question…"
          rows={1}
          style={{
            flex: 1,
            ...mono,
            fontSize: 11,
            background: 'var(--bg-1)',
            border: '1px solid var(--ink-4)',
            color: 'var(--ink-0)',
            padding: '8px 10px',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.4,
            maxHeight: 72,
            overflowY: 'auto',
          }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            ...mono,
            fontSize: 9,
            letterSpacing: '0.1em',
            color: loading || !input.trim() ? 'var(--ink-3)' : 'var(--gold-1)',
            background: 'none',
            border: 'none',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            padding: '8px 0',
            whiteSpace: 'nowrap',
          }}
        >
          SEND →
        </button>
      </div>
    </>
  );
}
