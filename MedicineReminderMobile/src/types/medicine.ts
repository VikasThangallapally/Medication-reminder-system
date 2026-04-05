export type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type MedicineSchedule = {
  id: string;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string;
  times: string[];
  daysOfWeek: Weekday[];
  createdAt: string;
};

export type DoseLog = {
  medicineId: string;
  medicineName: string;
  plannedAt: number;
  status: 'taken' | 'snoozed';
  actionAt: number;
};

export type AlarmMap = Record<string, string[]>;
