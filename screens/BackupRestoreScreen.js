// BackupRestoreScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { restoreBackup } from '../utils/BackupService';

/**
 * BackupRestoreScreen is a React component that displays a UI for restoring a user's backup data.
 * 
 * - Shows an option to restore a previously found backup or skip the process.
 * - Handles loading state during the restore operation.
 * - Navigates to 'AuthLoading' on successful restore, or 'Signup' if skipped.
 * - Alerts the user if the restore operation fails.
 */
export default function BackupRestoreScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);

  /**
   * Handles the restore backup process.
   * Sets loading state, attempts to restore backup, and navigates or alerts based on the result.
   */
  const handleRestore = async () => {
    setLoading(true);
    const success = await restoreBackup();
    setLoading(false);

    if (success) {
      navigation.reset({ index: 0, routes: [{ name: 'AuthLoading' }] });
    } else {
      alert('Failed to restore backup.');
    }
  };

  /**
   * Navigates to the 'Signup' screen by resetting the navigation stack.
   * This effectively skips the current flow and starts fresh at the 'Signup' screen.
   */
  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Signup' }] });
  };

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-download-outline" size={70} color="#7f5af0" style={{ marginBottom: 30 }} />

      <Text style={styles.title}>Backup Found</Text>
      <Text style={styles.subtitle}>Would you like to restore your previous data?</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7f5af0" style={{ marginTop: 30 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}> Restore Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/**
 * Styles for the BackupRestoreScreen component.
 *
 * @property {object} container - Main container style with centered content, padding, and background color.
 * @property {object} title - Style for the main title text, including font size, weight, color, and margin.
 * @property {object} subtitle - Style for the subtitle text, with font size, color, alignment, and margin.
 * @property {object} restoreButton - Style for the restore button, including background color, padding, border radius, and alignment.
 * @property {object} buttonText - Style for the text inside buttons, with color and font size.
 * @property {object} skipButton - Style for the skip button, with padding.
 * @property {object} skipText - Style for the skip button text, including font size, color, and underline decoration.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7f5af0',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  restoreButton: {
    flexDirection: 'row',
    backgroundColor: '#7f5af0',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'underline',
  },
});
