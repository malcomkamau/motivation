import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';
import { getUserByEmail } from './userDb';
import { getAvailableCategories, getQuotes } from './quotesDb';
import { createBackup, restoreBackup } from './utils/BackupService';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatar: null });
  const [preferences, setPreferences] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [quoteCounts, setQuoteCounts] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('currentUser');
        if (!userEmail) return;

        setEmail(userEmail);
        const user = await getUserByEmail(userEmail);
        const savedPrefs = await AsyncStorage.getItem(`preferences_${userEmail}`);
        const categories = await getAvailableCategories();

        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            avatar: user.avatar || null,
          });
        }

        setAvailableCategories(categories);

        const quotes = await getQuotes();
        const counts = {};
        quotes.forEach(q => {
          counts[q.category] = (counts[q.category] || 0) + 1;
        });
        setQuoteCounts(counts);
        setPreferences(savedPrefs ? JSON.parse(savedPrefs) : []);
      } catch (err) {
        console.error('Profile load error:', err);
      }
    };

    if (isFocused) loadUser();
  }, [isFocused]);

  const toggleCategory = async (category) => {
    const normalized = category.toLowerCase();
    const updated = preferences.includes(normalized)
      ? preferences.filter(c => c !== normalized)
      : [...new Set([...preferences, normalized])];

    setPreferences(updated);
    await AsyncStorage.setItem(`preferences_${email}`, JSON.stringify(updated));
  };

  const themedColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#333' : '#ddd';
  const boxColor = isDark ? '#1e1e1e' : '#f2f2f2';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
      <HeaderBar
        title="Your Profile"
        rightIcon={
          <Ionicons
            name="create-outline"
            size={24}
            color={isDark ? '#fff' : '#7f5af0'}
          />
        }
        onRightPress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Animatable.View animation="fadeInDown" style={styles.container}>
          <View style={styles.avatar}>
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={100} color={isDark ? '#bbb' : '#ccc'} />
            )}
          </View>
          <Text style={[styles.name, { color: themedColor }]}>{profile.name || 'Unnamed'}</Text>
          <Text style={[styles.email, { color: isDark ? '#aaa' : '#666' }]}>{profile.email}</Text>
          <Text style={[styles.bio, { color: isDark ? '#ccc' : '#444' }]}>{profile.bio || 'No bio yet.'}</Text>
        </Animatable.View>

        {availableCategories.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={200}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themedColor,
              marginBottom: 12,
              paddingHorizontal: 20,
              marginTop: 20,
            }}>
              Quote Stats
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {availableCategories.map(cat => {
                const count = quoteCounts[cat] || 0;
                return (
                  <View
                    key={cat}
                    style={{
                      backgroundColor: isDark ? '#2d2d2d' : '#e8ddfb',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                      marginRight: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      maxHeight: 32,
                      elevation: 2,
                    }}
                  >
                    <Ionicons
                      name="bookmark-outline"
                      size={14}
                      color="#7f5af0"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{
                      color: isDark ? '#fff' : '#7f5af0',
                      fontSize: 13,
                      flexShrink: 1,
                    }}>
                      {capitalize(cat)}: {count}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animatable.View>
        )}

        {/* Preferences Section */}
        <Animatable.View animation="fadeInUp" delay={300} style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: themedColor, marginBottom: 12 }}>
            Your Preferences
          </Text>

          {availableCategories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => toggleCategory(category)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: boxColor,
                borderWidth: 1,
                borderColor,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <Ionicons
                name={preferences.includes(category) ? 'checkbox' : 'square-outline'}
                size={22}
                color="#7f5af0"
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: themedColor, fontSize: 16 }}>
                {capitalize(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </Animatable.View>

        {/* Backup & Restore Section */}
        <Animatable.View animation="fadeInUp" delay={400} style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: themedColor, marginBottom: 12 }}>
            Backup & Restore
          </Text>

          <TouchableOpacity
            onPress={async () => {
              const success = await createBackup();
              alert(success ? 'Backup created successfully.' : 'Backup failed.');
            }}
            activeOpacity={0.85}
            style={{
              backgroundColor: isDark ? '#292929' : '#e0eaff',
              padding: 14,
              borderRadius: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: isDark ? '#444' : '#ccdfff',
            }}
          >
            <Text style={{ color: isDark ? '#fff' : '#003366', fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
              Backup Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const success = await restoreBackup();
              alert(success ? 'Data restored successfully. Please restart the app.' : 'No backup found.');
            }}
            activeOpacity={0.85}
            style={{
              backgroundColor: isDark ? '#292929' : '#fff2f2',
              padding: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? '#444' : '#f5cccc',
            }}
          >
            <Text style={{ color: isDark ? '#fff' : '#990000', fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
              Restore Data
            </Text>
          </TouchableOpacity>
        </Animatable.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
  },
});
