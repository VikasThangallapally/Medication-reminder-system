import React, {useCallback, useEffect, useMemo, useState} from 'react';
import notifee from '@notifee/react-native';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ensureAlarmPermissions,
  scheduleMedicineAlarms,
  cancelMedicineAlarms,
  handleNotifeeActionEvent,
} from './src/services/alarmService';
import {getMedicines, saveMedicines} from './src/storage/medicineStorage';
import {MedicineSchedule, Weekday} from './src/types/medicine';

const allDays: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function dayShort(day: Weekday): string {
  return day.slice(0, 3).toUpperCase();
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysISODate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function createMedicineId(): string {
  return `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function App(): React.JSX.Element {
  const [medicines, setMedicines] = useState<MedicineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timesText, setTimesText] = useState('08:00,20:00');
  const [startDate, setStartDate] = useState(todayISODate());
  const [endDate, setEndDate] = useState(plusDaysISODate(7));
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(allDays);

  useEffect(() => {
    let active = true;
    getMedicines()
      .then(stored => {
        if (!active) {
          return;
        }
        setMedicines(stored);
      })
      .finally(() => setLoading(false));

    ensureAlarmPermissions().catch(() => {});

    const unsubscribe = notifee.onForegroundEvent(async event => {
      await handleNotifeeActionEvent(event);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const toggleDay = useCallback((day: Weekday) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  }, []);

  const parsedTimes = useMemo(
    () =>
      timesText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    [timesText],
  );

  const onAddMedicine = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Validation', 'Medicine name and dosage are required.');
      return;
    }

    if (!parsedTimes.length) {
      Alert.alert('Validation', 'Add at least one time slot in HH:MM format.');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Validation', 'End date cannot be before start date.');
      return;
    }

    const medicine: MedicineSchedule = {
      id: createMedicineId(),
      name: name.trim(),
      dosage: dosage.trim(),
      times: parsedTimes,
      startDate,
      endDate,
      daysOfWeek: selectedDays,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      const next = [medicine, ...medicines];
      setMedicines(next);
      await saveMedicines(next);
      await scheduleMedicineAlarms(medicine);

      setName('');
      setDosage('');
      setTimesText('08:00,20:00');
      setStartDate(todayISODate());
      setEndDate(plusDaysISODate(7));
      setSelectedDays(allDays);

      Alert.alert('Saved', 'Medicine added and exact Android alarms scheduled.');
    } catch (error) {
      Alert.alert('Error', 'Unable to schedule alarms. Please check alarm permission.');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteMedicine = async (medicine: MedicineSchedule) => {
    const next = medicines.filter(item => item.id !== medicine.id);
    setMedicines(next);
    await saveMedicines(next);
    await cancelMedicineAlarms(medicine.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7ff" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Medicine Reminder Android</Text>
        <Text style={styles.subtitle}>Exact background alarms using Android AlarmManager triggers.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Medicine</Text>

          <Text style={styles.label}>Medicine Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Paracetamol" />

          <Text style={styles.label}>Dosage</Text>
          <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="500 mg" />

          <Text style={styles.label}>Times (comma separated HH:MM)</Text>
          <TextInput style={styles.input} value={timesText} onChangeText={setTimesText} placeholder="08:00,20:00" />

          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-04-05" />

          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-04-12" />

          <Text style={styles.label}>Days</Text>
          <View style={styles.dayWrap}>
            {allDays.map(day => {
              const selected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, selected ? styles.dayChipActive : null]}
                  onPress={() => toggleDay(day)}>
                  <Text style={[styles.dayChipText, selected ? styles.dayChipTextActive : null]}>{dayShort(day)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={onAddMedicine} disabled={saving}>
            <Text style={styles.addButtonText}>{saving ? 'Scheduling...' : 'Save & Schedule Exact Alarm'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved Medicines</Text>
          {loading ? <Text style={styles.meta}>Loading medicines...</Text> : null}
          {!loading && medicines.length === 0 ? (
            <Text style={styles.meta}>No medicines yet.</Text>
          ) : (
            <FlatList
              data={medicines}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              renderItem={({item}) => (
                <View style={styles.itemRow}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.meta}>Dose: {item.dosage}</Text>
                    <Text style={styles.meta}>Times: {item.times.join(', ')}</Text>
                    <Text style={styles.meta}>
                      {item.startDate} to {item.endDate}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteMedicine(item)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f4f7ff'},
  container: {padding: 16, gap: 14, paddingBottom: 32},
  title: {fontSize: 24, fontWeight: '800', color: '#0f172a'},
  subtitle: {fontSize: 13, color: '#475569', marginTop: 2},
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4},
  label: {fontSize: 12, fontWeight: '700', color: '#334155'},
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  dayWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6},
  dayChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  dayChipActive: {backgroundColor: '#0f766e', borderColor: '#0f766e'},
  dayChipText: {fontSize: 11, fontWeight: '700', color: '#334155'},
  dayChipTextActive: {color: '#ffffff'},
  addButton: {
    marginTop: 8,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {color: 'white', fontWeight: '700'},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    gap: 10,
  },
  itemMain: {flex: 1, gap: 2},
  itemName: {fontSize: 15, fontWeight: '700', color: '#0f172a'},
  meta: {fontSize: 12, color: '#475569'},
  deleteButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff1f2',
  },
  deleteButtonText: {fontSize: 12, fontWeight: '700', color: '#be123c'},
});

export default App;
