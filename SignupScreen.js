import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderBar from './components/HeaderBar';
import { insertUser, getUserByEmail } from './userDb';
import { useThemeContext } from './context/ThemeContext';

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

      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
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
          style={{
            backgroundColor: '#7f5af0',
            padding: 15,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: '#7f5af0' }}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
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
