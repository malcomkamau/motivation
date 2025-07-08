// NotificationHelper.js

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// 🛡️ Ensure notifications show while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // ✅ Show the notification banner
    shouldPlaySound: true,    // ✅ Play notification sound
    shouldSetBadge: false     // 🚫 (Optional) Don't change app icon badge count
  }),
});

// 📲 Request and register notification permissions
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Must use a physical device for Push Notifications');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // Uncomment if you want to use push tokens for remote notifications
    // const token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log("Expo Push Token:", token);

  } catch (err) {
    console.error("Notification registration failed:", err);
  }
}

// 🧪 Manual test notification (used in "Notify" button)
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Motivation Reminder',
        body: 'Here’s your daily dose of motivation!',
      },
      trigger: null // Send immediately
    });
  } catch (err) {
    console.error("Failed to send test notification:", err);
  }
}
