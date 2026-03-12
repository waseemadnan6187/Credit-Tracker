
export enum BillType {
  FOOD = 'Food',
  JUICE = 'Juice'
}

export enum PaymentType {
  CASH = 'Cash',
  CHEQUE = 'Cheque',
  ONLINE = 'Online Transfer'
}

export enum RecoveryType {
  OB = 'OB',
  SM = 'SM'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type ThemeType = 'blue' | 'indigo' | 'emerald' | 'crimson' | 'amber' | 'slate';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  sidebar: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
  obCode: string; // Linked Order Booker
}

export interface OrderBooker {
  id: string;
  code: string;
  name: string;
  phone: string;
}

export interface Bill {
  id: string;
  date: string;
  customerCode: string;
  obCode: string;
  billNumber: string;
  shopName: string;
  shopAddress: string;
  billType: BillType;
  billAmount: number;
  recovery: number;
  balance: number;
}

export interface Recovery {
  id: string;
  billNumber: string;
  billDate: string;
  recoveryDate: string;
  type: string;
  billAmountAtRecovery: number;
  recoveryAmount: number;
  remainingAmount: number;
}

export interface SyncState {
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}
