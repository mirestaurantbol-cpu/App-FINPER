export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export type ReminderType = 'collection' | 'payment'; // Cobro | Pago

export interface Reminder {
  id: string;
  title: string;
  amount?: number;
  type: ReminderType;
  description: string;
  date: string; // YYYY-MM-DD
  completed?: boolean; // Marcar como cumplido o no cumplido
}

export interface UserProfile {
  name: string;
  currency: string; // Ej: "Bs.", "$", "S/.", etc.
  avatarSeed: string; // for dynamic visual avatars
  registeredAt?: string;
  isRegistered: boolean;
}

