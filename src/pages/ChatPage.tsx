import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sendMessage, deleteSession, greetUser } from '../api';
import { ChatMessage, Persona } from '../types';

interface Props {
  sessionId: string;
  persona: Persona;
  nickname: string;
  onReset: () => void;
}

interface DisplayMessage extends ChatMessage {
  timestamp: string;
}

/* ── 유틸 ──────────────────────────────────────────── */

const getTimeString = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${hour}:${String(m).padStart(2, '0')}`;
};

// 답장 딜레이: MBTI + 메시지 길이 + 랜덤
const calcDelay = (text: string, mbti?: string): number => {
  const charDelay = Math.min(text.length * 28, 1800);
  const base = charDelay + 500;
  const ei = mbti?.[0];
  const mbtiMult = ei === 'E' ? 0.6 : ei === 'I' ? 1.4 : 1.0;
  const jitter = 0.75 + Math.random() * 0.5;
  return Math.round(Math.min(base * mbtiMult * jitter, 4500));
};

// 버블 사이 딜레이 (짧은 것 먼저 → 긴 것 나중)
const calcBubbleGap = (text: string): number => {
  const base = 300 + text.length * 15;
  return Math.min(base + Math.random() * 300, 1500);
};

// AI 응답을 여러 버블로 분리
const splitIntoBubbles = (text: string): string[] => {
  // 1. AI가 직접 분리한 ||| 우선 처리 (가장 정확)
  if (text.includes('|||')) {
    return text.split('|||').map(s => s.trim()).filter(Boolean);
  }

  // 2. 개행 기반 분리
  const byNewline = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  // 3. 감탄사 접두 분리: "ㅋㅋㅋ 진짜로?" → ["ㅋㅋㅋ", "진짜로?"]
  const emotionPrefix = text.match(/^([ㅋㅎㅠㅜ]{2,}|헐+|대박|진짜\??|어머+)\s+(.+)$/);
  if (emotionPrefix) return [emotionPrefix[1], emotionPrefix[2]];

  return [text];
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/* ── 컴포넌트 ──────────────────────────────────────── */

const ChatPage: React.FC<Props> = ({ sessionId, persona, nickname, onReset }) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);      // 타이핑 점 애니메이션
  const [isAiSpeaking, setIsAiSpeaking] = useState(true); // 전송 잠금 (버블 사이 포함)
  const [showMemory, setShowMemory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const cleanup = () => deleteSession(sessionId);
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, [sessionId]);

  // AI 먼저 인사
  useEffect(() => {
    let cancelled = false;
    const doGreet = async () => {
      setIsAiSpeaking(true);
      setIsTyping(true);
      const delay = calcDelay('안녕', persona.mbti);
      await sleep(delay);
      if (cancelled) return;
      try {
        const data = await greetUser(sessionId, nickname);
        if (cancelled) return;
        const bubbles = splitIntoBubbles(data.message);
        for (let i = 0; i < bubbles.length; i++) {
          if (i > 0) {
            setIsTyping(true);
            await sleep(calcBubbleGap(bubbles[i]));
          }
          if (cancelled) return;
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: bubbles[i],
            timestamp: getTimeString(),
          }]);
        }
      } catch {
        if (!cancelled) setIsTyping(false);
      } finally {
        if (!cancelled) setIsAiSpeaking(false);
      }
    };
    doGreet();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isAiSpeaking) return;
    const userMsg = input.trim();
    setInput('');
    setIsAiSpeaking(true);

    // 1. 유저 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: getTimeString() }]);

    // 2. 타이핑 인디케이터 + 딜레이
    setIsTyping(true);

    try {
      const data = await sendMessage(sessionId, userMsg, nickname);
      const bubbles = splitIntoBubbles(data.message);

      const mainDelay = calcDelay(data.message, persona.mbti);
      await sleep(mainDelay);

      // 3. 버블 순차 표시
      for (let i = 0; i < bubbles.length; i++) {
        if (i > 0) {
          setIsTyping(true);
          await sleep(calcBubbleGap(bubbles[i]));
        }
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: bubbles[i],
          timestamp: getTimeString(),
        }]);
      }
    } catch (e: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `[오류] ${e?.message || '응답 실패'}`,
        timestamp: getTimeString(),
      }]);
    } finally {
      setIsAiSpeaking(false);
    }

    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isAiSpeaking, sessionId, persona.mbti, nickname]);

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
        <button style={styles.memoryBtn} onClick={() => setShowMemory(v => !v)} title="기억한 것들">🧠</button>
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
        <div style={styles.dateLabel}>데칼코마니 AI</div>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '4px',
              alignItems: 'flex-end',
              gap: '4px',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={styles.assistantAvatar}>{persona.name.charAt(0)}</div>
            )}

            {/* 유저 메시지: 시간만 왼쪽에 */}
            {msg.role === 'user' && (
              <span style={styles.timestamp}>{msg.timestamp}</span>
            )}

            <div style={msg.role === 'user' ? styles.userBubble : styles.assistantBubble}>
              {msg.content}
            </div>

            {/* 상대 메시지: 시간 오른쪽에 */}
            {msg.role === 'assistant' && (
              <span style={styles.timestamp}>{msg.timestamp}</span>
            )}
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
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
          ref={inputRef}
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력"
          disabled={isAiSpeaking}
        />
        <button
          style={{ ...styles.sendBtn, ...((!input.trim() || isAiSpeaking) ? styles.sendBtnDisabled : {}) }}
          onClick={handleSend}
          disabled={!input.trim() || isAiSpeaking}
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
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', width: '36px' },
  memoryBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', width: '36px' },
  memoryPanel: {
    background: '#1e2530', padding: '12px 16px',
    maxHeight: '200px', overflowY: 'auto' as const, flexShrink: 0,
  },
  memoryTitle: { color: '#FEE500', fontWeight: 'bold', fontSize: '13px', margin: '0 0 8px' },
  memoryItem: { color: '#ccc', fontSize: '12px', margin: '2px 0', lineHeight: '1.5' },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerAvatar: {
    width: '36px', height: '36px', borderRadius: '50%', background: '#FEE500',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '16px',
  },
  headerName: { color: '#fff', fontWeight: '600', fontSize: '16px' },
  messageList: {
    flex: 1, overflowY: 'auto', padding: '16px 12px',
    display: 'flex', flexDirection: 'column',
  },
  dateLabel: {
    textAlign: 'center', fontSize: '12px', color: '#555',
    background: 'rgba(255,255,255,0.5)', borderRadius: '10px',
    padding: '4px 12px', margin: '0 auto 16px',
  },
  userBubble: {
    background: '#FEE500', borderRadius: '18px 18px 4px 18px',
    padding: '10px 14px', maxWidth: '70%', fontSize: '14px',
    lineHeight: '1.5', color: '#1a1a1a', wordBreak: 'break-word' as const,
  },
  assistantBubble: {
    background: '#fff', borderRadius: '18px 18px 18px 4px',
    padding: '10px 14px', maxWidth: '70%', fontSize: '14px',
    lineHeight: '1.5', color: '#1a1a1a', wordBreak: 'break-word' as const,
  },
  assistantAvatar: {
    width: '32px', height: '32px', borderRadius: '50%', background: '#FEE500',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
    alignSelf: 'flex-start', marginRight: '4px',
  },
  typingBubble: {
    background: '#fff', borderRadius: '18px 18px 18px 4px',
    padding: '14px 18px', display: 'flex', gap: '4px', alignItems: 'center',
  },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%', background: '#aaa',
    display: 'inline-block', animation: 'bounce 1.2s infinite',
  },
  timestamp: { fontSize: '10px', color: '#555', whiteSpace: 'nowrap' as const, marginBottom: '2px' },
  inputArea: {
    background: '#fff', padding: '10px 12px', display: 'flex',
    gap: '8px', flexShrink: 0, borderTop: '1px solid #e0e0e0',
  },
  input: {
    flex: 1, border: '1px solid #ddd', borderRadius: '20px',
    padding: '10px 16px', fontSize: '14px', outline: 'none',
  },
  sendBtn: {
    background: '#FEE500', border: 'none', borderRadius: '20px',
    padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '14px', color: '#1a1a1a',
  },
  sendBtnDisabled: { background: '#f0f0f0', color: '#aaa', cursor: 'not-allowed' },
};

export default ChatPage;
