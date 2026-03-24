const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const analyzePersona = async (sessionId: string, targetName: string) => {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, targetName }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const sendMessage = async (sessionId: string, message: string) => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const greetUser = async (sessionId: string) => {
  const res = await fetch(`${BASE_URL}/api/greet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) return { message: '...' };
  return res.json();
};

export const deleteSession = async (sessionId: string) => {
  await fetch(`${BASE_URL}/api/session/${sessionId}`, { method: 'DELETE' });
};
