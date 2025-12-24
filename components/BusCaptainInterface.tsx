
import React, { useState, useEffect } from 'react';
import { Bus, Berth } from '../types';
import { Smartphone, Clock, MapPin, Navigation2, AlertTriangle, BellRing, CheckCircle, Bus as BusIcon, ListChecks, Loader2, Zap, ShieldCheck, Radio } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);
  const [selectedBerth, setSelectedBerth] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Trigger modal when externalTriggerTapIn changes (from Gemini Voice Assistant)
  useEffect(() => {
    if (externalTriggerTapIn > 0 && bus.status === 'EN_ROUTE') {
      setShowNfcPrompt(true);
    }
  }, [externalTriggerTapIn, bus.status]);

  // Haptic Feedback for Punctuality Prompt
  useEffect(() => {
    if (showPunctualityPrompt && 'vibrate' in navigator) {
      // Urgent triple-pulse pattern for departure awareness
      navigator.vibrate([400, 100, 400, 100, 400]);
    }
  }, [showPunctualityPrompt]);

  useEffect(() => {
    if (bus.scheduledDeparture && bus.status === 'IN_PORT') {
      const interval = setInterval(() => {
        const diff = new Date(bus.scheduledDeparture!).getTime() - Date.now();
        const seconds = Math.max(0, Math.floor(diff / 1000));
        setTimeLeft(seconds);

        // Punctuality Prompt at 5 minutes (300 seconds)
        if (seconds <= 300 && seconds > 0 && !hasVibrated) {
          setShowPunctualityPrompt(true);
          setHasVibrated(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
      if (bus.status !== 'IN_PORT') {
        setHasVibrated(false);
        setShowPunctualityPrompt(false);
      }
    }
  }, [bus.scheduledDeparture, bus.status, hasVibrated]);

  const handleTapIn = () => {
    if (selectedBerth) {
      setIsProcessing(true);
      
      // Artificial delay to simulate precision backend sync
      setTimeout(() => {
        onStatusUpdate(bus.id, 'IN_PORT', selectedBerth);
        setIsProcessing(false);
        setShowNfcPrompt(false);
        setHasVibrated(false);
        
        setShowSuccessState(true);
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        
        // Extended auto-dismiss for visibility, but manual dismissal is possible
        const timer = setTimeout(() => {
          setShowSuccessState(false);
        }, 4000);
        return () => clearTimeout(timer);
      }, 1200);
    }
  };

  const handleTapOut = () => {
    onStatusUpdate(bus.id, 'EN_ROUTE', undefined);
    setShowPunctualityPrompt(false);
    setHasVibrated(false);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
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
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform relative">
             <Smartphone size={40} />
             <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white animate-pulse">
                <Radio size={12} />
             </div>
          </div>
          <div className="text-center">
            <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Tap-In at Berth</h3>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">Detection active. Tap NFC tag.</p>
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${timeLeft !== null && timeLeft < 300 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                <Clock size={20} />
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Departure Countdown</p>
            </div>
            
            <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all ${
              timeLeft !== null && timeLeft < 300 
                ? 'bg-orange-50 border-orange-200 shadow-[0_15px_40px_rgba(249,115,22,0.15)]' 
                : 'bg-gray-50 border-transparent'
            }`}>
              <h3 className={`text-8xl font-mono font-black tracking-tighter tabular-nums ${
                timeLeft !== null && timeLeft < 300 ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
              </h3>
              <div className={`flex gap-16 mt-2 font-black uppercase tracking-[0.3em] text-[10px] ${
                timeLeft !== null && timeLeft < 300 ? 'text-orange-400/70' : 'text-gray-300'
              }`}>
                <span>Mins</span>
                <span>Secs</span>
              </div>
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

      {/* Processing Animation Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[210] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
              <Loader2 size={48} className="text-blue-600 animate-spin" />
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Syncing Hub Data</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Verifying Berth {selectedBerth}</p>
              </div>
           </div>
        </div>
      )}

      {/* Enhanced Success Confirmation Step */}
      {showSuccessState && (
        <div className="fixed inset-0 bg-green-600 z-[220] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="relative mb-8">
            <div className="bg-white rounded-full p-10 shadow-2xl scale-110 animate-bounce">
              <CheckCircle size={96} className="text-green-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white text-green-600 p-2 rounded-full border-4 border-green-600 animate-pulse">
              <ShieldCheck size={32} fill="currentColor" className="text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white tracking-tight mb-2">ARRIVAL LOGGED</h2>
          <p className="text-green-100 font-bold uppercase tracking-widest text-sm opacity-80 mb-8">Hub Systems Updated Successfully</p>
          
          <div className="w-full max-w-xs space-y-2 bg-black/10 px-8 py-6 rounded-[2rem] backdrop-blur-md border border-white/10">
            <div className="flex justify-between items-center text-green-50">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Assigned Berth</span>
              <span className="text-2xl font-black">BERTH {selectedBerth}</span>
            </div>
            <div className="h-px bg-white/10 w-full my-2"></div>
            <div className="flex justify-between items-center text-green-50">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Service ID</span>
              <span className="text-sm font-black">{bus.serviceNo}</span>
            </div>
          </div>

          <div className="mt-12 w-full max-w-xs space-y-4">
            <button 
              onClick={() => setShowSuccessState(false)}
              className="w-full bg-white text-green-600 font-black py-5 rounded-2xl shadow-xl hover:bg-green-50 active:scale-95 transition-all uppercase tracking-[0.15em] text-sm"
            >
              Continue to Terminal View
            </button>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-[shrink_4s_linear]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* NFC / Berth Selection Modal */}
      {showNfcPrompt && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-slide-up shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Berth Arrival</h2>
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Smartphone size={24} />
              </div>
            </div>

            {/* Prominent NFC Instruction */}
            <div className="bg-blue-600 text-white rounded-[2rem] p-6 mb-8 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Radio size={80} strokeWidth={1} />
               </div>
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md relative">
                    <Smartphone size={32} className="animate-pulse" />
                    <div className="absolute inset-0 bg-white rounded-full scale-150 opacity-10 animate-ping" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight leading-tight">Ready to Scan</h4>
                    <p className="text-blue-100 text-xs font-medium mt-1">Hold device near the <span className="font-black text-white">NFC tag</span> at your berth.</p>
                  </div>
               </div>
            </div>

            <div className="mb-4 flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Berth Below</span>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse delay-150" />
               </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-8">
              {berths.map(berth => (
                <button
                  key={berth.id}
                  onClick={() => setSelectedBerth(berth.id)}
                  disabled={berth.isOccupied}
                  className={`py-4 rounded-xl font-black transition-all duration-300 text-sm ${
                    selectedBerth === berth.id
                      ? 'bg-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-100 z-10'
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
                disabled={!selectedBerth || isProcessing}
                onClick={handleTapIn}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl disabled:opacity-50 disabled:grayscale shadow-lg active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Complete Arrival'}
              </button>
              <button 
                onClick={() => {
                  setShowNfcPrompt(false);
                  setSelectedBerth('');
                }} 
                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]"
              >
                Cancel Tap-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Punctuality Prompt Modal */}
      {showPunctualityPrompt && (
        <div className="fixed inset-0 bg-orange-600/90 backdrop-blur-lg z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-bounce relative">
              <BellRing size={40} strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white animate-pulse">
                <Zap size={10} fill="currentColor" />
              </div>
            </div>
            <div>
              <div className="flex flex-col items-center gap-1 mb-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">5-Min Warning</h2>
                <span className="flex items-center gap-1.5 text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  <Zap size={10} /> Haptic Alert Active
                </span>
              </div>
              <div className="mt-2 inline-block px-6 py-2 bg-orange-50 text-orange-700 font-black rounded-2xl text-3xl font-mono border-2 border-orange-200 shadow-inner">
                {timeLeft !== null ? formatTime(timeLeft) : '05:00'}
              </div>
              <p className="text-gray-500 mt-4 font-medium leading-tight text-sm">
                Service {bus.serviceNo} is scheduled for immediate departure.
              </p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-2xl text-left space-y-3 border border-gray-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                <ListChecks size={14} /> Readiness Checklist
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-orange-400 bg-orange-50" />
                <span className="text-xs font-bold text-gray-700">All boarding complete</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-orange-400 bg-orange-50" />
                <span className="text-xs font-bold text-gray-700">Engine systems checked</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPunctualityPrompt(false);
                if ('vibrate' in navigator) navigator.vibrate(50);
              }}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCaptainInterface;
