// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import ReminderScreen from './screens/ReminderScreen';
import BackupRestoreScreen from './screens/BackupRestoreScreen';
import TestScreen from './screens/TestScreen';

import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();

/**
 * The main entry point of the application.
 * 
 * Renders the app's navigation structure wrapped with gesture handling and theming providers.
 * 
 * Navigation includes:
 * - AuthLoadingScreen: Initial loading/authentication check.
 * - LoginScreen: User login.
 * - HomeScreen: Main app content.
 * - BackupRestoreScreen: Backup and restore functionality.
 * - SignupScreen: User registration.
 * - FavoritesScreen: User's favorite items.
 * - ProfileScreen: User profile view.
 * - EditProfileScreen: Edit user profile.
 * - SettingsScreen: App settings.
 * - ReminderScreen: Reminders and notifications.
 * 
 * All screens are managed by a stack navigator with headers hidden.
 * 
 * @returns {JSX.Element} The root component of the app.
 */
export default function App() {
  return (
    // <NavigationContainer>
    //   <Stack.Navigator>
    //   <Stack.Screen name="Test" component={TestScreen} />
    // </Stack.Navigator>
    // </NavigationContainer>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='AuthLoading' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />    
            <Stack.Screen name="Login" component={LoginScreen} />      
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Reminder" component={ReminderScreen} /> 
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
