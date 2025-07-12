// HomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, Dimensions, TouchableOpacity,
    Modal, Pressable, Share, Alert, Image, RefreshControl, Animated
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { useThemeContext } from '../context/ThemeContext';
import {
    getFavorites, addFavorite, removeFavorite,
    getQuotes
} from '../database/quotesDb';
import { getUserByEmail } from '../database/userDb';

export default function HomeScreen() {
    const { height } = Dimensions.get('window');
    const navigation = useNavigation();
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const isFocused = useIsFocused();

    const [modalVisible, setModalVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentQuote(viewableItems[0].item);
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }).current;

    const flatListRef = useRef(null);

    const shuffleArray = (arr) =>
        arr
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

    const loadData = async () => {
        try {
            const email = await AsyncStorage.getItem('currentUser');
            setUserEmail(email);

            const user = await getUserByEmail(email);
            if (user?.avatar) setAvatar(user.avatar);

            const storedQuotes = await getQuotes();
            const storedFavorites = email ? await getFavorites(email) : [];

            const prefKey = `preferences_${email}`;
            const storedPrefs = await AsyncStorage.getItem(prefKey);
            const preferences = storedPrefs
                ? JSON.parse(storedPrefs).map(p => p.toLowerCase())
                : [];

            let filteredQuotes =
                preferences.length === 0
                    ? storedQuotes
                    : storedQuotes.filter(q => preferences.includes(q.category));

            let shuffled = shuffleArray(filteredQuotes);

            if (shuffled.length > 100) shuffled = shuffled.slice(0, 100);

            if (shuffled.length === 0) {
                Alert.alert(
                    'No Quotes Found',
                    'Your current preferences returned no results. Try changing them in your profile.'
                );
            }

            setFavorites(storedFavorites || []);
            setQuotes(shuffled || []);
            setCurrentQuote(shuffled[0] || null);

        } catch (err) {
            console.error('Error loading data:', err);
            Alert.alert('Error', 'Failed to load quotes.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (isFocused) {
            loadData();
            // registerForPushNotificationsAsync();
        }
    }, [isFocused]);

    const handleShare = async () => {
        try {
            const message = currentQuote
                ? `"${currentQuote.text}"\n— ${currentQuote.author || 'Unknown'}\n\nShared from Motivation App`
                : '';
            await Share.share({ message });
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const toggleFavorite = async () => {
        if (!userEmail || !currentQuote) return;

        const isFavorite = favorites.some(q => q.id === currentQuote.id);
        if (isFavorite) {
            await removeFavorite(userEmail, currentQuote.id);
        } else {
            await addFavorite(userEmail, currentQuote);
        }

        const updatedFavorites = await getFavorites(userEmail);
        setFavorites(updatedFavorites || []);

        Toast.show({
            type: isFavorite ? 'info' : 'success',
            text1: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        });
    };

    const themedColor = isDark ? '#fff' : '#000';
    const bgColor = isDark ? '#121212' : '#f6f0fc';

    const renderItem = ({ item }) => (
        <Animated.View style={{
            opacity: fadeAnim,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 40,
        }}>
            <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: '500', color: themedColor }}>{item.text}</Text>
            <Text style={{ fontSize: 16, marginTop: 10, fontStyle: 'italic', textAlign: 'center', color: isDark ? '#aaa' : '#555' }}>— {item.author || 'Unknown'}</Text>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, backgroundColor: bgColor, borderBottomWidth: 1, borderBottomColor: isDark ? '#444' : '#ddd' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7f5af0' }}>Motivation</Text>
                <TouchableOpacity onPress={() => setProfileMenuVisible(true)}>
                    {avatar ? <Image source={{ uri: avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} /> : <Ionicons name="person-circle-outline" size={32} color="#7f5af0" />}
                </TouchableOpacity>
            </View>

            {/* Quotes */}
            <FlatList
                ref={flatListRef}
                data={quotes}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#7f5af0'} colors={[isDark ? '#fff' : '#7f5af0']} />}
            />

            {/* Favorite & Share */}
            <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: isDark ? '#1e1e1e' : '#fff', borderRadius: 30, flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 8, width: '90%', justifyContent: 'space-evenly' }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => setModalVisible(true)}>
                    <FontAwesome name="share-alt" size={22} color={themedColor} />
                    <Text style={{ fontSize: 12, color: themedColor, marginTop: 4 }}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleFavorite}>
                    <FontAwesome name={favorites.some(q => q.id === currentQuote?.id) ? 'heart' : 'heart-o'} size={22} color={favorites.some(q => q.id === currentQuote?.id) ? 'red' : themedColor} />
                    <Text style={{ fontSize: 12, color: favorites.some(q => q.id === currentQuote?.id) ? 'red' : themedColor, marginTop: 4 }}>{favorites.some(q => q.id === currentQuote?.id) ? 'Saved' : 'Favorite'}</Text>
                </TouchableOpacity>
            </View>

            {/* Share Modal */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setModalVisible(false)}>
                    <View style={{ width: '80%', backgroundColor: bgColor, padding: 20, borderRadius: 24, elevation: 5 }}>
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <FontAwesome name="share-alt" size={24} color={themedColor} />
                            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10, color: themedColor }}>Share with friends</Text>
                        </View>
                        <Text style={{ textAlign: 'center', marginVertical: 10, color: themedColor }}>{currentQuote?.text}</Text>
                        <Text style={{ textAlign: 'center', fontStyle: 'italic', color: isDark ? '#aaa' : '#555' }}>— {currentQuote?.author || 'Unknown'}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                            <Pressable onPress={handleShare} style={{ backgroundColor: isDark ? '#333' : '#e5d7fc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
                                <Text style={{ color: themedColor }}>Share</Text>
                            </Pressable>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#7f5af0', padding: 10 }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Profile Dropdown */}
            <Modal visible={profileMenuVisible} transparent animationType="fade" onRequestClose={() => setProfileMenuVisible(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setProfileMenuVisible(false)}>
                    <View style={{ position: 'absolute', top: 90, right: 20, backgroundColor: bgColor, borderRadius: 10, paddingVertical: 10, width: 180, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
                        <Pressable onPress={() => { setProfileMenuVisible(false); navigation.navigate('Profile'); }} style={{ padding: 12 }}>
                            <Text style={{ color: themedColor }}>View Profile</Text>
                        </Pressable>
                        <Pressable onPress={() => { setProfileMenuVisible(false); navigation.navigate('Favorites'); }} style={{ padding: 12 }}>
                            <Text style={{ color: themedColor }}>Favorites</Text>
                        </Pressable>
                        <Pressable onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }} style={{ padding: 12 }}>
                            <Text style={{ color: themedColor }}>Settings</Text>
                        </Pressable>
                        <Pressable onPress={async () => { await AsyncStorage.removeItem('currentUser'); setProfileMenuVisible(false); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} style={{ padding: 12 }}>
                            <Text style={{ color: 'red' }}>Logout</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <Toast />
        </View>
    );
}
