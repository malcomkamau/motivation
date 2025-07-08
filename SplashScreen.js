import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useThemeContext } from './context/ThemeContext';

export default function SplashScreen() {
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f8f8' }]}>
      <Animatable.Image
        animation="bounceIn"
        duration={1200}
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Animatable.Text
        animation="fadeInUp"
        delay={500}
        style={[
          styles.appName,
          { color: isDark ? '#fff' : '#222' },
        ]}
      >
        Daily Motivation
      </Animatable.Text>

      <ActivityIndicator size="large" color="#7f5af0" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
});
