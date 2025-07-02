import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';
import { getUserByEmail } from './userDb';
import { getAvailableCategories, getQuotes } from './quotesDb';

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
        <View style={styles.container}>
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
        </View>

        {availableCategories.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themedColor,
              marginBottom: 12,
              paddingHorizontal: 20,
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
          </View>
        )}

        {/* Preferences Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: themedColor, marginBottom: 12 }}>
            Your Preferences
          </Text>

          {availableCategories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => toggleCategory(category)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: boxColor,
                borderWidth: 1,
                borderColor,
              }}
            >
              <Ionicons
                name={preferences.includes(category) ? 'checkbox' : 'square-outline'}
                size={22}
                color="#7f5af0"
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: themedColor }}>
                {capitalize(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
