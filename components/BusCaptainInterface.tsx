
import React, { useState, useEffect } from 'react';
import { Bus, Berth } from '../types';
import { Smartphone, Clock, MapPin, Navigation2, AlertTriangle, BellRing, CheckCircle, Bus as BusIcon } from 'lucide-react';

interface BCProps {
  bus: Bus;
  berths: Berth[];
  onStatusUpdate: (busId: string, status: Bus['status'], berthId?: string) => void;
  externalTriggerTapIn?: number; // Counter to trigger effect
}

const BusCaptainInterface: React.FC<BCProps> = ({ bus, berths, onStatusUpdate, externalTriggerTapIn = 0 }) => {
  const [showNfcPrompt, setShowNfcPrompt] = useState(false);
  const [showPunctualityPrompt, setShowPunctualityPrompt] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);
  const [selectedBerth, setSelectedBerth] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Trigger modal when externalTriggerTapIn changes
  useEffect(() => {
    if (externalTriggerTapIn > 0 && bus.status === 'EN_ROUTE') {
      setShowNfcPrompt(true);
    }
  }, [externalTriggerTapIn, bus.status]);

  useEffect(() => {
    if (bus.scheduledDeparture) {
      const interval = setInterval(() => {
        const diff = new Date(bus.scheduledDeparture!).getTime() - Date.now();
        const seconds = Math.max(0, Math.floor(diff / 1000));
        setTimeLeft(seconds);

        // Punctuality Prompt at 5 minutes (300 seconds)
        if (seconds <= 300 && seconds > 290 && !hasVibrated) {
          setShowPunctualityPrompt(true);
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          setHasVibrated(true);
        }
        
        // Reset vibration flag if time is extended or bus resets
        if (seconds > 300) {
          setHasVibrated(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
      setHasVibrated(false);
    }
  }, [bus.scheduledDeparture, hasVibrated]);

  const handleTapIn = () => {
    if (selectedBerth) {
      onStatusUpdate(bus.id, 'IN_PORT', selectedBerth);
      setShowNfcPrompt(false);
      setHasVibrated(false);
      
      // Trigger success state
      setShowSuccessState(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
      // Auto-dismiss success after 2.5 seconds
      setTimeout(() => {
        setShowSuccessState(false);
      }, 2500);
    }
  };

  const handleTapOut = () => {
    onStatusUpdate(bus.id, 'EN_ROUTE', undefined);
    setShowPunctualityPrompt(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-6 min-h-screen pb-20 relative">
      <header className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold opacity-80 tracking-widest uppercase">Service {bus.serviceNo}</span>
          <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
            {bus.status.replace('_', ' ')}
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">{bus.plateNo}</h1>
        <div className="flex items-center gap-2 mt-4 opacity-70">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest">Captain ID: {bus.captainId}</p>
        </div>
      </header>

      {bus.status === 'EN_ROUTE' && (
        <button
          onClick={() => setShowNfcPrompt(true)}
          className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 transition-all hover:border-blue-500 hover:bg-blue-50/30 active:scale-95 shadow-sm group"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Smartphone size={40} />
          </div>
          <div className="text-center">
            <h3 className="font-black text-xl text-gray-900">Tap-In at Berth</h3>
            <p className="text-gray-500 text-sm mt-1 font-medium">Hold device near NFC tag on arrival</p>
          </div>
        </button>
      )}

      {(bus.status === 'IN_PORT' || bus.status === 'LAYOVER') && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              <MapPin size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Current Berth</p>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{bus.berthId || 'Not Set'}</h3>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${timeLeft !== null && timeLeft < 300 ? 'bg-orange-100 text-orange-600 status-pulse' : 'bg-blue-50 text-blue-600'}`}>
              <Clock size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Departure Countdown</p>
              <h3 className={`text-4xl font-mono font-black tracking-tighter ${timeLeft !== null && timeLeft < 300 ? 'text-orange-600' : 'text-gray-900'}`}>
                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleTapOut}
            className="w-full bg-red-600 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            <Navigation2 size={24} />
            TAP-OUT TO DEPART
          </button>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessState && (
        <div className="fixed inset-0 bg-green-600/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-full p-8 mb-8 shadow-2xl scale-110 animate-bounce">
            <CheckCircle size={96} className="text-green-600" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">Arrival Verified</h2>
          <div className="space-y-1">
            <p className="text-green-50 font-black uppercase tracking-[0.2em] text-sm">Assigned Berth: {selectedBerth}</p>
            <p className="text-green-100/70 font-bold uppercase tracking-widest text-[10px]">Service {bus.serviceNo} • System Synced</p>
          </div>
          <div className="mt-12 flex gap-3">
             <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
             <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
             <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-150" />
          </div>
        </div>
      )}

      {/* NFC / Berth Selection Modal */}
      {showNfcPrompt && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select Berth</h2>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Smartphone size={20} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {berths.map(berth => (
                <button
                  key={berth.id}
                  onClick={() => setSelectedBerth(berth.id)}
                  disabled={berth.isOccupied}
                  className={`py-4 rounded-2xl font-black transition-all text-sm ${
                    selectedBerth === berth.id
                      ? 'bg-blue-600 text-white shadow-xl scale-105 ring-4 ring-blue-100'
                      : berth.isOccupied
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95'
                  }`}
                >
                  {berth.id}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <button
                disabled={!selectedBerth}
                onClick={handleTapIn}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl disabled:opacity-50 disabled:grayscale shadow-lg active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                Confirm Arrival
              </button>
              <button onClick={() => setShowNfcPrompt(false)} className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]">Cancel Tap-In</button>
            </div>
          </div>
        </div>
      )}

      {/* Punctuality Prompt Modal */}
      {showPunctualityPrompt && (
        <div className="fixed inset-0 bg-orange-600/90 backdrop-blur-lg z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-bounce">
              <BellRing size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">5-Minute Warning</h2>
              <p className="text-gray-500 mt-2 font-medium leading-relaxed">
                Scheduled departure is in exactly 5 minutes. Please ensure all boarding is complete and prepare for departure.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-center gap-3 border border-orange-100">
              <AlertTriangle className="text-orange-600" size={20} />
              <span className="text-orange-700 font-black text-sm uppercase tracking-wider">Haptic Nudge Triggered</span>
            </div>
            <button
              onClick={() => setShowPunctualityPrompt(false)}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCaptainInterface;
