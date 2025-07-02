// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');
  const [isReady, setIsReady] = useState(false);

  const systemColorScheme = Appearance.getColorScheme(); // 'light' or 'dark'

  const getCurrentTheme = () => {
    return theme === 'system' ? systemColorScheme : theme;
  };

  const setTheme = async (newTheme) => {
    await AsyncStorage.setItem('themePreference', newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) setThemeState(savedTheme);
      setIsReady(true);
    };
    loadTheme();
  }, []);

  if (!isReady) return null; // Prevents flicker

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme: getCurrentTheme() }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
