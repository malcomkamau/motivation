import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Modal, Pressable, Share } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const quotes = [
    "Chase sunsets.\nSwing from the moon.\nSprinkle stardust.\nMake your world magical.",
    "Believe you can and you're halfway there.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Every sunrise is an invitation to brighten someone’s day.",
    "Grow through what you go through.",
    "You are stronger than your strongest excuse.",
    "Even the stars were once just dust willing to shine.",
    "Progress, not perfection.",
    "Let your courage roar louder than your fear.",
    "Dreams don't work unless you do.",
    "Turn your can'ts into cans and your dreams into plans.",
    "Your vibe attracts your tribe.",
    "Start where you are. Use what you have. Do what you can.",
    "You are made of stardust and strength.",
    "Some days you just have to create your own sunshine.",
    "The comeback is always stronger than the setback.",
    "Make it happen. Shock everyone.",
    "Rise. Recharge. Radiate.",
    "Do it with passion or not at all.",
    "You’ve survived 100% of your worst days. You’ve got this."
];


export default function HomeScreen() {
    const renderItem = ({ item }) => (
        <View style={{
            height,                  // take full screen height
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 40,

        }}>
            <Text style={{
                fontSize: 24,
                textAlign: 'center',
                fontWeight: '500',
                color: '#333'
            }}>
                {item}
            </Text>
        </View>
    );

    const { height } = Dimensions.get('window');
    const [modalVisible, setModalVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);
    const [favorites, setFavorites] = useState([]);
    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const navigation = useNavigation();

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentQuote(viewableItems[0].item);
        }
    }).current;

    const handleShare = async () => {
        try {
            await Share.share({ message: currentQuote });
            setModalVisible(false);
        } catch (error) {
            alert('Error sharing: ' + error.message);
        }
    };

    const toggleFavorite = () => {
        if (favorites.includes(currentQuote)) {
            setFavorites(favorites.filter(q => q !== currentQuote));
        } else {
            setFavorites([...favorites, currentQuote]);
        }
    };


    return (
        <View style={{ flex: 1 }}>
            {/* Top Bar */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 50,
                paddingBottom: 10,
                backgroundColor: '#f6f0fc',
                borderBottomWidth: 1,
                borderBottomColor: '#ddd'
            }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7f5af0' }}>Motivation</Text>

                {/* Avatar */}
                <TouchableOpacity onPress={() => setProfileMenuVisible(true)}>
                    <Ionicons name="person-circle-outline" size={32} color="#7f5af0" />
                </TouchableOpacity>
            </View>



            {/* Swipeable Quotes */}
            <FlatList
                data={quotes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{ flexGrow: 1 }}
            />



            {/* Bottom Navigation */}
            <View style={{
                position: 'absolute',
                bottom: 30,
                alignSelf: 'center',
                backgroundColor: '#f6f0fc',
                borderRadius: 50,
                padding: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: 300
            }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
                    setModalVisible(true);
                }}>
                    <FontAwesome name="share-alt" size={24} color="black" />
                    <Text>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleFavorite}>
                    <FontAwesome
                        name={favorites.includes(currentQuote) ? 'heart' : 'heart-o'}
                        size={24}
                        color={favorites.includes(currentQuote) ? 'red' : 'black'}
                    />
                    <Text>Favorite</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={() => navigation.navigate('Favorites', { favorites })}
                >
                    <Ionicons name="settings-outline" size={24} color="black" />
                    <Text>Favorites</Text>
                </TouchableOpacity>

            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}>
                    <View style={{
                        width: '80%',
                        backgroundColor: '#f6f0fc',
                        padding: 20,
                        borderRadius: 24,
                        elevation: 5
                    }}>
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <FontAwesome name="share-alt" size={24} color="black" />
                            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Share with friends</Text>
                        </View>

                        <Text style={{ textAlign: 'center', marginVertical: 10 }}>{currentQuote}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                            <Pressable
                                onPress={handleShare}
                                style={{
                                    backgroundColor: '#e5d7fc',
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 20
                                }}>
                                <Text style={{ color: 'black' }}>Share</Text>
                            </Pressable>

                            <Pressable onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#7f5af0', padding: 10 }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={profileMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setProfileMenuVisible(false)}
            >
                <Pressable
                    onPress={() => setProfileMenuVisible(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                >
                    <View style={{
                        position: 'absolute',
                        top: 90,
                        right: 20,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        paddingVertical: 10,
                        width: 180,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5
                    }}>
                        <Pressable onPress={() => {
                            setProfileMenuVisible(false);
                            navigation.navigate('Profile');
                        }} style={{ padding: 12 }}>
                            <Text>View Profile</Text>
                        </Pressable>

                        <Pressable onPress={() => {
                            setProfileMenuVisible(false);
                            // Add logic here
                        }} style={{ padding: 12 }}>
                            <Text>Settings</Text>
                        </Pressable>

                        <Pressable onPress={() => {
                            setProfileMenuVisible(false);
                            // Add logout logic here
                        }} style={{ padding: 12 }}>
                            <Text style={{ color: 'red' }}>Logout</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>


        </View>
    );
}
