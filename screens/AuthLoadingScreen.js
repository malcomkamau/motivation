import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { fetchQuotesFromAPI } from '../utils/fetchQuotesFromAPI';
import { getQuotes } from '../database/quotesDb';
import { useThemeContext } from '../context/ThemeContext';
import { backupExists, restoreBackup } from '../utils/BackupService';

/**
 * AuthLoadingScreen is a React functional component that handles the initial loading and authentication flow of the app.
 * 
 * - Checks if the app is launched for the first time and prompts for backup restoration if needed.
 * - Fetches motivational quotes from local storage or an API, and displays a random quote as a loading screen.
 * - Handles offline scenarios by displaying stored quotes if available, or prompts the user to retry when online.
 * - Navigates to the appropriate screen ('Home', 'Login', or 'BackupRestore') based on user state and backup existence.
 * - Animates UI elements for a smooth user experience.
 * 
 * @function
 * @returns {JSX.Element} The rendered loading/authentication screen.
 */
export default function AuthLoadingScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingForInternet, setIsWaitingForInternet] = useState(false);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  /**
   * Navigates the user to the appropriate screen based on authentication status.
   * Retrieves the current user's email from AsyncStorage. If an email is found,
   * navigates to the 'Home' screen; otherwise, navigates to the 'Login' screen.
   * Resets the navigation stack to prevent going back to the previous screens.
   *
   * @async
   * @function proceedToApp
   * @returns {Promise<void>} Resolves when navigation is complete.
   */
  const proceedToApp = async () => {
    const email = await AsyncStorage.getItem('currentUser');
    navigation.reset({ index: 0, routes: [{ name: email ? 'Home' : 'Login' }] });
  };

  /**
   * Fetches motivational quotes from local storage and, if necessary and possible, from an external API.
   * 
   * - Sets loading state while processing.
   * - Checks for stored quotes and network connectivity.
   * - If connected and fewer than 500 quotes are stored, fetches more quotes from the API.
   * - Selects a random quote from stored quotes to display as the "quote of the day".
   * - Handles offline and error scenarios with appropriate alerts and state updates.
   * 
   * @async
   * @function fetchAndStoreQuotes
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  const fetchAndStoreQuotes = async () => {
    setIsLoading(true);
    try {
      const storedQuotes = await getQuotes();
      const quoteCount = storedQuotes.length;

      console.log("Stored quotes: ", quoteCount);

      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected;

      if (isConnected && quoteCount < 500) {
        await fetchQuotesFromAPI(); // Auto-saves
      }

      if (quoteCount > 0) {
        const fallback = storedQuotes[Math.floor(Math.random() * storedQuotes.length)];
        setQuoteOfTheDay(fallback);
        fadeIn();
        setIsWaitingForInternet(!isConnected);
        setTimeout(proceedToApp, 1800);
      } else if (!isConnected) {
        Alert.alert('Offline', 'No internet connection and no stored quotes.');
        setIsWaitingForInternet(true);
        setIsLoading(false);
      }

    } catch (err) {
      console.error('Startup error:', err);
      Alert.alert('Error', 'Something went wrong during app initialization.');
      setIsLoading(false);
    }
  };

  /**
   * Triggers a fade-in animation by animating the `fadeAnim` value to 1 over 800 milliseconds.
   * Uses the native driver for better performance.
   *
   * @function
   * @returns {void}
   */
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');

        // Run backup check only once on first launch
        if (!hasLaunched) {
          await AsyncStorage.setItem('hasLaunched', 'true');
          const exists = await backupExists();

          if (exists) {
            navigation.reset({ index: 0, routes: [{ name: 'BackupRestore' }] });
            return;
          }
        }


        fetchAndStoreQuotes(); // Proceed normally if not first launch or no backup

      } catch (e) {
        console.error('Init error:', e);
        Alert.alert('Error', 'Something went wrong during startup.');
        setIsLoading(false);
      }
    };

    initializeApp();

    /**
     * Unsubscribes from the network state change listener.
     * Call this function to remove the event listener registered by NetInfo.addEventListener,
     * preventing memory leaks and unnecessary updates when the component unmounts or the listener is no longer needed.
     *
     * @function
     */
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isWaitingForInternet) {
        fetchAndStoreQuotes();
      }
    });

    return () => unsubscribe();
  }, []);


  const bg = isDark ? '#121212' : '#fff';
  const fg = isDark ? '#fff' : '#000';
  const secondary = isDark ? '#aaa' : '#555';
  const cardBg = isDark ? '#1f1f1f' : '#f1ecff';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Animatable.Text
        animation="fadeInDown"
        duration={800}
        style={[styles.title, { color: fg }]}
      >
        Daily Motivation
      </Animatable.Text>

      <Animatable.Text
        animation="fadeInUp"
        delay={200}
        style={[styles.subtitle, { color: secondary }]}
      >
        {isWaitingForInternet ? 'You’re offline. Loading what we can...' : 'Getting you inspired...'}
      </Animatable.Text>

      {quoteOfTheDay && (
        <Animated.View style={[styles.quoteCard, { opacity: fadeAnim, backgroundColor: cardBg }]}>
          <Text style={[styles.quoteText, { color: fg }]}>
            "{quoteOfTheDay.text}"
          </Text>
          <Text style={[styles.authorText, { color: secondary }]}>
            — {quoteOfTheDay.author || 'Unknown'}
          </Text>
        </Animated.View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#7f5af0" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.retryButton} onPress={fetchAndStoreQuotes}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}> Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  authorText: {
    fontSize: 15,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#7f5af0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
