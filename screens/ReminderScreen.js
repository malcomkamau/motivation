import React, { useState, useEffect } from 'react';
import {
  View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Platform
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import SwitchToggle from 'react-native-switch-toggle';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import HeaderBar from '../components/HeaderBar';
import { useThemeContext } from '../context/ThemeContext';
import { getQuotes } from '../database/quotesDb';

/**
 * ReminderScreen component for managing daily motivational quote reminders.
 *
 * This screen allows users to enable or disable daily notifications, select multiple reminder times,
 * and manage their notification preferences. It handles scheduling, editing, and deleting reminders,
 * as well as persisting settings using AsyncStorage. Notifications are filtered based on user-selected
 * categories and display random motivational quotes at the specified times.
 *
 * Features:
 * - Toggle daily motivational reminders on or off.
 * - Add, edit, or remove multiple reminder times.
 * - Schedule notifications with random quotes filtered by user preferences.
 * - Persist reminder settings and notification IDs.
 * - Send a test notification to verify notification functionality.
 * - Handles notification permissions and displays relevant alerts and toasts.
 *
 * @component
 * @returns {JSX.Element} The rendered ReminderScreen component.
 */
export default function ReminderScreen() {
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState([]);
  const [notificationIds, setNotificationIds] = useState([]);
  const [showPickerIndex, setShowPickerIndex] = useState(null);

  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    requestPermissions();
    loadSettings();
  }, []);

  /**
   * Requests notification permissions from the user.
   * If permissions are not already granted, prompts the user to enable them.
   * Shows an alert if the user denies the permission request.
   *
   * @async
   * @function
   * @returns {Promise<void>} Resolves when the permission request process is complete.
   */


  /**
   * Schedules daily motivational notifications at specified times.
   * 
   * Cancels all existing notifications, retrieves user preferences and filters quotes accordingly.
   * For each time in the provided array, schedules a notification with a random quote from the filtered list.
   * Stores notification IDs and times, and displays a success toast upon completion.
   * 
   * @async
   * @param {Date[]} timeArray - Array of Date objects representing the times to schedule notifications.
   * @returns {Promise<void>} Resolves when all notifications have been scheduled and settings saved.
   */
  const scheduleAllNotifications = async (timeArray) => {
    await cancelAllNotifications();

    const email = await AsyncStorage.getItem('currentUser');
    const prefKey = `preferences_${email}`;
    const storedPrefs = await AsyncStorage.getItem(prefKey);
    const preferences = storedPrefs ? JSON.parse(storedPrefs).map(p => p.toLowerCase()) : [];

    const allQuotes = await getQuotes();
    const filteredQuotes =
      preferences.length === 0
        ? allQuotes
        : allQuotes.filter(q =>
          preferences.includes(q.category?.toLowerCase?.().trim())
        );


    if (filteredQuotes.length === 0) {
      Alert.alert("No quotes found", "No quotes available for your selected categories.");
      return;
    }

    const notifIds = [];
    for (let date of timeArray) {
      const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Motivation',
          body: `${quote.text} — ${quote.author || 'Unknown'}`,
        },
        trigger: {
          hour: date.getHours(),
          minute: date.getMinutes(),
          repeats: true,
        },
      });
      notifIds.push(id);
    }

    setNotificationIds(notifIds);
    await saveSettings(timeArray, notifIds);
    Toast.show({ type: 'success', text1: 'Reminders scheduled!' });
  };

  /**
   * Handles the change event for the time picker.
   *
   * @param {Object} event - The event object from the time picker.
   * @param {Date|null} selectedDate - The newly selected date/time, or null if cancelled.
   * @param {number} index - The index of the time being changed in the times array.
   *
   * @returns {void}
   */
  const handleTimeChange = (event, selectedDate, index) => {
    if (!selectedDate) return;

    const updatedTimes = [...times];
    updatedTimes[index] = selectedDate;
    setTimes(updatedTimes);
    saveSettings(updatedTimes);

    if (enabled) scheduleAllNotifications(updatedTimes);
    setShowPickerIndex(null);
  };

  // Adds a new reminder time (current time) to the list.
  // Saves the updated times to storage and schedules notifications if reminders are enabled.
  const addNewTime = async () => {
    const updated = [...times, new Date()];
    setTimes(updated);
    await saveSettings(updated);
    if (enabled) await scheduleAllNotifications(updated);
    Toast.show({ type: 'success', text1: 'New reminder time added' });
  };

  /**
   * Removes a scheduled reminder time and its associated notification.
   *
   * Cancels the scheduled notification for the given index, updates the list of times and notification IDs,
   * saves the updated settings, and reschedules notifications if reminders are enabled.
   * Displays a toast notification upon successful removal.
   *
   * @async
   * @param {number} index - The index of the reminder time to remove.
   * @returns {Promise<void>} Resolves when the reminder has been removed and updates are complete.
   */
  const removeTime = async (index) => {
    if (notificationIds[index]) {
      await Notifications.cancelScheduledNotificationAsync(notificationIds[index]);
    }

    const updatedTimes = times.filter((_, i) => i !== index);
    const updatedNotifIds = notificationIds.filter((_, i) => i !== index);
    setTimes(updatedTimes);
    setNotificationIds(updatedNotifIds);
    await saveSettings(updatedTimes, updatedNotifIds);

    if (enabled) await scheduleAllNotifications(updatedTimes);
    Toast.show({ type: 'info', text1: 'Reminder removed' });
  };

  /**
   * Schedules a test notification with a motivational message.
   * Uses Expo Notifications to display a notification immediately.
   *
   * @async
   * @function
   * @returns {Promise<void>} Resolves when the notification has been scheduled.
   */
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Motivation Reminder',
        body: 'Here’s your daily dose of motivation!',
      },
      trigger: null,
    });
  };

  /**
   * Formats a Date object into a string with 2-digit hour and minute.
   *
   * @param {Date} date - The date object to format.
   * @returns {string} The formatted time string (e.g., "08:30 AM").
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <HeaderBar title="Daily Reminder" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animatable.View animation="fadeInDown" delay={50} style={styles.toggleRow}>
          <Text style={[styles.label, { color: textColor }]}>Enable Daily Quotes</Text>
          <SwitchToggle
            switchOn={enabled}
            onPress={toggleReminder}
            backgroundColorOn="#7f5af0"
            backgroundColorOff={isDark ? '#333' : '#ccc'}
            circleColorOff="#f4f3f4"
            circleColorOn="#fff"
            containerStyle={styles.switchContainer}
            circleStyle={styles.switchCircle}
          />
        </Animatable.View>

        {enabled && (
          <Text style={[styles.infoText, { color: isDark ? '#aaa' : '#555' }]}>
            You’ll receive motivational quotes daily at the selected time(s):
          </Text>
        )}

        {times.map((time, idx) => (
          <Animatable.View
            key={idx}
            animation="fadeInUp"
            delay={idx * 100}
            style={[styles.card, { backgroundColor: isDark ? '#1f1f1f' : '#f9f6ff' }]}
          >
            <View style={styles.timeHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={18} color="#7f5af0" />
                <Text style={[styles.timeText, { color: textColor }]}>
                  Reminder {idx + 1}: {formatTime(time)}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.editButton, !enabled && styles.disabled]}
                onPress={() => setShowPickerIndex(idx)}
                disabled={!enabled}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.buttonText}> Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton, !enabled && styles.disabled]}
                onPress={() => removeTime(idx)}
                disabled={!enabled}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.buttonText}> Delete</Text>
              </TouchableOpacity>
            </View>

            {showPickerIndex === idx && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, date) => handleTimeChange(event, date, idx)}
              />
            )}
          </Animatable.View>
        ))}

        {enabled && (
          <Animatable.View animation="fadeInUp" delay={300}>
            <TouchableOpacity style={styles.addButton} onPress={addNewTime}>
              <MaterialIcons name="add-circle-outline" size={24} color="#7f5af0" />
              <Text style={styles.addText}>Add Reminder</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        <Animatable.View animation="fadeInUp" delay={400}>
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Ionicons name="notifications" size={22} color="#7f5af0" />
            <Text style={styles.addText}>Send Test Notification</Text>
          </TouchableOpacity>
        </Animatable.View>

      </ScrollView>
      <Toast />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 18, fontWeight: '500' },
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 25,
    padding: 5,
  },
  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: -10,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  addButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  testButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  addText: {
    marginLeft: 6,
    color: '#7f5af0',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#7f5af0',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
});
