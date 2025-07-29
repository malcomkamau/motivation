import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { useThemeContext } from '../context/ThemeContext';
import { getFavorites, removeFavorite } from '../database/quotesDb';

/**
 * FavoritesScreen component displays a list of user's favorite quotes.
 * 
 * Features:
 * - Loads and displays favorite quotes from persistent storage.
 * - Allows users to share or remove quotes from their favorites.
 * - Supports pull-to-refresh to reload favorites.
 * - Adapts UI to light/dark themes.
 * - Shows an empty state when there are no favorites.
 * 
 * @example
 * // Usage in a navigator
 * <Stack.Screen name="Favorites" component={FavoritesScreen} />
 */
export default function FavoritesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  /**
   * Loads the current user's favorite items from storage and updates the state.
   * 
   * Retrieves the user's email from AsyncStorage, fetches the associated favorites
   * using `getFavorites`, and updates the favorites state with the result.
   * Handles errors by logging them to the console.
   */
  const loadFavorites = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('currentUser');
      if (!email) return;

      const stored = await getFavorites(email);
      setFavorites(stored || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, []);

  useEffect(() => {
    if (isFocused) loadFavorites();
  }, [isFocused, loadFavorites]);

  /**
   * Shares a quote using the device's native sharing functionality.
   *
   * @async
   * @function
   * @param {Object} quote - The quote object to share.
   * @param {string} quote.text - The text of the quote.
   * @param {string} [quote.author] - The author of the quote (optional).
   * @returns {Promise<void>} Resolves when the share action is completed.
   * @throws Will show an alert if sharing fails.
   */
  const handleShare = async (quote) => {
    try {
      const message = `${quote.text}\n\n— ${quote.author || 'Unknown'}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  /**
   * Removes a quote from the user's favorites.
   *
   * @async
   * @function handleRemove
   * @param {Object} quote - The quote object to remove from favorites.
   * @param {string|number} quote.id - The unique identifier of the quote.
   * @returns {Promise<void>} Resolves when the removal process is complete.
   *
   * @throws Will show an alert if the removal fails.
   */
  const handleRemove = async (quote) => {
    try {
      if (!quote?.id) return;
      setRemovingId(quote.id);

      const email = await AsyncStorage.getItem('currentUser');
      if (!email) return;

      await removeFavorite(email, quote.id);
      const updated = await getFavorites(email);
      setFavorites(updated);

      Toast.show({
        type: 'info',
        text1: 'Removed from Favorites',
      });
    } catch (err) {
      console.error('Remove error:', err);
      Alert.alert('Error', 'Failed to remove favorite.');
    } finally {
      setRemovingId(null);
    }
  };

  /**
   * Displays a confirmation alert to remove a favorite item.
   *
   * @param {Object} item - The favorite item to be removed.
   */
  const confirmRemove = (item) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this quote from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => handleRemove(item) },
      ]
    );
  };

  /**
   * Renders a single quote item card with quote text, author, and action buttons.
   *
   * @param {Object} param
   * @param {Object} param.item - The quote item to render.
   * @param {string} param.item.id - Unique identifier for the quote.
   * @param {string} param.item.text - The text of the quote.
   * @param {string} [param.item.author] - The author of the quote.
   * @returns {React.ReactElement} The rendered quote card component.
   */
  const renderItem = ({ item }) => (
    <View style={[styles.quoteCard, { backgroundColor: isDark ? '#1a1a1a' : '#fdfdff' }]}>
      <Text style={[styles.quoteText, { color: isDark ? '#fff' : '#222' }]}>{item.text}</Text>
      <Text style={[styles.authorText, { color: isDark ? '#aaa' : '#555' }]}>
        — {item.author || 'Unknown'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleShare(item)}
          style={styles.actionBtn}
          accessibilityLabel="Share quote"
        >
          <FontAwesome name="share-alt" size={22} color="#7f5af0" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => confirmRemove(item)}
          disabled={removingId === item.id}
          style={styles.actionBtn}
          accessibilityLabel="Remove quote from favorites"
        >
          <FontAwesome name="trash" size={22} color="red" />
          <Text style={[styles.actionText, { color: 'red' }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111' : '#fff' }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1a1a1a' : '#f6f0fc' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#7f5af0" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="star-o" size={42} color={isDark ? '#666' : '#aaa'} />
          <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#888' }]}>
            No favorites yet. Mark quotes to save them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadFavorites();
                setRefreshing(false);
              }}
              tintColor="#7f5af0"
            />
          }
        />
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    elevation: 2,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7f5af0',
  },
  quoteCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  authorText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 5,
    fontSize: 14,
    color: '#7f5af0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
