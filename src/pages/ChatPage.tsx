import React, { useEffect, useRef, useState } from 'react';
import { sendMessage, deleteSession } from '../api';
import { ChatMessage, Persona } from '../types';

interface Props {
  sessionId: string;
  persona: Persona;
  onReset: () => void;
}

const ChatPage: React.FC<Props> = ({ sessionId, persona, onReset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 탭/창 닫을 때 세션 삭제
  useEffect(() => {
    const cleanup = () => deleteSession(sessionId);
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const data = await sendMessage(sessionId, userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await deleteSession(sessionId);
    onReset();
  };

  return (
    <div style={styles.container}>
      {/* 상단바 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={handleReset}>{'<'}</button>
        <div style={styles.headerInfo}>
          <div style={styles.headerAvatar}>{persona.name.charAt(0)}</div>
          <span style={styles.headerName}>{persona.name}</span>
        </div>
        <button
          style={styles.memoryBtn}
          onClick={() => setShowMemory(v => !v)}
          title="기억한 것들"
        >🧠</button>
      </div>

      {/* 기억 패널 */}
      {showMemory && persona.memories && persona.memories.length > 0 && (
        <div style={styles.memoryPanel}>
          <p style={styles.memoryTitle}>🧠 AI가 기억한 것들</p>
          {persona.memories.map((m, i) => (
            <p key={i} style={styles.memoryItem}>• {m}</p>
          ))}
        </div>
      )}

      {/* 메시지 목록 */}
      <div style={styles.messageList}>
        {/* 시작 안내 */}
        <div style={styles.dateLabel}>데칼코마니 AI</div>

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
            {msg.role === 'assistant' && (
              <div style={styles.assistantAvatar}>{persona.name.charAt(0)}</div>
            )}
            <div style={msg.role === 'user' ? styles.userBubble : styles.assistantBubble}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
            <div style={styles.assistantAvatar}>{persona.name.charAt(0)}</div>
            <div style={styles.typingBubble}>
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
              <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력"
          disabled={loading}
        />
        <button
          style={{ ...styles.sendBtn, ...((!input.trim() || loading) ? styles.sendBtnDisabled : {}) }}
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          전송
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#B2C8D9',
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    background: '#2E3542',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    width: '36px',
  },
  memoryBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    width: '36px',
  },
  memoryPanel: {
    background: '#1e2530',
    padding: '12px 16px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    flexShrink: 0,
  },
  memoryTitle: {
    color: '#FEE500',
    fontWeight: 'bold',
    fontSize: '13px',
    margin: '0 0 8px',
  },
  memoryItem: {
    color: '#ccc',
    fontSize: '12px',
    margin: '2px 0',
    lineHeight: '1.5',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#FEE500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  headerName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#555',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '10px',
    padding: '4px 12px',
    margin: '0 auto 16px',
  },
  userBubble: {
    background: '#FEE500',
    borderRadius: '18px 18px 4px 18px',
    padding: '10px 14px',
    maxWidth: '70%',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1a1a1a',
    wordBreak: 'break-word',
  },
  assistantBubble: {
    background: '#fff',
    borderRadius: '18px 18px 18px 4px',
    padding: '10px 14px',
    maxWidth: '70%',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1a1a1a',
    wordBreak: 'break-word',
  },
  assistantAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FEE500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginRight: '6px',
  },
  typingBubble: {
    background: '#fff',
    borderRadius: '18px 18px 18px 4px',
    padding: '14px 18px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#aaa',
    display: 'inline-block',
    animation: 'bounce 1.2s infinite',
  },
  inputArea: {
    background: '#fff',
    padding: '10px 12px',
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
    borderTop: '1px solid #e0e0e0',
  },
  input: {
    flex: 1,
    border: '1px solid #ddd',
    borderRadius: '20px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    background: '#FEE500',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1a1a1a',
  },
  sendBtnDisabled: {
    background: '#f0f0f0',
    color: '#aaa',
    cursor: 'not-allowed',
  },
};

export default ChatPage;
