/**
 * SettingsScreen - App settings and preferences
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { StorageService, AppSettings } from '../services/StorageService';
import { getAIEngine } from '../services/AIEngine';
import { RootStackParamList } from '../../App';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    fontSize: 16,
    hapticFeedback: true,
    autoScroll: true,
    showModuleInfo: true,
    maxHistorySize: 1000,
  });
  const [storageInfo, setStorageInfo] = useState({ keys: 0, totalSize: '0 B' });

  const aiEngine = getAIEngine();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await StorageService.loadSettings();
    setSettings(loaded);
    const info = await StorageService.getStorageInfo();
    setStorageInfo(info);
  };

  const updateSetting = async (key: keyof AppSettings, value: boolean | number | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all chat history, settings, and cached data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Done', 'All data has been cleared.');
            loadSettings();
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3e3e5e', true: '#6c63ff' }}
        thumbColor={value ? '#ffffff' : '#888'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Engine</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Modules</Text>
            <Text style={styles.infoValue}>{aiEngine.getModuleCount()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Modules</Text>
            <Text style={styles.infoValue}>{aiEngine.getActiveModuleCount()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>2.3.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={[styles.infoValue, styles.offlineBadge]}>🟢 Fully Offline</Text>
          </View>
        </View>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Display</Text>
        <SettingRow
          icon="🌙"
          title="Dark Mode"
          subtitle="Use dark theme (recommended)"
          value={settings.darkMode}
          onToggle={() => updateSetting('darkMode', !settings.darkMode)}
        />
        <SettingRow
          icon="🧩"
          title="Show Module Info"
          subtitle="Display which AI module answered"
          value={settings.showModuleInfo}
          onToggle={() => updateSetting('showModuleInfo', !settings.showModuleInfo)}
        />
      </View>

      {/* Interaction Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Interaction</Text>
        <SettingRow
          icon="📳"
          title="Haptic Feedback"
          subtitle="Vibration on interactions"
          value={settings.hapticFeedback}
          onToggle={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
        />
        <SettingRow
          icon="⬇️"
          title="Auto Scroll"
          subtitle="Auto-scroll to new messages"
          value={settings.autoScroll}
          onToggle={() => updateSetting('autoScroll', !settings.autoScroll)}
        />
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💾 Storage</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stored Items</Text>
            <Text style={styles.infoValue}>{storageInfo.keys}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Size</Text>
            <Text style={styles.infoValue}>{storageInfo.totalSize}</Text>
          </View>
        </View>
        <Pressable style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </Pressable>
      </View>

      {/* About */}
      <Pressable
        style={styles.aboutButton}
        onPress={() => navigation.navigate('About')}
      >
        <Ionicons name="information-circle-outline" size={20} color="#6c63ff" />
        <Text style={styles.aboutButtonText}>About AI Assistant</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </Pressable>

      <Pressable
        style={[styles.aboutButton, styles.debugButton]}
        onPress={() => navigation.navigate('Debug')}
      >
        <Ionicons name="bug-outline" size={20} color="#fbbf24" />
        <Text style={styles.aboutButtonText}>🐛 APK Debugger</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#e8e8e8',
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  infoValue: {
    color: '#e8e8e8',
    fontSize: 14,
    fontWeight: '600',
  },
  offlineBadge: {
    color: '#4ade80',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  dangerButtonText: {
    color: '#ff4444',
    fontSize: 15,
    fontWeight: '600',
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 10,
  },
  aboutButtonText: {
    flex: 1,
    color: '#e8e8e8',
    fontSize: 15,
    fontWeight: '500',
  },
  debugButton: {
    marginTop: 8,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
});
