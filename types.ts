
export type BusStatus = 'EN_ROUTE' | 'IN_PORT' | 'LAYOVER' | 'READY' | 'UNDER_MAINTENANCE';

export interface Bus {
  id: string;
  serviceNo: string;
  plateNo: string;
  status: BusStatus;
  captainId: string;
  berthId?: string;
  scheduledDeparture?: string;
  checkInTime?: string;
  lastTapTime?: string; // Track last NFC tap for breakdown detection
  level?: string; // Level in depot (e.g., "Level 3")
  zone?: string;  // Zone in depot (e.g., "Zone B")
  batteryLevel?: number; // Battery percentage (0-100)
  isCharging?: boolean; // Whether currently charging
  lastChargeTime?: string; // Last time bus was charged
  busType?: 'Single-Deck' | 'Double-Deck' | 'Articulated' | 'Electric'; // Bus type
  assignedTechnician?: string; // Technician assigned to this bus
}

export interface Berth {
  id: string;
  label: string;
  isOccupied: boolean;
  busId?: string;
  type: 'BOARDING' | 'ALIGHTING' | 'LAYOVER';
  hasCharger?: boolean; // Whether this berth has charging station
  chargerStatus?: 'available' | 'in-use' | 'maintenance'; // Charger availability
}

export interface PerformanceMetric {
  time: string;
  turnaroundMinutes: number;
}

export interface UserRole {
  type: 'BUS_CAPTAIN' | 'OPERATIONS_MANAGER' | 'TECHNICIAN';
  id: string;
  name: string;
}

export interface ShiftNote {
  id: string;
  busId?: string;
  berthId?: string;
  author: string;
  role: 'CAPTAIN' | 'TECHNICIAN' | 'MANAGER';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved?: boolean;
}

export interface AnalyticsData {
  totalSearches: number;
  avgSearchTimeSeconds: number;
  timeSavedHours: number;
  costSavingsMonthly: number;
  dispatchesPerDay: number;
  maintenanceResolved: number;
}
