/**
 * ChatBubble - Renders a single chat message
 */
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ChatMessage } from '../services/AIEngine';

interface ChatBubbleProps {
  message: ChatMessage;
  showModule?: boolean;
}

function ChatBubbleComponent({ message, showModule = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleLongPress = async () => {
    await Clipboard.setStringAsync(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <Pressable onLongPress={handleLongPress} style={styles.pressable}>
      <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {!isUser && showModule && message.module && (
            <View style={styles.moduleTag}>
              <Text style={styles.moduleText}>🧩 {message.module}</Text>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.assistantTimeText]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: '100%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#6c63ff',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1e2a3a',
    borderBottomLeftRadius: 4,
  },
  moduleTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  moduleText: {
    color: '#8b83ff',
    fontSize: 11,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#e0e0e0',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimeText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  assistantTimeText: {
    color: 'rgba(255,255,255,0.4)',
  },
  systemContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  systemText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export const ChatBubble = memo(ChatBubbleComponent);
export default ChatBubble;
