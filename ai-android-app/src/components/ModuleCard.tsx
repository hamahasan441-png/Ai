/**
 * ModuleCard - Displays an AI module card
 */
import React, { memo } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
import { AIModule } from '../services/AIEngine';

interface ModuleCardProps {
  module: AIModule;
  isActive: boolean;
  onToggle: (name: string) => void;
}

function ModuleCardComponent({ module, isActive, onToggle }: ModuleCardProps) {
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Language & NLP': '📝',
      'Kurdish Language': '🗣️',
      'Reasoning & Logic': '🧠',
      'Knowledge & Memory': '📚',
      'Analysis & Decision': '📊',
      'Planning & Goals': '📋',
      'Code & Development': '💻',
      'Cybersecurity': '🔒',
      'Trading & Finance': '📈',
      'Creative': '🎨',
      'AI & Learning': '📖',
      'Meta-Intelligence': '🪞',
      'Integration': '🔗',
      'Context & Understanding': '🔍',
      'Search & Analysis': '🔎',
      'Quality': '✅',
    };
    return icons[category] || '🤖';
  };

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getCategoryIcon(module.category)}</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, !isActive && styles.nameInactive]}>
            {module.name}
          </Text>
          <Text style={styles.category}>{module.category}</Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={() => onToggle(module.name)}
          trackColor={{ false: '#3e3e5e', true: '#6c63ff' }}
          thumbColor={isActive ? '#ffffff' : '#888'}
        />
      </View>
      <Text style={[styles.description, !isActive && styles.descriptionInactive]}>
        {module.description}
      </Text>
      <View style={styles.keywords}>
        {module.keywords.slice(0, 4).map((keyword, idx) => (
          <View key={idx} style={styles.keywordTag}>
            <Text style={styles.keywordText}>{keyword}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cardInactive: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    color: '#e8e8e8',
    fontSize: 15,
    fontWeight: '600',
  },
  nameInactive: {
    color: '#888',
  },
  category: {
    color: '#6c63ff',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  description: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  descriptionInactive: {
    color: '#666',
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  keywordText: {
    color: '#8b83ff',
    fontSize: 11,
  },
});

export const ModuleCard = memo(ModuleCardComponent);
export default ModuleCard;
