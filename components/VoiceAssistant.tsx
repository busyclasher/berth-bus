
import React, { useState, useRef, useEffect } from 'react';
import { GeminiLiveSession } from '../services/geminiLiveService';
import { Mic, MicOff, Waves, X, MessageSquare, History as HistoryIcon, Trash2, ChevronLeft, Clock } from 'lucide-react';

interface Message {
  text: string;
  type: 'input' | 'output';
  timestamp: number;
}

interface VoiceAssistantProps {
  onInitiateTapIn?: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onInitiateTapIn }) => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pbms_voice_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever messages update
  useEffect(() => {
    localStorage.setItem('pbms_voice_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.stop();
      setIsActive(false);
    } else {
      setIsMinimized(false);
      setViewMode('chat');
      sessionRef.current = new GeminiLiveSession();
      await sessionRef.current.start({
        onMessage: (text, type) => {
          setMessages(prev => [
            ...prev, 
            { text, type, timestamp: Date.now() }
          ]);
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

  const clearHistory = () => {
    if (window.confirm("Clear all past interactions?")) {
      setMessages([]);
      localStorage.removeItem('pbms_voice_history');
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {!isMinimized && (
        <div className="bg-white w-80 h-[500px] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up ring-1 ring-black/5">
          <header className="bg-gray-900 text-white p-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              {viewMode === 'history' ? (
                <button 
                  onClick={() => setViewMode('chat')}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse ring-4 ring-green-500/20' : 'bg-gray-600'}`} />
              )}
              <span className="font-black text-xs uppercase tracking-[0.15em]">
                {viewMode === 'chat' ? 'Hub Assistant' : 'Interaction Log'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {viewMode === 'chat' && (
                <button 
                  onClick={() => setViewMode('history')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                  title="View History"
                >
                  <HistoryIcon size={18} />
                </button>
              )}
              {viewMode === 'history' && (
                <button 
                  onClick={clearHistory}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
                  title="Clear Log"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
            {viewMode === 'chat' ? (
              // LIVE CHAT VIEW (Show last few messages only for focus)
              <>
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                      <MessageSquare size={36} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">System Ready</h4>
                      <p className="text-gray-400 text-xs font-medium mt-1 leading-relaxed">
                        {isActive ? "Listening for instructions..." : "Start a voice session to coordinate hub activities"}
                      </p>
                    </div>
                  </div>
                )}
                {messages.slice(-8).map((m, i) => (
                  <div key={i} className={`flex ${m.type === 'input' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.25rem] text-[13px] font-semibold leading-relaxed shadow-sm ${
                      m.type === 'input' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // HISTORY VIEW (Full log with timestamps)
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <HistoryIcon size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Interaction History</p>
                  </div>
                ) : (
                  messages.reduce((acc: any[], m, i) => {
                    const date = formatDate(m.timestamp);
                    const prevDate = i > 0 ? formatDate(messages[i-1].timestamp) : null;
                    
                    if (date !== prevDate) {
                      acc.push(
                        <div key={`date-${date}`} className="flex items-center gap-4 my-4">
                          <div className="h-px bg-gray-200 flex-1" />
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{date}</span>
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>
                      );
                    }
                    
                    acc.push(
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${m.type === 'input' ? 'flex-row-reverse text-blue-500' : 'text-gray-400'}`}>
                          <Clock size={10} /> {formatTime(m.timestamp)}
                          <span className="opacity-50">•</span>
                          {m.type === 'input' ? 'Captain' : 'Assistant'}
                        </div>
                        <div className={`flex ${m.type === 'input' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] p-3 rounded-2xl text-xs font-medium border ${
                            m.type === 'input' 
                              ? 'bg-blue-50/50 border-blue-100 text-blue-900 rounded-br-none' 
                              : 'bg-white border-gray-100 text-gray-600 rounded-bl-none'
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      </div>
                    );
                    return acc;
                  }, [])
                )}
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-gray-50 flex flex-col items-center gap-4 shrink-0">
            {isActive && viewMode === 'chat' && (
              <div className="flex gap-1.5 mb-1 h-6 items-center">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-blue-600 rounded-full animate-pulse" 
                    style={{ 
                      height: `${12 + Math.random() * 12}px`, 
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }} 
                  />
                ))}
              </div>
            )}
            
            {viewMode === 'chat' ? (
              <button
                onClick={toggleSession}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                  isActive 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'
                }`}
              >
                {isActive ? <MicOff size={18} /> : <Mic size={18} />}
                {isActive ? 'End Session' : 'Start Talking'}
              </button>
            ) : (
              <button
                onClick={() => setViewMode('chat')}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-black"
              >
                <MessageSquare size={18} />
                Return to Live Chat
              </button>
            )}
          </div>
        </div>
      )}

      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4 group ring-1 ring-white/10"
        >
          <div className="relative">
            <Waves className={isActive ? 'animate-pulse text-blue-400' : 'text-gray-400 group-hover:text-white transition-colors'} />
            {isActive && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900 animate-ping" />
            )}
          </div>
          <span className="font-black text-xs uppercase tracking-[0.2em] pr-2">Ops Assistant</span>
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;
