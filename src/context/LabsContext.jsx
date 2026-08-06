import React, { useState, useContext } from 'react';
import { askAi } from '../services/labsService.js';
import { useAuth } from './AuthContext.jsx';

const LabsCtx = React.createContext(null);

export function useLabs() {
  return useContext(LabsCtx);
}

export function LabsProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendQuestion(question) {
    if (!question.trim()) return;
    const userMessage = { id: Date.now(), me: true, text: question };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const response = await askAi(question, { userId: user?.id });
      const aiMessage = { id: Date.now() + 1, me: false, text: response.answer || response.text || 'I could not process that. Please try again.' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Labs AI error', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, me: false, text: 'There was an error contacting the AI service. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LabsCtx.Provider value={{ messages, loading, sendQuestion }}>
      {children}
    </LabsCtx.Provider>
  );
}
