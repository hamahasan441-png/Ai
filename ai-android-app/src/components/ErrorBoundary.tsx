/**
 * ErrorBoundary - Catches and displays JavaScript errors gracefully
 * Prevents full app crashes and provides error recovery options.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to APKDebugger if available
    try {
      const { APKDebugger } = require('../services/APKDebugger');
      APKDebugger.getInstance().logError(error, errorInfo.componentStack || '');
    } catch {
      // APKDebugger not available, silently ignore
    }
  }

  handleRestart = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>
              The app encountered an unexpected error.
            </Text>

            <View style={styles.errorCard}>
              <Text style={styles.errorLabel}>Error:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
            </View>

            {this.state.errorInfo?.componentStack && (
              <View style={styles.errorCard}>
                <Text style={styles.errorLabel}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack.substring(0, 500)}
                </Text>
              </View>
            )}

            <Pressable style={styles.restartButton} onPress={this.handleRestart}>
              <Text style={styles.restartButtonText}>🔄 Try Again</Text>
            </Pressable>

            <Text style={styles.hint}>
              If the error persists, try clearing app data from Settings.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#e8e8e8',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorLabel: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    color: '#e8e8e8',
    fontSize: 14,
    lineHeight: 20,
  },
  stackText: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  restartButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ErrorBoundary;
