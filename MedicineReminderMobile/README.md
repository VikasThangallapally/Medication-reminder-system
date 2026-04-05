# Medicine Reminder Mobile (React Native Android)

This project is a React Native Android application with true local alarm functionality.

Implemented capabilities:
- Exact timestamp medicine alarms via Android AlarmManager-backed triggers.
- Alarm notification with custom buzzer sound.
- Notification actions: Taken and Snooze.
- Alarm handling while app is backgrounded or closed.
- Local-only data storage (AsyncStorage).
- Alarm re-scheduling after device reboot via BOOT_COMPLETED receiver + headless JS task.
- No browser dependency and no internet dependency for alarm flow.

## Core Architecture

- UI + scheduling: `App.tsx`
- Alarm engine: `src/services/alarmService.ts`
- Local storage: `src/storage/medicineStorage.ts`
- Background action + boot task registration: `index.js`
- Boot receiver/service:
   - `android/app/src/main/java/com/medicineremindermobile/BootCompletedReceiver.kt`
   - `android/app/src/main/java/com/medicineremindermobile/BootRescheduleService.kt`
- Android permissions + components: `android/app/src/main/AndroidManifest.xml`

## Required Android Sound Resource

Alarm sound name configured in code: `alarm_buzzer`

Place file at:
- `android/app/src/main/res/raw/alarm_buzzer.wav`

Already included in this repository.

## Android Setup

1. Ensure Java is installed and `JAVA_HOME` is set.
2. Install Android SDK + Android Studio.
3. Ensure emulator/device is running.
4. From project root, run:

```bash
npm install
npm run android
```

## Runtime Permissions to Allow on Device

- Notifications
- Alarms & reminders (exact alarms)

The app requests these via Notifee and opens alarm settings when needed.

## Background Behavior

- Trigger notifications are scheduled as exact timestamps.
- Action handling runs even when app is closed:
   - Taken marks dose done and cancels repeats.
   - Snooze schedules next reminder in 5 minutes.
- On reboot, stored schedules are re-applied automatically.

## Build Release APK (Production)

Generate unsigned release APK:

```bash
cd android
./gradlew assembleRelease
```

APK output:
- `android/app/build/outputs/apk/release/app-release.apk`

## Signing for Production Distribution

1. Create a keystore (one-time).
2. Add signing config in `android/gradle.properties` and `android/app/build.gradle`.
3. Rebuild release APK/AAB.

Recommended production artifact for Play Store:
- Android App Bundle (AAB) via `./gradlew bundleRelease`

## Notes

- Android OEM battery optimization can still affect aggressive background behavior on some devices. Whitelisting from battery optimization settings is recommended for mission-critical reminders.
- For medical safety, dosage and treatment decisions must be confirmed by a licensed healthcare professional.
