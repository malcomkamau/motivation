import React from 'react';
import {
  View, Text, Pressable, StyleSheet, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import HeaderBar from '../components/HeaderBar';
import { useThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, setTheme, currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f2f2f2';
  const softDangerBg = isDark ? '#2c0b0e' : '#fff0f0';

  const ThemeOption = ({ label, value }) => (
    <Pressable
      onPress={() => setTheme(value)}
      style={[
        styles.themeOption,
        {
          backgroundColor: theme === value ? (isDark ? '#333' : '#e6ddff') : bgColor,
          borderColor: theme === value ? '#7f5af0' : (isDark ? '#555' : '#ccc'),
        }
      ]}
    >
      <Text style={{ fontSize: 16, color: textColor }}>{label}</Text>
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
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <HeaderBar title="Settings" />

      <View style={{ padding: 20 }}>
        <Animatable.View animation="fadeInDown" delay={50}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Theme</Text>
          <ThemeOption label="Light" value="light" />
          <ThemeOption label="Dark" value="dark" />
          <ThemeOption label="System Default" value="system" />
        </Animatable.View>

        <Animatable.View animation="fadeInDown" delay={200}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account</Text>

          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={[styles.item, { backgroundColor: cardBg }]}
          >
            <Text style={{ color: textColor }}>View Profile</Text>
          </Pressable>
          {/* 
          <Pressable
            onPress={() => navigation.navigate('Reminder')}
            style={[styles.item, { backgroundColor: cardBg }]}
          >
            <Text style={{ color: textColor }}>Daily Reminder</Text>
          </Pressable>
          */}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={350} style={styles.buttonRow}>
          <Pressable
            onPress={async () => {
              await AsyncStorage.removeItem('currentUser');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
            style={[
              styles.themeOption,
              styles.dangerButton,
              { backgroundColor: softDangerBg }
            ]}
          >
            <Ionicons name="log-out-outline" size={18} color="red" style={styles.icon} />
            <Text style={styles.dangerText}>Logout</Text>
          </Pressable>

          <Pressable
            onPress={clearStorage}
            style={[
              styles.themeOption,
              styles.dangerButton,
              { backgroundColor: softDangerBg }
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="red" style={styles.icon} />
            <Text style={styles.dangerText}>Delete Everything</Text>
          </Pressable>
        </Animatable.View>
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  themeOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 30,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'red',
    borderWidth: 1,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
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
