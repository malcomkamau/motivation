import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';
import { getUserByEmail } from './userDb';

const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
        alert('Storage cleared!');
    } catch (err) {
        console.error('Error clearing AsyncStorage:', err);
    }
};

export default function LoginScreen() {
    const navigation = useNavigation();
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';

    const [emailRaw, setEmailRaw] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const email = emailRaw.trim().toLowerCase();

        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }

        try {
            const user = await getUserByEmail(email);

            if (!user) {
                Alert.alert('Login Failed', 'No account found with this email.');
                return;
            }

            if (user.password !== password) {
                Alert.alert('Login Failed', 'Incorrect password.');
                return;
            }

            await AsyncStorage.setItem('currentUser', user.email);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (err) {
            console.error('Login Error:', err);
            Alert.alert('Error', 'Something went wrong during login.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
            <HeaderBar title="Login" showBack={false} />

            <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
                <Text style={{
                    fontSize: 28,
                    marginBottom: 20,
                    textAlign: 'center',
                    color: isDark ? '#fff' : '#000',
                }}>
                    Welcome Back
                </Text>

                <TextInput
                    placeholder="Email"
                    value={emailRaw}
                    onChangeText={setEmailRaw}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={inputStyle(isDark)}
                    placeholderTextColor={isDark ? '#aaa' : '#888'}
                />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={inputStyle(isDark)}
                    placeholderTextColor={isDark ? '#aaa' : '#888'}
                />

                <TouchableOpacity
                    onPress={handleLogin}
                    style={{
                        backgroundColor: '#7f5af0',
                        padding: 15,
                        borderRadius: 10,
                        marginTop: 5,
                    }}
                >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
                </TouchableOpacity>

                    {/* Optional: Dev only */}
                {/*             
                    <TouchableOpacity onPress={clearStorage} style={{ marginTop: 20 }}>
                        <Text style={{ color: 'red', textAlign: 'center' }}>Clear AsyncStorage</Text>
                    </TouchableOpacity>
                */}

                <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: 'center', color: '#7f5af0' }}>
                        Don't have an account? Sign up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const inputStyle = (isDark) => ({
    borderWidth: 1,
    borderColor: isDark ? '#555' : '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: isDark ? '#fff' : '#000',
    backgroundColor: isDark ? '#1f1f1f' : '#fff',
});
