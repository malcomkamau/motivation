import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

import HeaderBar from '../components/HeaderBar';
import { useThemeContext } from '../context/ThemeContext';
import { getUserByEmail } from '../database/userDb';

/**
 * Asynchronously clears all data from AsyncStorage.
 * Displays an alert upon successful completion.
 * Logs an error to the console if clearing fails.
 *
 * @async
 * @function clearStorage
 * @returns {Promise<void>} Resolves when storage is cleared or logs an error if it fails.
 */
const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    alert('Storage cleared!');
  } catch (err) {
    console.error('Error clearing AsyncStorage:', err);
  }
};

/**
 * LoginScreen component provides a user interface for logging into the application.
 * 
 * Features:
 * - Accepts user email and password input.
 * - Validates input fields and displays alerts for missing or incorrect credentials.
 * - Authenticates user by checking credentials against stored user data.
 * - Stores the logged-in user's email in AsyncStorage upon successful login.
 * - Navigates to the Home screen after successful authentication.
 * - Provides navigation to the Signup screen for new users.
 * - Adapts UI based on the current theme (dark or light).
 * 
 * @component
 * @returns {JSX.Element} The rendered login screen component.
 */
export default function LoginScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [emailRaw, setEmailRaw] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handles the login process for a user.
   * 
   * - Trims and normalizes the email input.
   * - Validates that both email and password fields are filled.
   * - Attempts to retrieve the user by email.
   * - Checks if the user exists and if the password matches.
   * - Stores the current user's email in AsyncStorage upon successful login.
   * - Navigates to the 'Home' screen and resets the navigation stack.
   * - Displays appropriate alerts for missing fields, login failures, or errors.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleLogin = async () => {
    const email = emailRaw.trim().toLowerCase();

    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      const user = await getUserByEmail(email);

      if (!user) {
        Alert.alert('Login Failed', 'No account found with this email.');
        return;
      }

      if (user.password !== password) {
        Alert.alert('Login Failed', 'Incorrect password.');
        return;
      }

      await AsyncStorage.setItem('currentUser', user.email);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      console.error('Login Error:', err);
      Alert.alert('Error', 'Something went wrong during login.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
      <HeaderBar title="Login" showBack={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          <Animatable.Text
            animation="fadeInDown"
            delay={100}
            style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
          >
            Welcome Back
          </Animatable.Text>

          <Animatable.View animation="fadeInUp" delay={200} style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={emailRaw}
              onChangeText={setEmailRaw}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, inputStyle(isDark)]}
              placeholderTextColor={isDark ? '#aaa' : '#888'}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, inputStyle(isDark)]}
              placeholderTextColor={isDark ? '#aaa' : '#888'}
            />

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={clearStorage} style={{ marginTop: 20 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Clear AsyncStorage</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              style={{ marginTop: 20 }}
            >
              <Text style={{ textAlign: 'center', color: '#7f5af0' }}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const inputStyle = (isDark) => ({
  borderColor: isDark ? '#555' : '#ccc',
  color: isDark ? '#fff' : '#000',
  backgroundColor: isDark ? '#1f1f1f' : '#fff',
});

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: '#7f5af0',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
