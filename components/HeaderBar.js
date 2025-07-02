import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useThemeContext } from '../context/ThemeContext';

export default function HeaderBar({ title, rightIcon, onRightPress }) {
    const navigation = useNavigation();
    const { currentTheme } = useThemeContext();

    const statusBarStyle = currentTheme === 'dark' ? 'light' : 'dark';

    return (
        <>
            <StatusBar style={statusBarStyle} backgroundColor={currentTheme === 'dark' ? '#121212' : '#f6f0fc'} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 50,
                paddingBottom: 10,
                paddingHorizontal: 20,
                backgroundColor: currentTheme === 'dark' ? '#121212' : '#f6f0fc',
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#7f5af0" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7f5af0' }}>{title}</Text>
                </View>

                {rightIcon && (
                    <TouchableOpacity onPress={onRightPress}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}
