import React, { useCallback, useState } from 'react';
import { uploadFile } from '../api';

interface Props {
  onUploaded: (sessionId: string, participants: string[]) => void;
}

const UploadPage: React.FC<Props> = ({ onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setError('카카오톡 내보내기 .txt 또는 .csv 파일만 지원합니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await uploadFile(file);
      onUploaded(data.sessionId, data.participants);
    } catch (e: any) {
      setError(e.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>💬</div>
        <h1 style={styles.title}>데칼코마니</h1>
        <p style={styles.subtitle}>카톡 대화로 그 사람을 다시 만나보세요</p>

        <div
          style={{ ...styles.dropzone, ...(dragging ? styles.dropzoneActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          {loading ? (
            <p style={styles.dropText}>분석 중...</p>
          ) : (
            <>
              <p style={styles.dropIcon}>📂</p>
              <p style={styles.dropText}>카카오톡 내보내기 파일을 끌어다 놓거나<br />클릭해서 선택하세요</p>
              <p style={styles.dropHint}>.txt / .csv 파일 지원</p>
            </>
          )}
        </div>

        <input
          id="fileInput"
          type="file"
          accept=".txt,.csv"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.notice}>
          🔒 대화 내용은 서버에 저장되지 않습니다.<br />
          AI 학습에도 사용되지 않습니다.
        </div>

        <div style={styles.guide}>
          <strong>내보내기 방법</strong><br />
          카카오톡 채팅방 → 우상단 메뉴 → 대화 내용 내보내기 → .txt 선택
        </div>
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
  logo: { fontSize: '48px', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', color: '#1a1a1a' },
  subtitle: { color: '#666', marginBottom: '28px', fontSize: '14px' },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '12px',
    padding: '30px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  dropzoneActive: { border: '2px dashed #FEE500', background: '#FFFDE7' },
  dropIcon: { fontSize: '32px', margin: '0 0 8px' },
  dropText: { color: '#444', fontSize: '14px', lineHeight: '1.6', margin: '0 0 4px' },
  dropHint: { color: '#aaa', fontSize: '12px', margin: 0 },
  error: { color: '#e53935', fontSize: '13px', margin: '8px 0' },
  notice: {
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.6',
    marginTop: '16px',
  },
  guide: {
    background: '#FFFDE7',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
    color: '#555',
    lineHeight: '1.6',
    marginTop: '12px',
    textAlign: 'left',
  },
};

export default UploadPage;
