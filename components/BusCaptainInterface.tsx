
import React, { useState, useEffect } from 'react';
import { Bus, Berth } from '../types';
import { Smartphone, Clock, MapPin, Navigation2, AlertTriangle, BellRing, CheckCircle, Bus as BusIcon, Zap, Battery, BatteryCharging } from 'lucide-react';

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

  const handleAutoAssign = () => {
    // Smart berth assignment logic:
    // 1. Prefer berths with chargers if battery < 50%
    // 2. Then BOARDING berths (most common use case)
    // 3. Then LAYOVER berths 
    // 4. Finally ALIGHTING berths
    const needsCharging = bus.batteryLevel && bus.batteryLevel < 50;
    
    let availableBerth: Berth | undefined;
    
    // Priority 1: If low battery, find berth with charger
    if (needsCharging) {
      availableBerth = berths.find(b => !b.isOccupied && b.hasCharger);
    }
    
    // Priority 2: Find by berth type priority
    if (!availableBerth) {
      const priorityOrder: Berth['type'][] = ['BOARDING', 'LAYOVER', 'ALIGHTING'];
      for (const type of priorityOrder) {
        availableBerth = berths.find(b => !b.isOccupied && b.type === type);
        if (availableBerth) break;
      }
    }
    
    // Fallback: any available berth
    if (!availableBerth) {
      availableBerth = berths.find(b => !b.isOccupied);
    }
    
    if (availableBerth) {
      // Pre-select the berth and show NFC prompt
      setSelectedBerth(availableBerth.id);
      setShowNfcPrompt(true);
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
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 opacity-70">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest">Captain ID: {bus.captainId}</p>
          </div>
          
          {/* Battery Indicator */}
          {bus.batteryLevel !== undefined && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {bus.isCharging ? (
                <BatteryCharging size={16} className="status-pulse" />
              ) : (
                <Battery size={16} />
              )}
              <span className="text-sm font-black">{bus.batteryLevel}%</span>
            </div>
          )}
        </div>
      </header>

      {bus.status === 'EN_ROUTE' && (
        <>
          {/* Auto-Assign Button */}
          <button
            onClick={handleAutoAssign}
            disabled={berths.filter(b => !b.isOccupied).length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-6 flex items-center justify-between gap-4 transition-all hover:from-green-600 hover:to-emerald-600 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-lg leading-tight">Get Assigned Berth</h3>
                <p className="text-green-50 text-xs mt-1 font-medium">
                  {berths.filter(b => !b.isOccupied).length > 0 
                    ? 'System assigns → Walk to berth → Tap NFC' 
                    : 'No berths available'}
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-black backdrop-blur-sm">
              {berths.filter(b => !b.isOccupied).length} OPEN
            </div>
          </button>
          
          {/* Smart Assignment Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Zap size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-blue-900 text-base mb-1">Smart Assignment System</h4>
                <p className="text-blue-700 text-xs font-medium leading-relaxed">
                  Our AI automatically selects the optimal berth based on:
                </p>
              </div>
            </div>
            <div className="space-y-2 ml-13">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="font-bold text-blue-900">
                  Battery Level: {bus.batteryLevel && bus.batteryLevel < 50 ? '⚡ Low battery - assigns charging berth' : '✅ Good level'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="font-bold text-blue-900">Berth Type: Prioritizes BOARDING → LAYOVER → ALIGHTING</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="font-bold text-blue-900">Availability: Real-time occupancy check</span>
              </div>
            </div>
            
            {berths.filter(b => !b.isOccupied).length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex flex-wrap gap-2 text-xs">
                  {['BOARDING', 'ALIGHTING', 'LAYOVER'].map(type => {
                    const count = berths.filter(b => !b.isOccupied && b.type === type).length;
                    const chargingCount = berths.filter(b => !b.isOccupied && b.type === type && b.hasCharger).length;
                    const colors = {
                      'BOARDING': 'bg-blue-100 text-blue-700 border-blue-200',
                      'ALIGHTING': 'bg-orange-100 text-orange-700 border-orange-200',
                      'LAYOVER': 'bg-gray-100 text-gray-700 border-gray-200'
                    };
                    return count > 0 ? (
                      <span key={type} className={`px-2 py-1 rounded-md font-bold border ${colors[type as keyof typeof colors]} flex items-center gap-1`}>
                        {count} {type}
                        {chargingCount > 0 && (
                          <span title={`${chargingCount} with charger`}>
                            <Zap size={12} className="text-green-600" />
                          </span>
                        )}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </>
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
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">NFC Tap Verified!</h2>
          <div className="space-y-2 mb-4">
            <p className="text-green-50 font-black uppercase tracking-[0.2em] text-2xl">{selectedBerth}</p>
            <p className="text-green-100 font-bold text-sm">
              {berths.find(b => b.id === selectedBerth)?.hasCharger && '⚡ Now Charging'}
            </p>
            <p className="text-green-100/70 font-bold uppercase tracking-widest text-[10px]">
              Service {bus.serviceNo} • {bus.plateNo} • Check-In Complete
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
            <p className="text-white text-xs font-bold">
              ✅ Location Logged: {selectedBerth} • System Synced
            </p>
          </div>
          <div className="mt-12 flex gap-3">
             <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
             <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
             <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-150" />
          </div>
        </div>
      )}

      {/* NFC Tap Modal */}
      {showNfcPrompt && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <Smartphone size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Your Assigned Berth</h2>
              <p className="text-gray-500 font-medium text-sm">Walk to the berth and tap the NFC tag</p>
            </div>

            {/* Assigned Berth Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 mb-6 border-2 border-blue-200">
              <div className="text-center">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Proceed To</p>
                <div className="text-6xl font-black text-blue-600 mb-3">{selectedBerth}</div>
                {berths.find(b => b.id === selectedBerth)?.hasCharger && (
                  <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    <Zap size={16} />
                    Charging Available
                  </div>
                )}
              </div>
            </div>

            {/* Location Info */}
            {(() => {
              const berthNum = parseInt(selectedBerth.replace('B', ''));
              let level = 'Level 1', zone = 'Zone A';
              if (berthNum <= 4) { level = 'Level 1'; zone = 'Zone A'; }
              else if (berthNum <= 8) { level = 'Level 2'; zone = 'Zone B'; }
              else { level = 'Level 3'; zone = 'Zone C'; }
              
              return (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Level</p>
                    <p className="text-2xl font-black text-gray-900">{level.split(' ')[1]}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Zone</p>
                    <p className="text-2xl font-black text-gray-900">{zone.split(' ')[1]}</p>
                  </div>
                </div>
              );
            })()}

            {/* Instructions */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm mb-1">Tap NFC to Confirm</h4>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    Hold your device near the NFC tag at <span className="font-black">{selectedBerth}</span> to complete check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTapIn}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3"
              >
                <Smartphone size={20} />
                Simulate NFC Tap
              </button>
              <button 
                onClick={() => {
                  setShowNfcPrompt(false);
                  setSelectedBerth('');
                }} 
                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]"
              >
                Cancel & Choose Different Berth
              </button>
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
