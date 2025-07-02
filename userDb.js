// userDb.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'currentUser';

// Save or update user profile
export const saveUser = async (user) => {
  try {
    if (!user.email) throw new Error('User must have an email');
    await AsyncStorage.setItem(`user_${user.email}`, JSON.stringify(user));
    await AsyncStorage.setItem(CURRENT_USER_KEY, user.email);
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

// Get currently logged-in user
export const getUser = async () => {
  try {
    const email = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!email) return null;
    const userData = await AsyncStorage.getItem(`user_${email}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to load user:', error);
    return null;
  }
};

// Get user by email (used internally)
export const getUserByEmail = async (email) => {
  try {
    const data = await AsyncStorage.getItem(`user_${email}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get User Error:', error);
    throw error;
  }
};

// Update only specified fields of current user
export const updateUser = async (changes) => {
  try {
    const current = await getUser();
    if (!current) return;
    const updated = { ...current, ...changes };
    await saveUser(updated);
  } catch (error) {
    console.error('Update User Error:', error);
  }
};

// Delete current user profile
export const deleteUser = async () => {
  try {
    const email = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (email) {
      await AsyncStorage.removeItem(`user_${email}`);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
  }
};

// For setting initial user data after signup (alias of saveUser)
export const insertUser = saveUser;
