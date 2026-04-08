/**
 * ModulesScreen - Browse and manage AI modules
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ModuleCard } from '../components';
import { getAIEngine, AIModule } from '../services/AIEngine';

export default function ModulesScreen() {
  const aiEngine = getAIEngine();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const modules = aiEngine.getModules();
  const categories = useMemo(() => {
    const cats = new Set(modules.map(m => m.category));
    return ['All', ...Array.from(cats).sort()];
  }, [modules]);

  const filteredModules = useMemo(() => {
    let filtered = modules;

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.keywords.some(k => k.includes(query)) ||
        m.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [modules, selectedCategory, searchQuery]);

  const handleToggle = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    aiEngine.toggleModule(name);
    setRefreshKey(prev => prev + 1);
  };

  const activeCount = aiEngine.getActiveModuleCount();
  const totalCount = aiEngine.getModuleCount();

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'All': '📋',
      'Language & NLP': '📝',
      'Kurdish Language': '🇰🇷',
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
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          🧩 {activeCount}/{totalCount} Active
        </Text>
        <Text style={styles.statsText}>
          📁 {filteredModules.length} Showing
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search modules..."
          placeholderTextColor="#666"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </Pressable>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.categoryChip,
              (selectedCategory === item || (!selectedCategory && item === 'All')) && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item === 'All' ? null : item)}
          >
            <Text style={styles.categoryChipIcon}>{getCategoryIcon(item)}</Text>
            <Text style={[
              styles.categoryChipText,
              (selectedCategory === item || (!selectedCategory && item === 'All')) && styles.categoryChipTextActive,
            ]}>
              {item}
            </Text>
          </Pressable>
        )}
        style={styles.categoryContainer}
      />

      {/* Module list */}
      <FlatList
        data={filteredModules}
        extraData={refreshKey}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <ModuleCard
            module={item}
            isActive={aiEngine.isModuleActive(item.name)}
            onToggle={handleToggle}
          />
        )}
        contentContainerStyle={styles.moduleList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  statsText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#e8e8e8',
    fontSize: 15,
    paddingVertical: 10,
  },
  categoryContainer: {
    maxHeight: 50,
    marginTop: 10,
  },
  categoryList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e2a3a',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderColor: '#6c63ff',
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#6c63ff',
  },
  moduleList: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
});
