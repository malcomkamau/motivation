import React, { useState, useEffect } from 'react';
import {
  View, Text, Platform, Button, Alert, StyleSheet, FlatList, TouchableOpacity
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import SwitchToggle from 'react-native-switch-toggle';
import { MaterialIcons } from '@expo/vector-icons';

import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';
import { getQuotes } from './quotesDb';

export default function ReminderScreen() {
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState([new Date()]);
  const [showPickerIndex, setShowPickerIndex] = useState(null);

  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  useEffect(() => {
    requestPermission();
    loadReminderSettings();
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Enable notifications to receive quotes.');
    }
  };

  const loadReminderSettings = async () => {
    const saved = await AsyncStorage.getItem('reminderTimes');
    const enabledFlag = await AsyncStorage.getItem('reminderEnabled');
    if (saved) setTimes(JSON.parse(saved).map(t => new Date(t)));
    if (enabledFlag === 'true') {
      setEnabled(true);
    }
  };

  const saveSettings = async (newTimes) => {
    await AsyncStorage.setItem('reminderTimes', JSON.stringify(newTimes));
    await AsyncStorage.setItem('reminderEnabled', enabled.toString());
  };

  const toggleReminder = async () => {
    const newState = !enabled;
    setEnabled(newState);
    await AsyncStorage.setItem('reminderEnabled', newState.toString());

    if (newState) {
      scheduleAllNotifications(times);
    } else {
      await cancelAllNotifications();
      Toast.show({ type: 'info', text1: 'Reminders disabled' });
    }
  };

  const scheduleAllNotifications = async (timeArray) => {
    await cancelAllNotifications();

    const email = await AsyncStorage.getItem('currentUser');
    if (!email) return;

    const prefKey = `preferences_${email}`;
    const storedPrefs = await AsyncStorage.getItem(prefKey);
    const preferences = storedPrefs ? JSON.parse(storedPrefs).map(p => p.toLowerCase()) : [];

    const allQuotes = await getQuotes();
    const filteredQuotes =
      preferences.length === 0
        ? allQuotes
        : allQuotes.filter(q => preferences.includes(q.category));

    if (filteredQuotes.length === 0) {
      Alert.alert("No quotes found", "No quotes available for your selected categories.");
      return;
    }

    for (let date of timeArray) {
      const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
      const trigger = {
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Motivation 💫',
          body: `${randomQuote.text} — ${randomQuote.author || 'Unknown'}`,
        },
        trigger,
      });
    }

    Toast.show({ type: 'success', text1: 'Reminders scheduled with quotes' });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleTimeChange = (event, selectedDate, index) => {
    if (!selectedDate) return;

    const newTimes = [...times];
    newTimes[index] = selectedDate;
    setTimes(newTimes);
    saveSettings(newTimes);

    if (enabled) scheduleAllNotifications(newTimes);
    setShowPickerIndex(null);
  };

  const addNewTime = () => {
    const newTime = new Date();
    const updated = [...times, newTime];
    setTimes(updated);
    saveSettings(updated);
    Toast.show({ type: 'success', text1: 'New reminder time added' });
  };

  const removeTime = (index) => {
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
    saveSettings(updated);
    Toast.show({ type: 'info', text1: 'Reminder removed' });

    if (enabled) scheduleAllNotifications(updated);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <HeaderBar title="Daily Reminder" />
      <View style={styles.content}>

        <View style={styles.toggleRow}>
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
        </View>

        {enabled && (
          <Text style={[styles.infoText, { color: isDark ? '#aaa' : '#555' }]}>
            You’ll receive a motivational quote at these times:
          </Text>
        )}

        {times.map((time, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: isDark ? '#1f1f1f' : '#f9f6ff' }]}>
            <View style={styles.timeHeader}>
              <Text style={[styles.timeText, { color: textColor }]}>Reminder {idx + 1}: {formatTime(time)}</Text>
              {idx > 0 && (
                <TouchableOpacity onPress={() => removeTime(idx)}>
                  <MaterialIcons name="delete-outline" size={22} color="red" />
                </TouchableOpacity>
              )}
            </View>

            <Button
              title="Edit Time"
              onPress={() => setShowPickerIndex(idx)}
              disabled={!enabled}
              color="#7f5af0"
            />

            {showPickerIndex === idx && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, date) => handleTimeChange(event, date, idx)}
              />
            )}
          </View>
        ))}

        {enabled && (
          <TouchableOpacity style={styles.addButton} onPress={addNewTime}>
            <MaterialIcons name="add-circle-outline" size={24} color="#7f5af0" />
            <Text style={styles.addText}>Add Another Time</Text>
          </TouchableOpacity>
        )}

      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
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
    marginBottom: -10,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    backgroundColor: '#f9f6ff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
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
});
