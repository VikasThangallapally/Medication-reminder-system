import AsyncStorage from '@react-native-async-storage/async-storage';
import {AlarmMap, DoseLog, MedicineSchedule} from '../types/medicine';

const MEDICINES_KEY = 'medicines:v1';
const ALARM_MAP_KEY = 'alarm_map:v1';
const DOSE_LOGS_KEY = 'dose_logs:v1';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getMedicines(): Promise<MedicineSchedule[]> {
  return readJson<MedicineSchedule[]>(MEDICINES_KEY, []);
}

export async function saveMedicines(medicines: MedicineSchedule[]): Promise<void> {
  await writeJson(MEDICINES_KEY, medicines);
}

export async function getAlarmMap(): Promise<AlarmMap> {
  return readJson<AlarmMap>(ALARM_MAP_KEY, {});
}

export async function saveAlarmMap(map: AlarmMap): Promise<void> {
  await writeJson(ALARM_MAP_KEY, map);
}

export async function appendDoseLog(log: DoseLog): Promise<void> {
  const logs = await readJson<DoseLog[]>(DOSE_LOGS_KEY, []);
  logs.unshift(log);
  await writeJson(DOSE_LOGS_KEY, logs.slice(0, 300));
}
