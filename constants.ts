
import { Berth, Bus, PerformanceMetric, ShiftNote, AnalyticsData } from './types';

// Helper function to determine level and zone based on berth
const getBerthLocation = (berthId: string) => {
  const berthNum = parseInt(berthId.replace('B', ''));
  if (berthNum <= 4) return { level: 'Level 1', zone: 'Zone A' };
  if (berthNum <= 8) return { level: 'Level 2', zone: 'Zone B' };
  return { level: 'Level 3', zone: 'Zone C' };
};

// Berths with charging stations (every other LAYOVER berth has charging)
export const INITIAL_BERTHS: Berth[] = Array.from({ length: 12 }, (_, i) => {
  const type = i < 4 ? 'ALIGHTING' : i < 8 ? 'BOARDING' : 'LAYOVER';
  const hasCharger = type === 'LAYOVER' && i % 2 === 0; // Berths 8, 10, 12 have chargers
  
  return {
    id: `B${i + 1}`,
    label: `Berth ${i + 1}`,
    isOccupied: false,
    type,
    hasCharger,
    chargerStatus: hasCharger ? 'available' : undefined,
  };
});

export const INITIAL_BUSES: Bus[] = [
  { 
    id: 'BUS001', 
    serviceNo: '190', 
    plateNo: 'SMB315C', 
    status: 'EN_ROUTE', 
    captainId: 'BC01', 
    lastTapTime: new Date().toISOString(),
    batteryLevel: 78,
    isCharging: false,
    busType: 'Double-Deck',
    assignedTechnician: 'Tech Chen'
  },
  { 
    id: 'BUS002', 
    serviceNo: '972', 
    plateNo: 'SG5001D', 
    status: 'LAYOVER', 
    captainId: 'BC02', 
    berthId: 'B9', 
    checkInTime: new Date().toISOString(), 
    lastTapTime: new Date().toISOString(),
    level: 'Level 3',
    zone: 'Zone C',
    batteryLevel: 45,
    isCharging: false,
    busType: 'Single-Deck',
    assignedTechnician: 'Tech Wong'
  },
  { 
    id: 'BUS003', 
    serviceNo: '67', 
    plateNo: 'SMB123A', 
    status: 'IN_PORT', 
    captainId: 'BC03', 
    berthId: 'B5', 
    scheduledDeparture: new Date(Date.now() + 10 * 60000).toISOString(), 
    lastTapTime: new Date().toISOString(),
    level: 'Level 2',
    zone: 'Zone B',
    batteryLevel: 92,
    isCharging: false,
    busType: 'Electric',
    assignedTechnician: 'Tech Chen'
  },
  { 
    id: 'BUS004', 
    serviceNo: '133', 
    plateNo: 'SG8888K', 
    status: 'EN_ROUTE', 
    captainId: 'BC04', 
    lastTapTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    batteryLevel: 23,
    isCharging: false,
    busType: 'Double-Deck',
    assignedTechnician: 'Tech Kumar'
  },
  { 
    id: 'BUS005', 
    serviceNo: '857', 
    plateNo: 'SBS1234P', 
    status: 'UNDER_MAINTENANCE', 
    captainId: 'BC05', 
    berthId: 'B10', 
    lastTapTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    level: 'Level 3',
    zone: 'Zone C',
    batteryLevel: 56,
    isCharging: true,
    busType: 'Articulated',
    assignedTechnician: 'Tech Kumar'
  },
  { 
    id: 'BUS006', 
    serviceNo: '12', 
    plateNo: 'SG9999M', 
    status: 'READY', 
    captainId: 'BC06', 
    berthId: 'B11', 
    lastTapTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    level: 'Level 3',
    zone: 'Zone C',
    batteryLevel: 100,
    isCharging: false,
    busType: 'Electric',
    assignedTechnician: 'Tech Wong'
  },
];

export const MOCK_PERFORMANCE: PerformanceMetric[] = [
  { time: '08:00', turnaroundMinutes: 12 },
  { time: '09:00', turnaroundMinutes: 15 },
  { time: '10:00', turnaroundMinutes: 18 },
  { time: '11:00', turnaroundMinutes: 14 },
  { time: '12:00', turnaroundMinutes: 22 },
  { time: '13:00', turnaroundMinutes: 11 },
];

export const INITIAL_SHIFT_NOTES: ShiftNote[] = [
  {
    id: 'N001',
    busId: 'BUS004',
    author: 'Captain Lee',
    role: 'CAPTAIN',
    message: 'Steering feels slightly loose, recommend check before next service',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: 'N002',
    busId: 'BUS002',
    author: 'Tech Chen',
    role: 'TECHNICIAN',
    message: 'Completed brake pad replacement. Test drive successful.',
    priority: 'low',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolved: true,
  },
  {
    id: 'N003',
    berthId: 'B10',
    author: 'Manager Wong',
    role: 'MANAGER',
    message: 'B10 charging station intermittent. Electrician scheduled for 2PM.',
    priority: 'high',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
];

export const MOCK_ANALYTICS: AnalyticsData = {
  totalSearches: 147, // Searches this week
  avgSearchTimeSeconds: 28, // Down from 900 seconds (15 min)
  timeSavedHours: 356.5, // This month
  costSavingsMonthly: 45280, // SGD saved
  dispatchesPerDay: 48,
  maintenanceResolved: 23, // Issues resolved this month
};
