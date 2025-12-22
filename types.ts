
export type BusStatus = 'EN_ROUTE' | 'IN_PORT' | 'LAYOVER' | 'READY';

export interface Bus {
  id: string;
  serviceNo: string;
  plateNo: string;
  status: BusStatus;
  captainId: string;
  berthId?: string;
  scheduledDeparture?: string;
  checkInTime?: string;
}

export interface Berth {
  id: string;
  label: string;
  isOccupied: boolean;
  busId?: string;
  type: 'BOARDING' | 'ALIGHTING' | 'LAYOVER';
}

export interface PerformanceMetric {
  time: string;
  turnaroundMinutes: number;
}

export interface UserRole {
  type: 'BUS_CAPTAIN' | 'OPERATIONS_MANAGER';
  id: string;
  name: string;
}
