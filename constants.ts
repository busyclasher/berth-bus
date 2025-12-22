
import { Berth, Bus, PerformanceMetric } from './types';

export const INITIAL_BERTHS: Berth[] = Array.from({ length: 12 }, (_, i) => ({
  id: `B${i + 1}`,
  label: `Berth ${i + 1}`,
  isOccupied: false,
  type: i < 4 ? 'ALIGHTING' : i < 8 ? 'BOARDING' : 'LAYOVER',
}));

export const INITIAL_BUSES: Bus[] = [
  { id: 'BUS001', serviceNo: '190', plateNo: 'SMB315C', status: 'EN_ROUTE', captainId: 'BC01' },
  { id: 'BUS002', serviceNo: '972', plateNo: 'SG5001D', status: 'LAYOVER', captainId: 'BC02', berthId: 'B9', checkInTime: new Date().toISOString() },
  { id: 'BUS003', serviceNo: '67', plateNo: 'SMB123A', status: 'IN_PORT', captainId: 'BC03', berthId: 'B5', scheduledDeparture: new Date(Date.now() + 10 * 60000).toISOString() },
];

export const MOCK_PERFORMANCE: PerformanceMetric[] = [
  { time: '08:00', turnaroundMinutes: 12 },
  { time: '09:00', turnaroundMinutes: 15 },
  { time: '10:00', turnaroundMinutes: 18 },
  { time: '11:00', turnaroundMinutes: 14 },
  { time: '12:00', turnaroundMinutes: 22 },
  { time: '13:00', turnaroundMinutes: 11 },
];
