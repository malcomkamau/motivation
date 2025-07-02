import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomAlert({ visible, title, message, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}>
        <View style={{
          width: '80%',
          backgroundColor: '#f6f0fc',
          borderRadius: 20,
          padding: 20,
          elevation: 5,
          alignItems: 'center'
        }}>
          <Ionicons name="alert-circle" size={40} color="#7f5af0" style={{ marginBottom: 10 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>{message}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: '#7f5af0', padding: 10, borderRadius: 10 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
