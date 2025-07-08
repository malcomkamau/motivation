// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import SettingsScreen from './SettingsScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import AuthLoadingScreen from './AuthLoadingScreen';
import ReminderScreen from './ReminderScreen';
import BackupRestoreScreen from './BackupRestoreScreen';

import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
