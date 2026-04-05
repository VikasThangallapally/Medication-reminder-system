/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';
import {handleNotifeeActionEvent, rescheduleAllMedicineAlarms} from './src/services/alarmService';

notifee.onBackgroundEvent(async event => {
	await handleNotifeeActionEvent(event);
});

AppRegistry.registerHeadlessTask('BootRescheduleTask', () => async () => {
	await rescheduleAllMedicineAlarms();
});

AppRegistry.registerComponent(appName, () => App);
