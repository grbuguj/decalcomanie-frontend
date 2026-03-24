import React, { useState } from 'react';
import { Persona, Step } from './types';
import UploadPage from './pages/UploadPage';
import SelectPage from './pages/SelectPage';
import PersonaCardPage from './pages/PersonaCardPage';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [sessionId, setSessionId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [nickname, setNickname] = useState('');

  const handleUploaded = (sid: string, parts: string[]) => {
    setSessionId(sid);
    setParticipants(parts);
    setStep('select');
  };

  const handleSelected = (p: Persona) => {
    setPersona(p);
    setStep('persona');
  };

  const handleStartChat = (nick: string) => {
    setNickname(nick);
    setStep('chat');
  };

  const handleBackToSelect = () => {
    setStep('select');
  };

  const handleReset = () => {
    setStep('upload');
    setSessionId('');
    setParticipants([]);
    setPersona(null);
  };

  if (step === 'upload') return <UploadPage onUploaded={handleUploaded} />;
  if (step === 'select') return <SelectPage sessionId={sessionId} participants={participants} onSelected={handleSelected} />;
  if (step === 'persona' && persona) return <PersonaCardPage persona={persona} onStart={handleStartChat} onBack={handleBackToSelect} />;
  if (step === 'chat' && persona) return <ChatPage sessionId={sessionId} persona={persona} nickname={nickname} onReset={handleReset} />;

  return null;
};

export default App;
