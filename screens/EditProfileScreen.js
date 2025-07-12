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
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import HeaderBar from '../components/HeaderBar';
import { useThemeContext } from '../context/ThemeContext';
import { getUser, saveUser } from '../database/userDb';

/**
 * EditProfileScreen component allows users to view and edit their profile information.
 * 
 * Features:
 * - Displays and allows editing of user's name, bio, and avatar.
 * - Email is displayed but not editable.
 * - Prompts user to confirm discarding unsaved changes when navigating away.
 * - Allows picking a new avatar image from the device's gallery.
 * - Saves updated profile information and provides feedback via Toast notifications.
 * - Adapts styles based on the current theme (dark or light).
 * 
 * Hooks:
 * - Uses React state and refs to manage form fields and original user data.
 * - Uses navigation listeners to handle unsaved changes.
 * - Uses context for theming.
 * 
 * @component
 * @returns {JSX.Element} The rendered EditProfileScreen component.
 */
export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);

  const originalUserRef = useRef(null); // 🛠️ new ref to always hold latest

  const emailRef = useRef();
  const bioRef = useRef();

  useEffect(() => {
    /**
     * Asynchronously loads the current user's profile data and updates the state variables.
     * Retrieves the user object using `getUser()`, then sets the name, email, bio, and avatar state.
     * Also updates the original user state and a ref for synchronization.
     *
     * @async
     * @function loadProfile
     * @returns {Promise<void>} Resolves when the profile data has been loaded and state updated.
     */
    const loadProfile = async () => {
      const user = await getUser();
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setBio(user.bio || '');
        setAvatar(user.avatar || null);
        setOriginalUser(user);
        originalUserRef.current = user; // sync ref
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    /**
     * Unsubscribes the navigation event listener for the 'beforeRemove' event.
     * Call this function to remove the listener and prevent memory leaks when the component unmounts.
     *
     * @function
     * @returns {void}
     */
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const original = originalUserRef.current;

      if (!original) return;

      const hasChanges =
        name !== original.name ||
        email !== original.email ||
        bio !== original.bio ||
        avatar !== original.avatar;

      if (!hasChanges) return;

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, name, email, bio, avatar]);

  /**
   * Prompts the user to pick an image from their device's media library.
   * Requests media library permissions if not already granted.
   * Allows the user to select and optionally edit an image (aspect ratio 1:1, quality 0.5).
   * Only accepts images with .jpg, .jpeg, or .png extensions.
   * Sets the selected image URI as the avatar if valid.
   * Displays alerts if permissions are denied, an invalid image is selected, or an error occurs.
   *
   * @async
   * @function pickImage
   * @returns {Promise<void>} Resolves when the image picking process is complete.
   */
  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        return Alert.alert('Permission required', 'Camera roll permission is needed.');
      }

      /**
       * Result object returned from ImagePicker.launchImageLibraryAsync.
       * @typedef {Object} ImagePickerResult
       * @property {boolean} cancelled - Indicates if the image picking was cancelled by the user.
       * @property {string} [uri] - The URI of the selected image (if not cancelled).
       * @property {Object} [assets] - Array of selected assets (if available, depending on Expo SDK version).
       * @property {number} [width] - The width of the selected image (if not cancelled).
       * @property {number} [height] - The height of the selected image (if not cancelled).
       * @property {string} [type] - The type of the selected media (e.g., 'image').
       */
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        if (!uri.match(/\.(jpg|jpeg|png)$/)) {
          Alert.alert('Invalid Image', 'Please select a JPG or PNG image.');
          return;
        }
        setAvatar(uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  /**
   * Handles saving the user's profile changes.
   * Validates that name and email are provided, updates the user profile,
   * shows success or error toasts, updates local state and ref, and navigates back on success.
   * Displays an error toast if saving fails.
   *
   * @async
   * @function handleSave
   * @returns {Promise<void>} Resolves when the save operation is complete.
   */
  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Name and Email are required',
      });
    }

    try {
      setIsSaving(true);

      const updatedUser = {
        ...originalUserRef.current,
        name,
        email,
        bio,
        avatar,
      };

      await saveUser(updatedUser);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Changes saved successfully.',
      });

      setOriginalUser(updatedUser);          // update state
      originalUserRef.current = updatedUser; // update ref

      navigation.goBack();
    } catch (err) {
      console.error('Update Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to save profile',
      });
    } finally {
      setIsSaving(false);
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
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={100} color="#7f5af0" />
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>
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
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderColor: isDark ? '#555' : '#ccc',
                color: isDark ? '#fff' : '#000',
              },
            ]}
          />

          <TextInput
            ref={emailRef}
            placeholder="Email"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={email}
            editable={false}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3',
                borderColor: isDark ? '#555' : '#ccc',
                color: isDark ? '#999' : '#555',
              },
            ]}
          />

          <Text style={{
            fontSize: 12,
            color: isDark ? '#888' : '#666',
            marginTop: -10,
            marginBottom: 10,
            marginLeft: 4,
          }}>
            Email cannot be changed
          </Text>


          <TextInput
            ref={bioRef}
            placeholder="Bio"
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            value={bio}
            onChangeText={setBio}
            multiline
            style={[
              styles.input,
              {
                height: 100,
                textAlignVertical: 'top',
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderColor: isDark ? '#555' : '#ccc',
                color: isDark ? '#fff' : '#000',
              },
            ]}
          />

          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
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
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#7f5af0',
    borderRadius: 20,
    padding: 5,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 6,
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
    flexDirection: 'row',
    backgroundColor: '#7f5af0',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
