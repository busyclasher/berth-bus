
import React, { useState } from 'react';
import { Bus, Berth, UserRole, PerformanceMetric } from './types';
import { INITIAL_BERTHS, INITIAL_BUSES, MOCK_PERFORMANCE } from './constants';
import BusCaptainInterface from './components/BusCaptainInterface';
import OperationsDashboard from './components/OperationsDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import { LayoutDashboard, Bus as BusIcon, User } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole['type']>('OPERATIONS_MANAGER');
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [berths, setBerths] = useState<Berth[]>(INITIAL_BERTHS);
  const [performance] = useState<PerformanceMetric[]>(MOCK_PERFORMANCE);
  
  // State to bridge voice command to BC interface modal
  const [tapInTrigger, setTapInTrigger] = useState(0);

  const handleStatusUpdate = (busId: string, status: Bus['status'], berthId?: string) => {
    setBuses(prevBuses => prevBuses.map(bus => {
      if (bus.id === busId) {
        // Clear old berth if moving
        const oldBerthId = bus.berthId;
        if (oldBerthId && oldBerthId !== berthId) {
          setBerths(prevBerths => prevBerths.map(b => 
            b.id === oldBerthId ? { ...b, isOccupied: false, busId: undefined } : b
          ));
        }

        // Set new berth
        if (berthId) {
          setBerths(prevBerths => prevBerths.map(b => 
            b.id === berthId ? { ...b, isOccupied: true, busId: busId } : b
          ));
        }

        return {
          ...bus,
          status,
          berthId,
          checkInTime: status === 'IN_PORT' ? new Date().toISOString() : bus.checkInTime,
          scheduledDeparture: status === 'IN_PORT' ? new Date(Date.now() + 15 * 60000).toISOString() : bus.scheduledDeparture
        };
      }
      return bus;
    }));
  };

  const onVoiceInitiateTapIn = () => {
    setRole('BUS_CAPTAIN');
    setTapInTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      {/* Navigation for role switching and Branding */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[90] md:top-0 md:bottom-auto md:border-b md:border-t-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-3 px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/SBS_Transit_Logo.svg/1200px-SBS_Transit_Logo.svg.png" 
              alt="SBS Transit" 
              className="h-6 md:h-8 object-contain"
            />
            <div className="hidden lg:block h-6 w-[1px] bg-gray-200 mx-2"></div>
            <div className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-widest">
              PBMS Hub Control
            </div>
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setRole('OPERATIONS_MANAGER')}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all ${role === 'OPERATIONS_MANAGER' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={18} className="md:size-[20px]" />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">Manager</span>
            </button>
            <button 
              onClick={() => setRole('BUS_CAPTAIN')}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all ${role === 'BUS_CAPTAIN' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BusIcon size={18} className="md:size-[20px]" />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">Captain</span>
            </button>
          </div>

          {/* User Profile - Hidden on mobile bottom nav */}
          <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-6">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-900 leading-none">Admin Terminal</div>
              <div className="text-[10px] text-gray-400 font-medium">Hub 004-ITH</div>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 ring-2 ring-gray-50">
              <User size={18} />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-4 md:pt-20">
        {role === 'BUS_CAPTAIN' ? (
          <BusCaptainInterface 
            bus={buses.find(b => b.captainId === 'BC01') || buses[0]} 
            berths={berths}
            onStatusUpdate={handleStatusUpdate}
            externalTriggerTapIn={tapInTrigger}
          />
        ) : (
          <OperationsDashboard 
            buses={buses}
            berths={berths}
            performance={performance}
          />
        )}
      </main>

      <VoiceAssistant onInitiateTapIn={onVoiceInitiateTapIn} />

      {/* Global Toast Simulation */}
      <div className="fixed top-24 right-6 pointer-events-none space-y-2 z-[100]">
        {buses.filter(b => b.status === 'IN_PORT').map(b => {
          const depTime = new Date(b.scheduledDeparture!).getTime();
          const isNear = depTime - Date.now() < 300000; // 5 mins
          return isNear && (
            <div key={b.id} className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
              <div className="bg-white/20 p-2 rounded-lg">
                <BusIcon size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">{b.plateNo} (S{b.serviceNo})</div>
                <div className="text-xs opacity-90">Departure due in 5 minutes</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
