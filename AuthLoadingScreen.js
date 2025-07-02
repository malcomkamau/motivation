import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import { fetchQuotesFromAPI } from './fetchQuotesFromAPI';
import { getQuotes, saveQuotes } from './quotesDb';

export default function AuthLoadingScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingForInternet, setIsWaitingForInternet] = useState(false);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(null);

  const proceedToApp = async () => {
    const email = await AsyncStorage.getItem('currentUser');
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: email ? 'Home' : 'Login' }] });
    }, 1000);
  };

  const fetchAndStoreQuotes = async () => {
    setIsLoading(true);
    try {
      const storedQuotes = await getQuotes();
      const quoteCount = storedQuotes.length;

      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected;

      if (quoteCount < 100 && isConnected) {
        console.log(`📉 Only ${quoteCount} quotes. Fetching more...`);
        const fetched = await fetchQuotesFromAPI();
        const updated = [...storedQuotes, ...fetched];
        const finalQuotes = updated.length > 100 ? fetched : updated;
        await saveQuotes(finalQuotes);
      }

      if (!isConnected && quoteCount === 0) {
        Alert.alert('Offline', 'No internet connection and no stored quotes.');
        setIsWaitingForInternet(true);
        setIsLoading(false);
        return;
      }

      // Show quote of the day if offline
      if (!isConnected && quoteCount > 0) {
        const fallback = storedQuotes[Math.floor(Math.random() * storedQuotes.length)];
        setQuoteOfTheDay(fallback);
        setIsWaitingForInternet(true);
        setIsLoading(false);
        return;
      }

      setIsWaitingForInternet(false);
      proceedToApp();
    } catch (err) {
      console.error('❌ Startup error:', err);
      Alert.alert('Error', 'Something went wrong during app initialization.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndStoreQuotes();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isWaitingForInternet) {
        console.log('🔄 Reconnected. Retrying...');
        fetchAndStoreQuotes();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Motivation</Text>

      {quoteOfTheDay && (
        <>
          <Text style={styles.subtitle}>Offline Mode – Quote of the Day:</Text>
          <Text style={styles.quoteText}>"{quoteOfTheDay.text}"</Text>
          <Text style={styles.authorText}>— {quoteOfTheDay.author || 'Unknown'}</Text>
        </>
      )}

      {!quoteOfTheDay && (
        <Text style={styles.subtitle}>
          {isWaitingForInternet ? 'You’re offline with no stored quotes.' : 'Preparing your day...'}
        </Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#7f5af0" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.retryButton} onPress={fetchAndStoreQuotes}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 20,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  authorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#7f5af0',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
