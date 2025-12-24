
import React, { useState, useEffect, useRef } from 'react';
import { Bus, Berth, PerformanceMetric } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  LayoutGrid, 
  Activity, 
  History, 
  AlertCircle, 
  TrendingUp, 
  UserPlus, 
  UserMinus, 
  ParkingCircle, 
  Map as MapIcon, 
  Grid3X3,
  Navigation,
  Bus as BusIcon,
  Timer,
  ChevronRight,
  Info,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  buses: Bus[];
  berths: Berth[];
  performance: PerformanceMetric[];
}

const OperationsDashboard: React.FC<DashboardProps> = ({ buses, berths, performance }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [alertBerths, setAlertBerths] = useState<Set<string>>(new Set(['B2'])); // Initialize with B2 as an example mismatch
  const prevBerthsRef = useRef<Berth[]>(berths);
  
  const occupiedBerthsCount = berths.filter(b => b.isOccupied).length;
  const inPortBuses = buses.filter(b => b.status === 'IN_PORT');

  // Detect unexpected occupancy changes
  useEffect(() => {
    const prevBerths = prevBerthsRef.current;
    
    berths.forEach((currentBerth, index) => {
      const prevBerth = prevBerths[index];
      
      // If occupancy status changed, simulate a 20% chance of a "Sensor Mismatch" alert
      if (prevBerth && currentBerth.isOccupied !== prevBerth.isOccupied) {
        if (Math.random() < 0.2) {
          setAlertBerths(prev => new Set(prev).add(currentBerth.id));
        }
      }
    });
    
    prevBerthsRef.current = berths;
  }, [berths]);

  const resolveAlert = (id: string) => {
    setAlertBerths(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const getBerthIcon = (type: Berth['type']) => {
    switch (type) {
      case 'BOARDING': return <UserPlus size={14} className="text-blue-500" />;
      case 'ALIGHTING': return <UserMinus size={14} className="text-orange-500" />;
      case 'LAYOVER': return <ParkingCircle size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hub Operations Control</h1>
          <p className="text-gray-500 font-medium">Precision Berth Management • Changi Interchange Terminal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid3X3 size={14} /> GRID
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MapIcon size={14} /> DEPOT MAP
            </button>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-200">
            <Activity size={14} className="status-pulse" /> SYSTEM LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Berths" value={berths.length} icon={<LayoutGrid />} subValue={`${occupiedBerthsCount} Occupied`} />
        <StatCard title="Buses In-Port" value={inPortBuses.length} icon={<Activity />} subValue="Active boarding" color="text-blue-600" />
        <StatCard title="Avg. Turnaround" value={`${performance[performance.length-1].turnaroundMinutes}m`} icon={<History />} subValue="Last hour average" color="text-orange-600" />
        <StatCard title="Efficiency Score" value="94%" icon={<TrendingUp />} subValue="+2% from yesterday" color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                {viewMode === 'grid' ? 'Berth Matrix' : 'Spatial Depot Layout'}
                {alertBerths.size > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                    <ShieldAlert size={10} /> {alertBerths.size} MISMATCH
                  </span>
                )}
              </h3>
              <span className="text-xs font-normal text-gray-400 mt-1">Sector Alpha-01 • Real-time Monitoring</span>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Boarding</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Alighting</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400" /> Layover</span>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {berths.map(berth => {
                const bus = buses.find(b => b.berthId === berth.id);
                return (
                  <BerthCard 
                    key={berth.id} 
                    berth={berth} 
                    bus={bus} 
                    icon={getBerthIcon(berth.type)} 
                    hasAlert={alertBerths.has(berth.id)}
                    onResolve={() => resolveAlert(berth.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="relative bg-gray-100 rounded-2xl p-4 min-h-[500px] border border-gray-200 overflow-hidden flex flex-col">
              {/* Roadmap Infrastructure */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[20%] w-1 bg-gray-300/30" />
                <div className="absolute top-[40%] left-0 right-0 h-1 bg-gray-300/30" />
                <div className="absolute top-[25%] left-[5%] text-[10px] font-black text-gray-300 rotate-90 uppercase tracking-widest">Entry Roadway</div>
                <div className="absolute bottom-[25%] right-[5%] text-[10px] font-black text-gray-300 -rotate-90 uppercase tracking-widest">Exit Roadway</div>
              </div>

              <div className="relative z-10 grid grid-cols-12 gap-4 h-full">
                {/* Left Side: Alighting Finger */}
                <div className="col-span-3 flex flex-col gap-3 justify-center">
                  <div className="text-[10px] font-bold text-orange-600 mb-1 flex items-center gap-1">
                    <UserMinus size={12} /> ALIGHTING ZONE
                  </div>
                  {berths.filter(b => b.type === 'ALIGHTING').map(berth => (
                    <MapBerthItem 
                      key={berth.id} 
                      berth={berth} 
                      bus={buses.find(b => b.berthId === berth.id)} 
                      type="alighting" 
                      hasAlert={alertBerths.has(berth.id)}
                    />
                  ))}
                </div>

                {/* Center: Passenger Concourse */}
                <div className="col-span-5 relative flex items-center justify-center">
                  <div className="w-full h-[80%] bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                      <LayoutGrid size={32} />
                    </div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-1">Passenger Concourse</h4>
                    <p className="text-[10px] text-gray-400 font-medium px-4">Climate controlled boarding lobby & waiting lounge</p>
                  </div>
                  <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 text-gray-300">
                    <ChevronRight size={24} strokeWidth={3} />
                  </div>
                  <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 text-gray-300">
                    <ChevronRight size={24} strokeWidth={3} />
                  </div>
                </div>

                {/* Right Side: Boarding Fingers */}
                <div className="col-span-4 flex flex-col gap-3 justify-center items-end">
                  <div className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1 self-start">
                    <UserPlus size={12} /> BOARDING ZONE
                  </div>
                  {berths.filter(b => b.type === 'BOARDING').map(berth => (
                    <MapBerthItem 
                      key={berth.id} 
                      berth={berth} 
                      bus={buses.find(b => b.berthId === berth.id)} 
                      type="boarding" 
                      hasAlert={alertBerths.has(berth.id)}
                    />
                  ))}
                </div>

                {/* Bottom: Layover Area */}
                <div className="col-span-12 mt-8 pt-8 border-t border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 mb-4 flex items-center gap-1 uppercase tracking-widest">
                    <ParkingCircle size={14} /> Layover & Standby Parking
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {berths.filter(b => b.type === 'LAYOVER').map(berth => (
                      <MapBerthItem 
                        key={berth.id} 
                        berth={berth} 
                        bus={buses.find(b => b.berthId === berth.id)} 
                        type="layover" 
                        horizontal 
                        hasAlert={alertBerths.has(berth.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="text-blue-600" size={18} />
              Turnaround Trends
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="turnaroundMinutes" radius={[4, 4, 0, 0]}>
                    {performance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.turnaroundMinutes > 20 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-orange-50 rounded-2xl flex items-start gap-3 border border-orange-100">
              <Info className="text-orange-500 shrink-0" size={20} />
              <p className="text-xs text-orange-700 font-medium leading-relaxed">
                Congestion detected in Alighting Finger 2. Suggest dynamic layover routing.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="font-bold mb-4 flex items-center justify-between">
              Critical Alerts
              <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">{alertBerths.size + 2} ACTIVE</span>
            </h3>
            <div className="space-y-4">
              {Array.from(alertBerths).map(id => (
                <AlertItem 
                  key={id} 
                  title={`Unexpected Occupancy: ${id}`} 
                  desc="Sensor/System Mismatch" 
                  type="error" 
                />
              ))}
              <AlertItem title="Bus SMB123A (67)" desc="Scheduled departure in 5m" type="warning" />
              <AlertItem title="Shift Handover" desc="OM #42 taking control" type="info" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapBerthItem: React.FC<{ 
  berth: Berth; 
  bus?: Bus; 
  type: 'boarding' | 'alighting' | 'layover';
  horizontal?: boolean;
  hasAlert?: boolean;
}> = ({ berth, bus, type, horizontal, hasAlert }) => {
  const isNearDeparture = bus?.scheduledDeparture && 
    (new Date(bus.scheduledDeparture).getTime() - Date.now() < 300000);

  return (
    <div 
      className={`relative group transition-all duration-300 ${
        horizontal ? 'w-full h-16' : 'w-full h-20'
      } rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center ${
        hasAlert
        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] z-40'
        : berth.isOccupied 
          ? isNearDeparture 
            ? 'bg-orange-600 border-orange-400 text-white shadow-lg' 
            : 'bg-blue-600 border-blue-400 text-white shadow-lg'
          : 'bg-white border-gray-200 text-gray-400'
      }`}
    >
      <div className={`absolute top-1 left-1.5 text-[8px] font-black uppercase tracking-tighter opacity-60`}>
        {berth.id}
      </div>
      
      {hasAlert && (
        <div className="absolute top-1 right-1.5 text-white animate-pulse">
          <ShieldAlert size={10} />
        </div>
      )}

      {bus ? (
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-xs font-black tracking-tighter">S-{bus.serviceNo}</div>
          <div className="text-[8px] font-bold opacity-75">{bus.plateNo.slice(-4)}</div>
        </div>
      ) : (
        <div className="opacity-30">
          {hasAlert ? <ShieldAlert size={16} /> : type === 'boarding' ? <UserPlus size={16} /> : type === 'alighting' ? <UserMinus size={16} /> : <ParkingCircle size={16} />}
        </div>
      )}
    </div>
  );
};

const BerthCard: React.FC<{ 
  berth: Berth; 
  bus?: Bus; 
  icon: React.ReactNode; 
  hasAlert?: boolean;
  onResolve: () => void;
}> = ({ berth, bus, icon, hasAlert, onResolve }) => {
  const isNearDeparture = bus?.scheduledDeparture && 
    (new Date(bus.scheduledDeparture).getTime() - Date.now() < 300000);

  return (
    <div 
      className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden group ${
        hasAlert
        ? 'bg-red-50 border-red-500 shadow-lg ring-2 ring-red-100 z-30'
        : berth.isOccupied 
          ? isNearDeparture 
            ? 'bg-orange-50 border-orange-200 shadow-lg'
            : 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Alert Banner */}
      {hasAlert && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[9px] font-black py-1 px-3 flex items-center justify-between uppercase tracking-widest animate-pulse">
          <div className="flex items-center gap-1"><ShieldAlert size={10} /> SENSOR MISMATCH</div>
        </div>
      )}

      <div className={`flex justify-between items-center ${hasAlert ? 'mt-4 mb-4' : 'mb-4'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            hasAlert ? 'bg-red-100 text-red-600' :
            berth.isOccupied ? (isNearDeparture ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600') : 'bg-gray-50 text-gray-400'
          } transition-colors`}>
            {hasAlert ? <ShieldAlert size={14} /> : icon}
          </div>
          <div>
            <span className={`text-xs font-black uppercase tracking-tighter block leading-none ${hasAlert ? 'text-red-700' : 'text-gray-700'}`}>{berth.label}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-0.5 block">{berth.type}</span>
          </div>
        </div>
        {isNearDeparture && !hasAlert && (
          <div className="bg-orange-500 text-white p-1 rounded-md status-pulse">
            <Timer size={14} />
          </div>
        )}
      </div>
      
      {bus ? (
        <div className={`space-y-3 p-3 rounded-xl border transition-all ${
          hasAlert ? 'bg-white border-red-100 shadow-inner' : 'bg-white border-blue-100 shadow-inner'
        }`}>
          <div className="flex items-center gap-2">
            <BusIcon size={18} className={hasAlert ? "text-red-600" : (isNearDeparture ? "text-orange-600" : "text-blue-600")} />
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Service Number</div>
              <div className="text-xl font-black text-gray-900 leading-tight">S{bus.serviceNo}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Vehicle Plate</div>
            <div className={`text-xs font-mono font-black tracking-wider px-2 py-1 rounded-md border inline-block ${
              hasAlert ? 'bg-red-50 border-red-100 text-red-900' : 'bg-gray-50 border-gray-100 text-gray-700'
            }`}>
              {bus.plateNo}
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest shadow-sm ${
              hasAlert ? 'bg-red-600 text-white' : (isNearDeparture ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white')
            }`}>
              {bus.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      ) : (
        <div className={`h-[108px] flex flex-col items-center justify-center rounded-xl border border-dashed transition-all ${
          hasAlert ? 'bg-red-50 border-red-300' : 'bg-gray-50/50 border-gray-200'
        }`}>
          {hasAlert ? (
            <>
              <ShieldAlert className="text-red-500 mb-2" size={24} />
              <div className="text-[9px] text-red-600 font-black uppercase tracking-widest text-center px-4">Unexpected Presence Detected</div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-200 mb-2">
                <Info size={16} />
              </div>
              <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] italic">Vacant Berth</div>
            </>
          )}
        </div>
      )}

      {/* Resolution Action */}
      {hasAlert && (
        <button 
          onClick={onResolve}
          className="mt-3 w-full py-2 bg-white border border-red-200 rounded-lg text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          <CheckCircle2 size={12} /> Resolve Mismatch
        </button>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, subValue, color = "text-gray-900" }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shadow-inner">{icon}</div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
    <div className="text-xs text-gray-500 mt-1 font-semibold flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      {subValue}
    </div>
  </div>
);

const AlertItem = ({ title, desc, type }: any) => {
  const dotColor = type === 'warning' ? 'bg-orange-400' : type === 'error' ? 'bg-red-500' : 'bg-blue-400';
  const bgColor = type === 'error' ? 'bg-red-500/10' : 'hover:bg-gray-800';
  
  return (
    <div className={`flex items-start gap-3 border-l-4 border-gray-700 pl-4 py-2 transition-all rounded-r-xl ${bgColor}`}>
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
      <div>
        <div className={`text-sm font-black tracking-tight ${type === 'error' ? 'text-red-400' : 'text-white'}`}>{title}</div>
        <div className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{desc}</div>
      </div>
    </div>
  );
};

export default OperationsDashboard;
