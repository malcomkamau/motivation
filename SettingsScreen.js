import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, setTheme, currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const ThemeOption = ({ label, value }) => (
    <Pressable
      onPress={() => setTheme(value)}
      style={[
        styles.themeOption,
        theme === value && {
          backgroundColor: isDark ? '#333' : '#e6ddff',
          borderColor: '#7f5af0',
        }
      ]}
    >
      <Text style={{ fontSize: 16, color: isDark ? '#fff' : '#000' }}>{label}</Text>
    </Pressable>
  );

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      alert('Storage cleared!');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.error('Error clearing AsyncStorage:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
      <HeaderBar title="Settings" />

      <View style={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Theme</Text>
        <ThemeOption label="Light" value="light" />
        <ThemeOption label="Dark" value="dark" />
        <ThemeOption label="System Default" value="system" />

        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Account</Text>

        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.item}>
          <Text style={{ color: isDark ? '#fff' : '#000' }}>View Profile</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Reminder')} style={styles.item}>
          <Text style={{ color: isDark ? '#fff' : '#000' }}>Daily Reminder</Text>
        </Pressable>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => alert('Logged out')}
            style={[styles.themeOption, styles.dangerButton]}
          >
            <Ionicons name="log-out-outline" size={18} color="red" style={styles.icon} />
            <Text style={styles.dangerText}>Logout</Text>
          </Pressable>

          <Pressable
            onPress={clearStorage}
            style={[styles.themeOption, styles.dangerButton]}
          >
            <Ionicons name="trash-outline" size={18} color="red" style={styles.icon} />
            <Text style={styles.dangerText}>Delete Everything</Text>
          </Pressable>
        </View>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  themeOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // only works in newer versions; fallback below
    marginTop: 20,
  },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'red',
    flex: 1,
    marginHorizontal: 5, // use this if gap doesn't work
  },

  icon: {
    marginRight: 6,
  },

  dangerText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },

});
