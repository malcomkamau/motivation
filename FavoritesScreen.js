import React from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';

export default function FavoritesScreen({ route }) {
  const { favorites } = route.params;
  const { height } = Dimensions.get('window');

  const renderItem = ({ item }) => (
    <View style={{ height, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: '500' }}>{item}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {favorites.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
