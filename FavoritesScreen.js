import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useThemeContext } from './context/ThemeContext';
import { getFavorites, removeFavorite } from './quotesDb';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';
  const { height } = Dimensions.get('window');

  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleShare = async (quote) => {
    try {
      const message = `${quote.text}\n\n— ${quote.author || 'Unknown'}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRemove = async (quote) => {
    try {
      if (!quote?.id) {
        Alert.alert('Error', 'This quote cannot be removed.');
        return;
      }

      const email = await AsyncStorage.getItem('currentUser');
      if (!email) return;

      await removeFavorite(email, quote.id);
      const updated = await getFavorites(email);
      setFavorites(updated);
    } catch (err) {
      console.error('Error removing favorite:', err);
      Alert.alert('Error', 'Failed to remove favorite.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.quoteContainer, { height }]}>
      <Text style={[styles.quoteText, { color: isDark ? '#fff' : '#333' }]}>
        {item.text}
      </Text>
      <Text style={{
        fontSize: 16,
        marginTop: 10,
        fontStyle: 'italic',
        color: isDark ? '#aaa' : '#555',
        textAlign: 'center'
      }}>
        — {item.author || 'Unknown'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionBtn}>
          <FontAwesome name="share-alt" size={22} color="#7f5af0" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleRemove(item)} style={styles.actionBtn}>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7f5af0" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {/* Quote List */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#888' }]}>
            No favorites yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={async () => {
              setRefreshing(true);
              await loadFavorites();
              setRefreshing(false);
            }} tintColor="#7f5af0" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f5af0',
  },
  quoteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quoteText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    marginHorizontal: 10,
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
  },
  emptyText: {
    fontSize: 18,
  },
});
