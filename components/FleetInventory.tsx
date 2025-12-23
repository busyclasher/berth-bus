
import React, { useState } from 'react';
import { Bus, Berth } from '../types';
import { 
  Download,
  Filter,
  MapPin,
  User
} from 'lucide-react';

interface FleetInventoryProps {
  buses: Bus[];
  berths: Berth[];
}

const FleetInventory: React.FC<FleetInventoryProps> = ({ buses, berths }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | Bus['status']>('all');

  // Filter buses
  const filteredBuses = buses.filter(bus => {
    const matchesFilter = filterStatus === 'all' || bus.status === filterStatus;
    return matchesFilter;
  });

  const getStatusDisplay = (status: Bus['status']) => {
    switch (status) {
      case 'IN_PORT': return { text: 'In Service', color: 'bg-emerald-100 text-emerald-700' };
      case 'UNDER_MAINTENANCE': return { text: 'Under Maintenance', color: 'bg-red-100 text-red-700' };
      case 'READY': return { text: 'Ready', color: 'bg-green-100 text-green-700' };
      case 'EN_ROUTE': return { text: 'In Service', color: 'bg-emerald-100 text-emerald-700' };
      case 'LAYOVER': return { text: 'Parked', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = () => {
    const csvContent = [
      ['Bus Number', 'Service', 'Type', 'Status', 'Location', 'Battery', 'Technician', 'Last Activity'],
      ...filteredBuses.map(bus => [
        bus.plateNo,
        bus.serviceNo,
        bus.busType || 'N/A',
        bus.status.replace('_', ' '),
        bus.berthId ? `${bus.level}, ${bus.zone}, ${bus.berthId}` : 'En Route',
        `${bus.batteryLevel || 0}%`,
        bus.assignedTechnician || 'Unassigned',
        formatTimeSince(bus.lastTapTime)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Fleet Inventory</h1>
          <p className="text-gray-500 text-sm">
            Total {buses.length} vehicles registered in system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700">
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>


      {/* Fleet Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  VEHICLE DETAILS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  STAFF ASSIGNED
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  BATTERY
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  LAST ACTIVITY
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map((bus) => {
                const statusInfo = getStatusDisplay(bus.status);
                const berthNum = bus.berthId ? parseInt(bus.berthId.replace('B', '')) : null;
                let floor = 'N/A', bay = 'N/A';
                
                if (berthNum) {
                  if (berthNum <= 4) { floor = '1'; bay = `B${berthNum}`; }
                  else if (berthNum <= 8) { floor = '2'; bay = `B${berthNum}`; }
                  else { floor = '3'; bay = `B${berthNum}`; }
                }
                
                return (
                  <tr key={bus.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Vehicle Details */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-bold text-gray-900 text-base mb-1">{bus.plateNo}</div>
                        <div className="text-sm text-gray-500">
                          {bus.busType || 'Standard'} • BUS-{bus.id.slice(-4)}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>

                    {/* Staff Assigned */}
                    <td className="px-6 py-5">
                      {bus.assignedTechnician ? (
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-500" />
                          <span className="text-sm text-gray-700">{bus.assignedTechnician}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-5">
                      {bus.berthId ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-600">Floor {floor}</div>
                            <div className="text-xs text-gray-500">Bay {bay}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Battery */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (bus.batteryLevel || 0) > 70 ? 'bg-green-500' :
                              (bus.batteryLevel || 0) > 30 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${bus.batteryLevel || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                          {bus.batteryLevel || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600">
                        {formatTime(bus.lastTapTime)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetInventory;

