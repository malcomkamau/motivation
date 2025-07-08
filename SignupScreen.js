import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

import HeaderBar from './components/HeaderBar';
import { insertUser, getUserByEmail } from './userDb';
import { useThemeContext } from './context/ThemeContext';
import { ensureQuotesFetched } from './utils/ensureQuotesFetched';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [name, setName] = useState('');
  const [emailRaw, setEmailRaw] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const handleSignup = async () => {
    const email = emailRaw.trim().toLowerCase();

    if (!email || !password || !name) {
      Alert.alert('Missing Fields', 'Name, email, and password are required.');
      return;
    }

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert('Account Exists', 'An account with this email already exists.');
        return;
      }

      await insertUser({
        email,
        password,
        name,
        bio,
        preferences: []
      });

      await AsyncStorage.setItem('currentUser', email);
      await ensureQuotesFetched();
      Alert.alert('Success', 'Account created successfully!');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.error('Signup Error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
      <HeaderBar title="Sign Up" />

      <Animatable.View
        animation="fadeInUp"
        duration={500}
        style={{ flex: 1, padding: 20, justifyContent: 'center' }}
      >
        <Text style={{
          fontSize: 28,
          marginBottom: 20,
          textAlign: 'center',
          color: isDark ? '#fff' : '#000',
        }}>
          Create Account
        </Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={name}
          onChangeText={setName}
          style={inputStyle(isDark)}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={emailRaw}
          onChangeText={setEmailRaw}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle(isDark)}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={inputStyle(isDark)}
        />

        <TextInput
          placeholder="Short Bio (optional)"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={bio}
          onChangeText={setBio}
          multiline
          style={[inputStyle(isDark), { height: 80, textAlignVertical: 'top' }]}
        />

        <TouchableOpacity
          onPress={handleSignup}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#7f5af0',
            padding: 15,
            borderRadius: 12,
            marginTop: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: '#7f5af0' }}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const inputStyle = (isDark) => ({
  borderWidth: 1,
  borderColor: isDark ? '#555' : '#ccc',
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
  color: isDark ? '#fff' : '#000',
  backgroundColor: isDark ? '#1f1f1f' : '#fff',
});
