/**
 * AboutScreen - App information and credits
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAIEngine } from '../services/AIEngine';

export default function AboutScreen() {
  const aiEngine = getAIEngine();
  const modulesByCategory = aiEngine.getModulesByCategory();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo and Title */}
      <View style={styles.header}>
        <Text style={styles.logo}>🤖</Text>
        <Text style={styles.title}>AI Assistant</Text>
        <Text style={styles.version}>Version 2.3.0</Text>
        <Text style={styles.subtitle}>
          Fully Offline AI • No External APIs
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{aiEngine.getModuleCount()}</Text>
          <Text style={styles.statLabel}>AI Modules</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{Object.keys(modulesByCategory).length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12,967</Text>
          <Text style={styles.statLabel}>Tests Pass</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Features</Text>
        <View style={styles.featureList}>
          {[
            { icon: '🔒', text: '100% Offline - No internet needed' },
            { icon: '🚫', text: 'No external APIs or cloud services' },
            { icon: '🔐', text: 'All data stays on your device' },
            { icon: '🧠', text: '120+ AI intelligence modules' },
            { icon: '📝', text: 'Natural language processing' },
            { icon: '🔍', text: 'Cybersecurity analysis tools' },
            { icon: '📊', text: 'Trading & financial analysis' },
            { icon: '💻', text: 'Code development assistance' },
            { icon: '🗣️', text: 'Kurdish language support' },
            { icon: '🎨', text: 'Creative content generation' },
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Module Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧩 Module Categories</Text>
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryCount}>{modules.length}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Technical Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Technical Details</Text>
        <View style={styles.techCard}>
          {[
            ['Platform', 'React Native + Expo'],
            ['Language', 'TypeScript'],
            ['AI Engine', 'Local Knowledge Base'],
            ['Storage', 'AsyncStorage (on-device)'],
            ['UI Framework', 'React Navigation'],
            ['Animations', 'Reanimated 3'],
            ['Network', 'None Required'],
            ['API Keys', 'None Required'],
          ].map(([label, value], idx) => (
            <View key={idx} style={styles.techRow}>
              <Text style={styles.techLabel}>{label}</Text>
              <Text style={styles.techValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* License */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 License</Text>
        <Text style={styles.licenseText}>
          This software is provided as-is for educational and research purposes.
          All AI processing happens locally on your device. No data is ever sent
          to external servers.
        </Text>
      </View>

      <Text style={styles.footer}>
        Built with ❤️ for offline AI
      </Text>
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
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    color: '#e8e8e8',
    fontSize: 28,
    fontWeight: 'bold',
  },
  version: {
    color: '#6c63ff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  statNumber: {
    color: '#6c63ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureList: {
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e2a3a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  categoryName: {
    color: '#ccc',
    fontSize: 14,
  },
  categoryBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryCount: {
    color: '#6c63ff',
    fontSize: 13,
    fontWeight: '600',
  },
  techCard: {
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  techLabel: {
    color: '#888',
    fontSize: 13,
  },
  techValue: {
    color: '#e8e8e8',
    fontSize: 13,
    fontWeight: '500',
  },
  licenseText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  footer: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    marginTop: 30,
    paddingBottom: 20,
  },
});
