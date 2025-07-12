// BackupRestoreScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { restoreBackup } from '../utils/BackupService';

export default function BackupRestoreScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);

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
