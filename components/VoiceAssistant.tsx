
import React, { useState, useRef, useEffect } from 'react';
import { GeminiLiveSession } from '../services/geminiLiveService';
import { Mic, MicOff, Waves, X, MessageSquare } from 'lucide-react';

interface VoiceAssistantProps {
  onInitiateTapIn?: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onInitiateTapIn }) => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{ text: string; type: 'input' | 'output' }[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.stop();
      setIsActive(false);
      setMessages([]);
    } else {
      setIsMinimized(false);
      sessionRef.current = new GeminiLiveSession();
      await sessionRef.current.start({
        onMessage: (text, type) => {
          setMessages(prev => [...prev.slice(-10), { text, type }]);
        },
        onInitiateTapIn: () => {
          if (onInitiateTapIn) onInitiateTapIn();
        },
        onClose: () => setIsActive(false),
        onError: () => setIsActive(false)
      });
      setIsActive(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {!isMinimized && (
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
          <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="font-bold text-sm tracking-tight">PBMS Voice Assistant</span>
            </div>
            <button onClick={() => setIsMinimized(true)} className="hover:bg-gray-800 p-1 rounded-lg">
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <MessageSquare size={32} />
                </div>
                <p className="text-gray-500 text-sm">
                  {isActive ? "Listening for instructions..." : "Start a session to talk with the Hub Assistant"}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'input' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                  m.type === 'input' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-50 flex flex-col items-center gap-2">
            {isActive && (
              <div className="flex gap-1 mb-2">
                <div className="w-1 h-4 bg-blue-500 animate-pulse rounded-full" />
                <div className="w-1 h-6 bg-blue-600 animate-pulse delay-75 rounded-full" />
                <div className="w-1 h-4 bg-blue-500 animate-pulse delay-150 rounded-full" />
              </div>
            )}
            <button
              onClick={toggleSession}
              className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
            >
              {isActive ? <MicOff size={20} /> : <Mic size={20} />}
              {isActive ? 'End Session' : 'Start Talking'}
            </button>
          </div>
        </div>
      )}

      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Waves className={isActive ? 'animate-spin' : ''} />
          <span className="font-bold pr-2">Assistant</span>
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;
