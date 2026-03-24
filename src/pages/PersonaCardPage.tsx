import React from 'react';
import { Persona } from '../types';

interface Props {
  persona: Persona;
  onStart: () => void;
  onBack: () => void;
}

const MBTI_DESC: Record<string, string> = {
  ENFP: '열정적이고 창의적인 활동가', ENFJ: '따뜻한 리더형',
  ENTP: '논쟁을 즐기는 발명가', ENTJ: '과감한 지휘관',
  INFP: '이상적인 중재자', INFJ: '통찰력 있는 조언가',
  INTP: '논리적인 사색가', INTJ: '전략적인 계획가',
  ESFP: '자유로운 연예인형', ESFJ: '배려하는 사교가',
  ESTP: '순발력 있는 사업가', ESTJ: '엄격한 관리자',
  ISFP: '호기심 많은 예술가', ISFJ: '세심한 수호자',
  ISTP: '만능 재주꾼', ISTJ: '청렴한 책임자',
};

const PersonaCardPage: React.FC<Props> = ({ persona, onStart, onBack }) => {
  const mbtiDesc = persona.mbti ? MBTI_DESC[persona.mbti] || '' : '';
  const topPhrases = (persona.commonPhrases || []).slice(0, 5);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 뒤로가기 */}
        <button style={styles.backBtn} onClick={onBack}>{'< 다시 선택'}</button>

        {/* 프로필 */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>{persona.name.charAt(0)}</div>
          {persona.mbti && <span style={styles.mbtiBadge}>{persona.mbti}</span>}
        </div>
        <h2 style={styles.name}>{persona.name}</h2>
        {mbtiDesc && <p style={styles.mbtiDesc}>{mbtiDesc}</p>}

        <div style={styles.divider} />

        {/* 말투 특성 */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>💬 말투</p>
          <div style={styles.tagRow}>
            <span style={styles.tag}>{persona.speechStyle}</span>
            <span style={styles.tag}>{persona.avgMessageLength?.split(' ')[0]}</span>
            {persona.burstPattern && !persona.burstPattern.includes('1개씩') && (
              <span style={styles.tag}>연속발송</span>
            )}
            {persona.endingPatterns && persona.endingPatterns !== '특별한 패턴 없음' &&
              persona.endingPatterns.split(', ').slice(0, 2).map((p, i) => (
                <span key={i} style={styles.tag}>{p}</span>
              ))}
          </div>
        </div>

        {/* 종결어미 & 타이핑 습관 */}
        {((persona.endingStyle && persona.endingStyle !== '특정 종결어미 패턴 없음') ||
          (persona.typingHabits && persona.typingHabits !== '특별한 습관 없음')) && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>⌨️ 타이핑 패턴</p>
            <div style={styles.tagRow}>
              {persona.endingStyle && persona.endingStyle !== '특정 종결어미 패턴 없음' &&
                persona.endingStyle.split(', ').slice(0, 3).map((e, i) => (
                  <span key={i} style={styles.tag}>{e}</span>
                ))}
              {persona.typingHabits && persona.typingHabits !== '특별한 습관 없음' &&
                persona.typingHabits.split(', ').slice(0, 2).map((h, i) => (
                  <span key={`h${i}`} style={styles.habitTag}>{h}</span>
                ))}
            </div>
          </div>
        )}

        {/* 관심사 주제 */}
        {persona.topics && persona.topics.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>🎯 자주 얘기하는 것</p>
            <div style={styles.tagRow}>
              {persona.topics.map((t, i) => (
                <span key={i} style={styles.topicTag}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* 자주 쓰는 표현 */}
        {topPhrases.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>🗣️ 자주 쓰는 말</p>
            <div style={styles.tagRow}>
              {topPhrases.map((phrase, i) => (
                <span key={i} style={styles.phraseTag}>"{phrase}"</span>
              ))}
            </div>
          </div>
        )}

        {/* 기억 */}
        {persona.memories && persona.memories.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>🧠 AI가 기억한 것</p>
            {persona.memories.slice(0, 3).map((m, i) => (
              <p key={i} style={styles.memoryItem}>• {m}</p>
            ))}
            {persona.memories.length > 3 && (
              <p style={styles.memoryMore}>+{persona.memories.length - 3}개 더</p>
            )}
          </div>
        )}

        <div style={styles.divider} />

        {/* 시작 버튼 */}
        <button style={styles.startBtn} onClick={onStart}>
          💬 {persona.name}와(과) 대화 시작
        </button>
        <p style={styles.notice}>채팅방에 들어가면 {persona.name}이(가) 먼저 말을 걸어요</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#B2C8D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '28px 24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '16px',
  },
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#FEE500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  mbtiBadge: {
    background: '#2E3542',
    color: '#FEE500',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '1px',
  },
  name: {
    textAlign: 'center' as const,
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '4px 0',
    color: '#1a1a1a',
  },
  mbtiDesc: {
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#888',
    margin: '0 0 4px',
  },
  divider: {
    height: '1px',
    background: '#f0f0f0',
    margin: '16px 0',
  },
  section: {
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#555',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  tag: {
    background: '#f5f5f5',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#444',
  },
  phraseTag: {
    background: '#FFFDE7',
    border: '1px solid #FEE500',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#555',
  },
  topicTag: {
    background: '#E8F4FD',
    border: '1px solid #90CAF9',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#1565C0',
  },
  habitTag: {
    background: '#F3E5F5',
    border: '1px solid #CE93D8',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    color: '#6A1B9A',
  },
  memoryItem: {
    fontSize: '13px',
    color: '#555',
    margin: '3px 0',
    lineHeight: '1.5',
  },
  memoryMore: {
    fontSize: '12px',
    color: '#aaa',
    margin: '4px 0 0',
  },
  startBtn: {
    width: '100%',
    background: '#FEE500',
    border: 'none',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#1a1a1a',
    marginBottom: '10px',
  },
  notice: {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#aaa',
    margin: 0,
  },
};

export default PersonaCardPage;
