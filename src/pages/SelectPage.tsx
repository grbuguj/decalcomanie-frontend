import React, { useState } from 'react';
import { analyzePersona } from '../api';
import { Persona } from '../types';

interface Props {
  sessionId: string;
  participants: string[];
  onSelected: (persona: Persona) => void;
}

const SelectPage: React.FC<Props> = ({ sessionId, participants, onSelected }) => {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const handleSelect = async (name: string) => {
    setLoading(name);
    setError('');
    try {
      const data = await analyzePersona(sessionId, name);
      onSelected(data.persona);
    } catch (e: any) {
      setError(e.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>누구와 대화할까요?</h2>
        <p style={styles.subtitle}>클론할 상대방을 선택하세요</p>

        <div style={styles.list}>
          {participants.map((name) => (
            <button
              key={name}
              style={{
                ...styles.item,
                ...(loading === name ? styles.itemLoading : {}),
              }}
              onClick={() => handleSelect(name)}
              disabled={!!loading}
            >
              <span style={styles.avatar}>
                {name.charAt(0)}
              </span>
              <span style={styles.name}>{name}</span>
              {loading === name && <span style={styles.analyzing}>분석 중...</span>}
            </button>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.notice}>선택한 상대방의 말투를 AI가 학습합니다</p>
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
    padding: '40px 30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },
  title: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #eee',
    background: '#fafafa',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontSize: '15px',
  },
  itemLoading: { background: '#FFFDE7', borderColor: '#FEE500' },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#FEE500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  name: { flex: 1, fontWeight: '500', color: '#1a1a1a' },
  analyzing: { color: '#888', fontSize: '12px' },
  error: { color: '#e53935', fontSize: '13px', marginTop: '12px' },
  notice: { color: '#aaa', fontSize: '12px', marginTop: '20px' },
};

export default SelectPage;
