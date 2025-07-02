import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import HeaderBar from './components/HeaderBar';
import { useThemeContext } from './context/ThemeContext';
import { getUser, saveUser } from './userDb';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);

  const emailRef = useRef();
  const bioRef = useRef();

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getUser();
      if (user) {
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.bio) setBio(user.bio);
        if (user.avatar) setAvatar(user.avatar);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission required', 'Camera roll permission is needed.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const oldUser = await getUser();
      const updatedUser = {
        ...oldUser,
        name: name || oldUser.name,
        email: email || oldUser.email,
        bio: bio || oldUser.bio,
        avatar: avatar || oldUser.avatar,
      };
      await saveUser(updatedUser);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: `Changes saved successfully.`,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Update Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error saving profile',
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff' }}>
      <HeaderBar title="Edit Profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={80} color="#7f5af0" />
            )}
          </TouchableOpacity>
          <Text style={{ fontWeight: '600', fontSize: 16, color: isDark ? '#fff' : '#333' }}>
            Tap to change photo
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current.focus()}
            style={[styles.input, {
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
              borderColor: isDark ? '#555' : '#ccc',
              color: isDark ? '#fff' : '#000',
            }]}
          />

          <TextInput
            ref={emailRef}
            placeholder="Email"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => bioRef.current.focus()}
            style={[styles.input, {
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
              borderColor: isDark ? '#555' : '#ccc',
              color: isDark ? '#fff' : '#000',
            }]}
          />

          <TextInput
            ref={bioRef}
            placeholder="Bio"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={bio}
            onChangeText={setBio}
            multiline
            style={[styles.input, {
              height: 100,
              textAlignVertical: 'top',
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
              borderColor: isDark ? '#555' : '#ccc',
              color: isDark ? '#fff' : '#000',
            }]}
          />

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: '#7f5af0',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
