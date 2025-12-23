
import React, { useState, useEffect } from 'react';
import { Bus, Berth } from '../types';
import { Search, MapPin, Wrench, CheckCircle, Bus as BusIcon, Layers, Navigation2, AlertCircle, Smartphone, Battery, BatteryCharging, Zap, List } from 'lucide-react';
import FleetInventory from './FleetInventory';

interface TechnicianProps {
  buses: Bus[];
  berths: Berth[];
  onStatusUpdate: (busId: string, status: Bus['status'], berthId?: string) => void;
}

const TechnicianInterface: React.FC<TechnicianProps> = ({ buses, berths, onStatusUpdate }) => {
  const [activeView, setActiveView] = useState<'locator' | 'inventory'>('locator');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNfcAnimation, setShowNfcAnimation] = useState(false);
  const [nfcActionMessage, setNfcActionMessage] = useState('');
  const [justUpdated, setJustUpdated] = useState(false);

  // Filter buses based on search query
  const filteredBuses = buses.filter(bus => 
    bus.plateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.serviceNo.includes(searchQuery) ||
    bus.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus);
    setSearchQuery('');
  };

  const handleStatusChange = (newStatus: Bus['status']) => {
    if (selectedBus) {
      // Show NFC tap animation
      const statusMessages: Record<Bus['status'], string> = {
        'IN_PORT': 'Bus Parked',
        'UNDER_MAINTENANCE': 'Maintenance Mode Active',
        'READY': 'Ready for Deployment',
        'EN_ROUTE': 'En Route Status Set',
        'LAYOVER': 'Layover Mode'
      };
      
      setNfcActionMessage(statusMessages[newStatus]);
      setShowNfcAnimation(true);
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
      
      // Update status after brief delay to show animation
      setTimeout(() => {
        onStatusUpdate(selectedBus.id, newStatus, selectedBus.berthId);
        setShowStatusModal(false);
        
        // Hide animation and show success indicator
        setTimeout(() => {
          setShowNfcAnimation(false);
          setJustUpdated(true);
          
          // Hide success indicator after 3 seconds
          setTimeout(() => {
            setJustUpdated(false);
          }, 3000);
        }, 2000);
      }, 300);
    }
  };

  // Auto-refresh selected bus when buses array updates
  useEffect(() => {
    if (selectedBus) {
      const updatedBus = buses.find(b => b.id === selectedBus.id);
      if (updatedBus) {
        setSelectedBus(updatedBus);
      }
    }
  }, [buses, selectedBus]);

  const getBerthLocation = (berthId?: string) => {
    if (!berthId) return null;
    const berth = berths.find(b => b.id === berthId);
    if (!berth) return null;

    // Map berth IDs to levels and zones
    const berthNum = parseInt(berthId.replace('B', ''));
    let level = 'Level 1';
    let zone = 'Zone A';

    if (berthNum <= 4) {
      level = 'Level 1';
      zone = 'Zone A';
    } else if (berthNum <= 8) {
      level = 'Level 2';
      zone = 'Zone B';
    } else {
      level = 'Level 3';
      zone = 'Zone C';
    }

    return { level, zone, berth: berth.id, label: berth.label };
  };

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'IN_PORT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'UNDER_MAINTENANCE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'READY': return 'bg-green-100 text-green-700 border-green-200';
      case 'EN_ROUTE': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LAYOVER': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Bus['status']) => {
    switch (status) {
      case 'UNDER_MAINTENANCE': return <Wrench size={20} />;
      case 'READY': return <CheckCircle size={20} />;
      case 'IN_PORT': return <MapPin size={20} />;
      default: return <BusIcon size={20} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Wrench size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Technician Portal</h1>
              <p className="text-purple-100 font-medium text-sm md:text-base">Asset Locator & Fleet Management</p>
            </div>
          </div>
          
          {/* View Switcher */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveView('locator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'locator'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Search size={14} />
              LOCATOR
            </button>
            <button
              onClick={() => setActiveView('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'inventory'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <List size={14} />
              INVENTORY
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-80">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest">System Online • Changi Depot • {buses.length} Buses</p>
        </div>
      </div>

      {/* Fleet Inventory View */}
      {activeView === 'inventory' && (
        <FleetInventory buses={buses} berths={berths} />
      )}

      {/* Asset Locator View */}
      {activeView === 'locator' && (
        <>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Asset Locator
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bus Number, Plate No, or ID (e.g., 8888, SMB315C)"
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && filteredBuses.length > 0 && (
          <div className="mt-4 border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {filteredBuses.map(bus => {
              const location = getBerthLocation(bus.berthId);
              return (
                <button
                  key={bus.id}
                  onClick={() => handleBusSelect(bus)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                      <BusIcon size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-gray-900 text-lg">{bus.plateNo}</div>
                      <div className="text-sm text-gray-500 font-medium">Service {bus.serviceNo}</div>
                    </div>
                  </div>
                  {location && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-600">{location.level}, {location.zone}</div>
                      <div className="text-xs text-gray-500 font-medium">{location.label}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {searchQuery && filteredBuses.length === 0 && (
          <div className="mt-4 p-6 bg-gray-50 rounded-2xl text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 font-medium">No buses found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Selected Bus Details */}
      {selectedBus && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BusIcon size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedBus.plateNo}</h2>
                  <p className="text-gray-300 font-medium">Service {selectedBus.serviceNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl border-2 ${getStatusColor(selectedBus.status)} font-black text-sm uppercase tracking-wider flex items-center gap-2`}>
                  {getStatusIcon(selectedBus.status)}
                  {selectedBus.status.replace('_', ' ')}
                </div>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-bold transition-all"
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Location Details */}
          {selectedBus.berthId ? (
            <div className="p-8">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {(() => {
                  const location = getBerthLocation(selectedBus.berthId);
                  const berth = selectedBus.berthId ? berths.find(b => b.id === selectedBus.berthId) : null;
                  return location ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                          <Layers size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Level</p>
                          <p className="text-2xl font-black text-gray-900">{location.level.split(' ')[1]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                          <Navigation2 size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Zone</p>
                          <p className="text-2xl font-black text-gray-900">{location.zone.split(' ')[1]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Berth</p>
                          <p className="text-2xl font-black text-gray-900">{location.berth}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
                        selectedBus.batteryLevel && selectedBus.batteryLevel < 30
                          ? 'bg-red-50 border-red-100'
                          : 'bg-orange-50 border-orange-100'
                      }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedBus.batteryLevel && selectedBus.batteryLevel < 30
                            ? 'bg-red-100 text-red-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {selectedBus.isCharging ? <BatteryCharging size={24} className="status-pulse" /> : <Battery size={24} />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            selectedBus.batteryLevel && selectedBus.batteryLevel < 30 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            Battery {selectedBus.isCharging ? '⚡' : ''}
                          </p>
                          <p className="text-2xl font-black text-gray-900">{selectedBus.batteryLevel || 0}%</p>
                          {berth?.hasCharger && !selectedBus.isCharging && (
                            <p className="text-[10px] text-gray-500 font-medium">Charger available</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>

              {/* Status Update Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Wrench className="text-purple-600" size={20} />
                      Update Bus Status via NFC Tap
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Simulate NFC tap at berth tag to update status instantly
                    </p>
                  </div>
                  {justUpdated && (
                    <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-2 animate-bounce">
                      <CheckCircle size={14} />
                      UPDATED!
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleStatusChange('IN_PORT')}
                    disabled={selectedBus.status === 'IN_PORT'}
                    className={`p-4 rounded-xl font-bold text-sm transition-all ${
                      selectedBus.status === 'IN_PORT'
                        ? 'bg-blue-600 text-white shadow-lg cursor-not-allowed'
                        : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <MapPin className="mx-auto mb-2" size={20} />
                    Parking
                  </button>
                  <button
                    onClick={() => handleStatusChange('UNDER_MAINTENANCE')}
                    disabled={selectedBus.status === 'UNDER_MAINTENANCE'}
                    className={`p-4 rounded-xl font-bold text-sm transition-all ${
                      selectedBus.status === 'UNDER_MAINTENANCE'
                        ? 'bg-yellow-600 text-white shadow-lg cursor-not-allowed'
                        : 'bg-white text-yellow-600 border-2 border-yellow-200 hover:bg-yellow-50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Wrench className="mx-auto mb-2" size={20} />
                    Maintenance
                  </button>
                  <button
                    onClick={() => handleStatusChange('READY')}
                    disabled={selectedBus.status === 'READY'}
                    className={`p-4 rounded-xl font-bold text-sm transition-all ${
                      selectedBus.status === 'READY'
                        ? 'bg-green-600 text-white shadow-lg cursor-not-allowed'
                        : 'bg-white text-green-600 border-2 border-green-200 hover:bg-green-50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <CheckCircle className="mx-auto mb-2" size={20} />
                    Ready
                  </button>
                  <button
                    onClick={() => handleStatusChange('EN_ROUTE')}
                    disabled={selectedBus.status === 'EN_ROUTE'}
                    className={`p-4 rounded-xl font-bold text-sm transition-all ${
                      selectedBus.status === 'EN_ROUTE'
                        ? 'bg-purple-600 text-white shadow-lg cursor-not-allowed'
                        : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Navigation2 className="mx-auto mb-2" size={20} />
                    En Route
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Technician Tip</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Walk straight to <span className="font-black">{getBerthLocation(selectedBus.berthId)?.level}, {getBerthLocation(selectedBus.berthId)?.zone}, {getBerthLocation(selectedBus.berthId)?.berth}</span>. No searching needed. Update status by tapping the NFC tag at the berth or using the buttons above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bus Not at Berth</h3>
              <p className="text-gray-500 font-medium">This bus is currently {selectedBus.status.replace('_', ' ').toLowerCase()} and not assigned to a berth.</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions Card (when no bus selected) */}
      {!selectedBus && !searchQuery && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-3xl border border-purple-100">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={36} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">How to Use Asset Locator</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black text-sm shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Search for Bus</h3>
                  <p className="text-sm text-gray-600">Type bus number (e.g., 8888) or plate number in the search bar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black text-sm shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">View Location</h3>
                  <p className="text-sm text-gray-600">See exact Level, Zone, and Berth number instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black text-sm shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Update Status</h3>
                  <p className="text-sm text-gray-600">Change bus status: Parking → Maintenance → Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* NFC Tap Animation - Show on both views */}
      {showNfcAnimation && (
        <div className="fixed inset-0 bg-purple-600/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="relative">
            {/* Ripple effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/20 rounded-full animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-white/10 rounded-full animate-pulse" />
            </div>
            
            {/* NFC Icon */}
            <div className="relative bg-white rounded-full p-8 mb-8 shadow-2xl">
              <Smartphone size={96} className="text-purple-600" />
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">NFC Tap Detected</h2>
          <div className="space-y-1">
            <p className="text-purple-50 font-black uppercase tracking-[0.2em] text-sm">{nfcActionMessage}</p>
            <p className="text-purple-100/70 font-bold uppercase tracking-widest text-[10px]">
              {selectedBus?.plateNo} • {selectedBus?.berthId ? `Berth ${selectedBus.berthId}` : 'System Updated'}
            </p>
          </div>
          <div className="mt-12 flex gap-3">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-150" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianInterface;

