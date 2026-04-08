/**
 * ChatScreen - Main chat interface
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { ChatBubble, ChatInput, SuggestionChips, TypingIndicator } from '../components';
import { getAIEngine, ChatMessage } from '../services/AIEngine';
import { StorageService } from '../services/StorageService';
import { RootStackParamList } from '../../App';

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'What can you do?',
    'Help with cybersecurity',
    'Coding assistance',
    'Kurdish translation',
  ]);
  const flatListRef = useRef<FlatList>(null);
  const aiEngine = getAIEngine();

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await StorageService.loadChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        const welcomeMsg: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `👋 **Welcome to AI Assistant!**\n\n🤖 I have **${aiEngine.getModuleCount()} AI modules** running completely offline.\n\n**What I can help with:**\n🔒 Cybersecurity & Exploits\n📊 Trading & Finance\n💻 Code & Development\n🧠 Reasoning & Logic\n📝 Language Processing\n🎨 Creative Content\n📚 Knowledge & Memory\n🗣️ Kurdish Language\n\n💡 Tap a suggestion below or type your question!`,
          timestamp: Date.now(),
          module: 'LocalBrain',
        };
        setMessages([welcomeMsg]);
      }
    };
    loadHistory();
  }, []);

  // Configure navigation header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable onPress={() => navigation.navigate('Modules')} style={styles.headerBtn}>
            <Ionicons name="grid-outline" size={22} color="#e8e8e8" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Settings')} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color="#e8e8e8" />
          </Pressable>
        </View>
      ),
      headerLeft: () => (
        <Pressable onPress={handleClearChat} style={styles.headerBtn}>
          <Ionicons name="trash-outline" size={22} color="#e8e8e8" />
        </Pressable>
      ),
    });
  }, [navigation]);

  // Auto-save messages
  useEffect(() => {
    if (messages.length > 0) {
      StorageService.saveChatHistory(messages);
    }
  }, [messages]);

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            StorageService.saveChatHistory([]);
            setSuggestions([
              'What can you do?',
              'Help with cybersecurity',
              'Coding assistance',
              'Kurdish translation',
            ]);
          },
        },
      ]
    );
  };

  const handleSend = useCallback(async (text: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Process with AI engine
      const result = await aiEngine.processMessage(text);

      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
        module: result.module,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Update suggestions
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'system',
        content: '⚠️ An error occurred while processing your message. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [aiEngine]);

  const handleSuggestionSelect = (suggestion: string) => {
    handleSend(suggestion);
  };

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} showModule={true} />
  ), []);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {isProcessing && <TypingIndicator />}

      <SuggestionChips
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
      />

      <ChatInput
        onSend={handleSend}
        disabled={isProcessing}
        placeholder="Ask anything... 🤖"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    padding: 4,
  },
});
