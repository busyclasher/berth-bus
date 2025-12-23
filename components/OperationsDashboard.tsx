
import React, { useState, useEffect } from 'react';
import { Bus, Berth, PerformanceMetric, AnalyticsData, ShiftNote } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AnalyticsDashboard from './AnalyticsDashboard';
import ShiftHandover from './ShiftHandover';
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
  AlertTriangle,
  Clock,
  Zap,
  Battery,
  BatteryCharging
} from 'lucide-react';

interface DashboardProps {
  buses: Bus[];
  berths: Berth[];
  performance: PerformanceMetric[];
  analytics: AnalyticsData;
  shiftNotes: ShiftNote[];
  onAddNote: (note: Omit<ShiftNote, 'id' | 'timestamp'>) => void;
  onResolveNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const OperationsDashboard: React.FC<DashboardProps> = ({ 
  buses, 
  berths, 
  performance, 
  analytics, 
  shiftNotes,
  onAddNote,
  onResolveNote,
  onDeleteNote 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'handover'>('overview');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [inactivityThresholdHours, setInactivityThresholdHours] = useState(2);
  const occupiedBerthsCount = berths.filter(b => b.isOccupied).length;
  const inPortBuses = buses.filter(b => b.status === 'IN_PORT');

  // Update current time every minute to check for stale buses
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Check for buses that haven't tapped in for a long time (potential breakdown)
  // Configurable threshold (default: 2 hours)
  const INACTIVITY_THRESHOLD = inactivityThresholdHours * 60 * 60 * 1000; // hours in milliseconds
  const staleBuses = buses.filter(bus => {
    if (bus.status === 'EN_ROUTE' && bus.lastTapTime) {
      const timeSinceLastTap = currentTime - new Date(bus.lastTapTime).getTime();
      return timeSinceLastTap > INACTIVITY_THRESHOLD;
    }
    return false;
  });

  const getBerthIcon = (type: Berth['type']) => {
    switch (type) {
      case 'BOARDING': return <UserPlus size={14} className="text-blue-500" />;
      case 'ALIGHTING': return <UserMinus size={14} className="text-orange-500" />;
      case 'LAYOVER': return <ParkingCircle size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Critical Alert Banner for Stale Buses */}
      {staleBuses.length > 0 && (
        <div className="bg-red-600 text-white p-4 md:p-6 rounded-3xl shadow-xl animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                ⚠️ Critical: {staleBuses.length} Bus{staleBuses.length > 1 ? 'es' : ''} May Have Broken Down
              </h3>
              <p className="text-red-100 text-sm font-medium mb-3">
                The following buses haven't tapped a berth for over {inactivityThresholdHours} hours. Immediate investigation required.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {staleBuses.map(bus => {
                  const hoursSinceLastTap = bus.lastTapTime 
                    ? Math.floor((currentTime - new Date(bus.lastTapTime).getTime()) / (60 * 60 * 1000))
                    : 0;
                  return (
                    <div key={bus.id} className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                      <Clock size={14} />
                      {bus.plateNo} (S{bus.serviceNo}) - {hoursSinceLastTap}h inactive
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => setShowThresholdConfig(!showThresholdConfig)}
                className="text-xs underline hover:text-red-100 transition-colors"
              >
                {showThresholdConfig ? 'Hide' : 'Configure'} alert threshold
              </button>
              {showThresholdConfig && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-4">
                  <label className="text-sm font-medium">Alert after:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="24"
                    value={inactivityThresholdHours}
                    onChange={(e) => setInactivityThresholdHours(Number(e.target.value))}
                    className="w-20 px-3 py-1 rounded-lg text-gray-900 font-bold text-sm"
                  />
                  <span className="text-sm font-medium">hours of inactivity</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hub Operations Control</h1>
          <p className="text-gray-500 font-medium">Precision Berth Management • Changi Interchange Terminal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-200">
            <Activity size={14} className="status-pulse" /> SYSTEM LIVE
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} />
            Overview & Berths
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            Analytics & ROI
          </div>
        </button>
        <button
          onClick={() => setActiveTab('handover')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            activeTab === 'handover'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            Shift Handover
            {shiftNotes.filter(n => !n.resolved).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {shiftNotes.filter(n => !n.resolved).length}
              </span>
            )}
          </div>
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Berths" value={berths.length} icon={<LayoutGrid />} subValue={`${occupiedBerthsCount} Occupied`} />
            <StatCard title="Buses In-Port" value={inPortBuses.length} icon={<Activity />} subValue="Active boarding" color="text-blue-600" />
            <StatCard title="Charging Stations" value={berths.filter(b => b.hasCharger).length} icon={<BatteryCharging />} subValue={`${berths.filter(b => b.chargerStatus === 'in-use').length} In Use`} color="text-green-600" />
            <StatCard title="Low Battery Buses" value={buses.filter(b => (b.batteryLevel || 100) < 30).length} icon={<Battery />} subValue="Need charging" color="text-red-600" />
          </div>

          {/* View Mode Switcher */}
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
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              {viewMode === 'grid' ? 'Berth Matrix' : 'Spatial Depot Layout'}
              <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Sector Alpha-01</span>
            </h3>
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
                  <BerthCard key={berth.id} berth={berth} bus={bus} icon={getBerthIcon(berth.type)} />
                );
              })}
            </div>
          ) : (
            <div className="relative bg-gray-100 rounded-2xl p-4 min-h-[500px] border border-gray-200 overflow-hidden flex flex-col">
              {/* Roadmap Infrastructure */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[20%] w-1 bg-gray-300/30" />
                <div className="absolute top-[40%] left-0 right-0 h-1 bg-gray-300/30" />
                {/* Lane Markings */}
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
                    <MapBerthItem key={berth.id} berth={berth} bus={buses.find(b => b.berthId === berth.id)} type="alighting" />
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
                    <div className="mt-4 flex gap-2">
                      <div className="w-1 h-8 bg-blue-100 rounded-full" />
                      <div className="w-1 h-8 bg-blue-100 rounded-full" />
                      <div className="w-1 h-8 bg-blue-100 rounded-full" />
                    </div>
                  </div>
                  {/* Arrows indicating flow */}
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
                    <MapBerthItem key={berth.id} berth={berth} bus={buses.find(b => b.berthId === berth.id)} type="boarding" />
                  ))}
                </div>

                {/* Bottom: Layover Area */}
                <div className="col-span-12 mt-8 pt-8 border-t border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 mb-4 flex items-center gap-1 uppercase tracking-widest">
                    <ParkingCircle size={14} /> Layover & Standby Parking (Basement L1)
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {berths.filter(b => b.type === 'LAYOVER').map(berth => (
                      <MapBerthItem key={berth.id} berth={berth} bus={buses.find(b => b.berthId === berth.id)} type="layover" horizontal />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Indicator */}
              <div className="absolute top-6 right-6 flex flex-col items-center opacity-40">
                <Navigation size={24} className="text-gray-400 -rotate-45" />
                <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">North</span>
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
            <div className="mt-4 p-4 bg-orange-50 rounded-2xl flex items-start gap-3">
              <Info className="text-orange-500 shrink-0" size={20} />
              <p className="text-xs text-orange-700 font-medium leading-relaxed">
                Service 190 at B2 shows 22m turnaround. Check if alighting is clear.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="font-bold mb-4 flex items-center justify-between">
              Recent Alerts
              <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">{3 + staleBuses.length} NEW</span>
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Stale Bus Alerts */}
              {staleBuses.map(bus => {
                const hoursSinceLastTap = bus.lastTapTime 
                  ? Math.floor((currentTime - new Date(bus.lastTapTime).getTime()) / (60 * 60 * 1000))
                  : 0;
                return (
                  <AlertItem 
                    key={bus.id}
                    title={`${bus.plateNo} (S${bus.serviceNo})`}
                    desc={`No berth tap for ${hoursSinceLastTap}h - Possible breakdown`}
                    type="error"
                    icon={<AlertTriangle size={16} />}
                  />
                );
              })}
              <AlertItem title="Bus SMB123A (67)" desc="Scheduled departure in 5m" type="warning" />
              <AlertItem title="Berth B2 (Alighting)" desc="Sensor mismatch detected" type="error" />
              <AlertItem title="Shift Changeover" desc="3 BCs active for next slot" type="info" />
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard data={analytics} />
      )}

      {/* Shift Handover Tab */}
      {activeTab === 'handover' && (
        <ShiftHandover
          notes={shiftNotes}
          buses={buses}
          berths={berths}
          onAddNote={onAddNote}
          onResolveNote={onResolveNote}
          onDeleteNote={onDeleteNote}
        />
      )}
    </div>
  );
};

const MapBerthItem: React.FC<{ 
  berth: Berth; 
  bus?: Bus; 
  type: 'boarding' | 'alighting' | 'layover';
  horizontal?: boolean;
}> = ({ berth, bus, type, horizontal }) => {
  const isNearDeparture = bus?.scheduledDeparture && 
    (new Date(bus.scheduledDeparture).getTime() - Date.now() < 300000);

  return (
    <div 
      className={`relative group transition-all duration-300 ${
        horizontal ? 'w-full h-16' : 'w-full h-20'
      } rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center ${
        berth.isOccupied 
        ? isNearDeparture 
          ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-200' 
          : 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-100'
        : 'bg-white border-gray-200 text-gray-400'
      }`}
    >
      <div className={`absolute top-1 left-1.5 text-[8px] font-black uppercase tracking-tighter opacity-60`}>
        {berth.id}
      </div>
      
      {bus ? (
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-xs font-black tracking-tighter">S-{bus.serviceNo}</div>
          <div className="text-[8px] font-bold opacity-75">{bus.plateNo.slice(-4)}</div>
          {isNearDeparture && <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-white rounded-full status-pulse" />}
        </div>
      ) : (
        <div className="opacity-30">
          {type === 'boarding' ? <UserPlus size={16} /> : type === 'alighting' ? <UserMinus size={16} /> : <ParkingCircle size={16} />}
        </div>
      )}

      {/* Hover Detail Overlay */}
      <div className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center pointer-events-none">
        <div className="text-[8px] font-black uppercase tracking-widest">{berth.label}</div>
        {bus && <div className="text-[9px] font-mono mt-0.5">{bus.plateNo}</div>}
      </div>
    </div>
  );
};

const BerthCard: React.FC<{ berth: Berth; bus?: Bus; icon: React.ReactNode }> = ({ berth, bus, icon }) => {
  const isNearDeparture = bus?.scheduledDeparture && 
    (new Date(bus.scheduledDeparture).getTime() - Date.now() < 300000);

  return (
    <div 
      className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden group ${
        berth.isOccupied 
        ? isNearDeparture 
          ? 'bg-orange-50 border-orange-200 shadow-lg'
          : 'bg-blue-50 border-blue-200 shadow-sm' 
        : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Charging Station Indicator */}
      {berth.hasCharger && (
        <div className={`absolute top-2 right-2 p-1.5 rounded-lg ${
          berth.chargerStatus === 'in-use' ? 'bg-green-500 text-white status-pulse' : 
          berth.chargerStatus === 'maintenance' ? 'bg-red-500 text-white' : 
          'bg-gray-200 text-gray-500'
        }`} title={`Charger: ${berth.chargerStatus}`}>
          {berth.chargerStatus === 'in-use' ? <BatteryCharging size={14} /> : <Zap size={14} />}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${berth.isOccupied ? (isNearDeparture ? 'bg-orange-100' : 'bg-blue-100') : 'bg-gray-50'} transition-colors group-hover:scale-110 duration-300`}>
            {icon}
          </div>
          <div>
            <span className="text-xs font-black text-gray-700 uppercase tracking-tighter block leading-none">{berth.label}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-0.5 block">{berth.type}</span>
          </div>
        </div>
        {isNearDeparture && (
          <div className="bg-orange-500 text-white p-1 rounded-md status-pulse">
            <Timer size={14} />
          </div>
        )}
      </div>
      
      {bus ? (
        <div className="space-y-3 bg-white p-3 rounded-xl border border-blue-100 shadow-inner">
          <div className="flex items-center gap-2">
            <BusIcon size={18} className={isNearDeparture ? "text-orange-600" : "text-blue-600"} />
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Service Number</div>
              <div className="text-xl font-black text-gray-900 leading-tight">S{bus.serviceNo}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Vehicle Plate</div>
            <div className="text-xs font-mono font-black text-gray-700 tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100 inline-block">
              {bus.plateNo}
            </div>
          </div>
          
          {/* Battery Level */}
          {bus.batteryLevel !== undefined && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1.5">Battery Level</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      bus.batteryLevel > 70 ? 'bg-green-500' : 
                      bus.batteryLevel > 30 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${bus.batteryLevel}%` }}
                  />
                </div>
                <span className="text-xs font-black text-gray-900">{bus.batteryLevel}%</span>
                {bus.isCharging && <BatteryCharging size={14} className="text-green-500 status-pulse" />}
              </div>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between">
            <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest shadow-sm ${
              isNearDeparture ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {bus.status.replace('_', ' ')}
            </span>
            {isNearDeparture && (
              <span className="text-[8px] font-black text-orange-600 uppercase animate-pulse flex items-center gap-1">
                <AlertCircle size={8} /> Departure Imminent
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[108px] flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-200 mb-2">
            <Info size={16} />
          </div>
          <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] italic">Vacant Berth</div>
        </div>
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

const AlertItem = ({ title, desc, type, icon }: any) => {
  const dotColor = type === 'warning' ? 'bg-orange-400' : type === 'error' ? 'bg-red-500' : 'bg-blue-400';
  const bgColor = type === 'error' ? 'hover:bg-red-900/20' : 'hover:bg-gray-800';
  return (
    <div className={`flex items-start gap-3 border-l-4 border-gray-700 pl-4 py-2 transition-all ${bgColor} rounded-r-xl`}>
      {icon ? (
        <div className={`${type === 'warning' ? 'text-orange-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'} mt-1`}>
          {icon}
        </div>
      ) : (
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
      )}
      <div className="flex-1">
        <div className="text-sm font-black tracking-tight">{title}</div>
        <div className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{desc}</div>
      </div>
      {type === 'error' && (
        <div className="bg-red-500/20 text-red-400 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
          Critical
        </div>
      )}
    </div>
  );
};

export default OperationsDashboard;
