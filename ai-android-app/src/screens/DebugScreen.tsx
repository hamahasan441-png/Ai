/**
 * DebugScreen - APK Debugger interface
 * Provides comprehensive debugging tools for the Android app.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { getAIEngine } from '../services/AIEngine';
import {
  APKDebugger,
  DebugLogEntry,
  ModuleHealthResult,
  PerformanceBenchmark,
} from '../services/APKDebugger';

const APP_VERSION = '2.3.0';
const PACKAGE_NAME = 'com.ai.assistant';

export default function DebugScreen() {
  const aiEngine = getAIEngine();
  const debugger_ = APKDebugger.getInstance();

  const [activeTab, setActiveTab] = useState<'info' | 'health' | 'perf' | 'logs'>('info');
  const [isRunning, setIsRunning] = useState(false);
  const [healthResults, setHealthResults] = useState<ModuleHealthResult[]>([]);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(debugger_.getLogs());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Log screen open
  useEffect(() => {
    debugger_.logInfo('Debug screen opened', 'DebugScreen');
    debugger_.validateConfig({
      appVersion: APP_VERSION,
      packageName: PACKAGE_NAME,
      moduleCount: aiEngine.getModuleCount(),
    });
    setLogs(debugger_.getLogs());
  }, []);

  const handleHealthCheck = useCallback(async () => {
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const modules = aiEngine.getModules();
      const results = await debugger_.runModuleHealthCheck(
        modules,
        (name: string) => aiEngine.isModuleActive(name)
      );
      setHealthResults(results);
      setLogs(debugger_.getLogs());
    } catch (error) {
      debugger_.logError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsRunning(false);
    }
  }, [aiEngine]);

  const handleBenchmark = useCallback(async () => {
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const results = await debugger_.runPerformanceSuite(
        async (msg: string) => {
          const result = await aiEngine.processMessage(msg);
          return { response: result.response, module: result.module };
        },
        (query: string) => aiEngine.findBestModule(query)
      );
      setBenchmarks(results);
      setLogs(debugger_.getLogs());
    } catch (error) {
      debugger_.logError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsRunning(false);
    }
  }, [aiEngine]);

  const handleClearLogs = () => {
    Alert.alert('Clear Logs', 'Clear all debug logs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          debugger_.clearLogs();
          setLogs([]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleGenerateReport = () => {
    const report = debugger_.generateReport({
      appVersion: APP_VERSION,
      packageName: PACKAGE_NAME,
      moduleCount: aiEngine.getModuleCount(),
      activeModules: aiEngine.getActiveModuleCount(),
    });
    const formatted = debugger_.formatReport(report);
    Alert.alert('Debug Report', formatted);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    Alert.alert('Reset Debugger', 'Reset all debug data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          debugger_.reset();
          setHealthResults([]);
          setBenchmarks([]);
          setLogs([]);
          setRefreshKey(prev => prev + 1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const memory = debugger_.getMemorySnapshot();
  const healthSummary = debugger_.getHealthSummary();

  // ==================== TAB: Info ====================
  const renderInfo = () => (
    <View>
      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 App Info</Text>
        <InfoRow label="Version" value={APP_VERSION} />
        <InfoRow label="Package" value={PACKAGE_NAME} />
        <InfoRow label="Build Type" value="Debug" highlight />
        <InfoRow label="JS Engine" value="Hermes" />
        <InfoRow label="Platform" value="React Native 0.76" />
      </View>

      {/* Module Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧩 Module Stats</Text>
        <InfoRow label="Total Modules" value={String(aiEngine.getModuleCount())} />
        <InfoRow label="Active Modules" value={String(aiEngine.getActiveModuleCount())} />
        <InfoRow
          label="Categories"
          value={String(Object.keys(aiEngine.getModulesByCategory()).length)}
        />
        <InfoRow label="Mode" value="🟢 Fully Offline" highlight />
      </View>

      {/* Runtime Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Runtime</Text>
        <InfoRow label="Uptime" value={debugger_.getFormattedUptime()} />
        <InfoRow label="Log Count" value={String(debugger_.getLogs().length)} />
        <InfoRow label="Errors" value={String(debugger_.getErrorCount())} />
        <InfoRow label="Warnings" value={String(debugger_.getWarningCount())} />
        <InfoRow label="Memory" value={`~${memory.estimatedUsageKB} KB`} />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={handleGenerateReport}>
          <Text style={styles.actionButtonText}>📋 Full Report</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.dangerAction]} onPress={handleReset}>
          <Text style={[styles.actionButtonText, styles.dangerActionText]}>🔄 Reset</Text>
        </Pressable>
      </View>
    </View>
  );

  // ==================== TAB: Health ====================
  const renderHealth = () => (
    <View>
      {healthResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏥</Text>
          <Text style={styles.emptyText}>No health check results yet</Text>
          <Pressable
            style={styles.runButton}
            onPress={handleHealthCheck}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.runButtonText}>▶️ Run Health Check</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          {/* Health Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏥 Health Summary</Text>
            <View style={styles.healthSummary}>
              <View style={[styles.healthBadge, styles.healthyBadge]}>
                <Text style={styles.healthBadgeNumber}>{healthSummary.healthy}</Text>
                <Text style={styles.healthBadgeLabel}>Healthy</Text>
              </View>
              <View style={[styles.healthBadge, styles.warningBadge]}>
                <Text style={styles.healthBadgeNumber}>{healthSummary.warning}</Text>
                <Text style={styles.healthBadgeLabel}>Warning</Text>
              </View>
              <View style={[styles.healthBadge, styles.errorBadge]}>
                <Text style={styles.healthBadgeNumber}>{healthSummary.error}</Text>
                <Text style={styles.healthBadgeLabel}>Error</Text>
              </View>
            </View>
          </View>

          {/* Health Results */}
          {healthResults
            .filter(r => r.status !== 'healthy')
            .concat(healthResults.filter(r => r.status === 'healthy').slice(0, 10))
            .map((result, idx) => (
              <View key={idx} style={styles.healthRow}>
                <Text style={styles.healthIcon}>
                  {result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
                </Text>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthName}>{result.name}</Text>
                  <Text style={styles.healthCategory}>{result.category}</Text>
                  <Text style={styles.healthMessage}>{result.message}</Text>
                </View>
              </View>
            ))}

          <Pressable
            style={styles.runButton}
            onPress={handleHealthCheck}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.runButtonText}>🔄 Re-run Health Check</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );

  // ==================== TAB: Performance ====================
  const renderPerf = () => (
    <View>
      {benchmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚡</Text>
          <Text style={styles.emptyText}>No benchmarks run yet</Text>
          <Pressable
            style={styles.runButton}
            onPress={handleBenchmark}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.runButtonText}>▶️ Run Benchmarks</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          {/* Benchmark Results */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Performance Results</Text>
            {benchmarks.map((bench, idx) => (
              <View key={idx} style={styles.benchRow}>
                <Text style={styles.benchIcon}>
                  {bench.status === 'pass' ? '✅' : bench.status === 'slow' ? '🐌' : '❌'}
                </Text>
                <View style={styles.benchInfo}>
                  <Text style={styles.benchName}>{bench.name}</Text>
                  <Text style={styles.benchDuration}>
                    {bench.duration}ms
                    {bench.status === 'pass' ? ' ✓' : bench.status === 'slow' ? ' (slow)' : ' (failed)'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.benchStatusDot,
                    bench.status === 'pass'
                      ? styles.dotGreen
                      : bench.status === 'slow'
                        ? styles.dotYellow
                        : styles.dotRed,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Performance Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Summary</Text>
            <InfoRow
              label="Total Time"
              value={`${benchmarks.reduce((s, b) => s + b.duration, 0)}ms`}
            />
            <InfoRow
              label="Avg Time"
              value={`${Math.round(benchmarks.reduce((s, b) => s + b.duration, 0) / benchmarks.length)}ms`}
            />
            <InfoRow
              label="Pass Rate"
              value={`${Math.round((benchmarks.filter(b => b.status === 'pass').length / benchmarks.length) * 100)}%`}
            />
          </View>

          <Pressable
            style={styles.runButton}
            onPress={handleBenchmark}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.runButtonText}>🔄 Re-run Benchmarks</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );

  // ==================== TAB: Logs ====================
  const renderLogs = () => (
    <View>
      {/* Log Controls */}
      <View style={styles.logControls}>
        <Text style={styles.logCount}>
          {logs.length} entries
          {debugger_.getErrorCount() > 0 && ` • ${debugger_.getErrorCount()} errors`}
        </Text>
        <Pressable onPress={handleClearLogs}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </Pressable>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No debug logs yet</Text>
          <Text style={styles.emptySubtext}>
            Logs will appear as you use the debugger tools
          </Text>
        </View>
      ) : (
        [...logs].reverse().slice(0, 50).map((entry, idx) => (
          <View key={idx} style={styles.logEntry}>
            <Text style={styles.logIcon}>
              {entry.level === 'error' ? '❌' : entry.level === 'warn' ? '⚠️' : entry.level === 'debug' ? '🔍' : 'ℹ️'}
            </Text>
            <View style={styles.logContent}>
              <View style={styles.logHeader}>
                <Text style={[styles.logLevel, styles[`log_${entry.level}` as keyof typeof styles] as object]}>
                  {entry.level.toUpperCase()}
                </Text>
                <Text style={styles.logTime}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.logMessage}>{entry.message}</Text>
              {entry.source && (
                <Text style={styles.logSource}>📍 {entry.source}</Text>
              )}
              {entry.details && (
                <Text style={styles.logDetails} numberOfLines={3}>
                  {entry.details}
                </Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ==================== RENDER ====================
  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'info' as const, label: '📱 Info' },
          { key: 'health' as const, label: '🏥 Health' },
          { key: 'perf' as const, label: '⚡ Perf' },
          { key: 'logs' as const, label: '📝 Logs' },
        ].map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Loading Overlay */}
      {isRunning && (
        <View style={styles.loadingBar}>
          <ActivityIndicator color="#6c63ff" size="small" />
          <Text style={styles.loadingText}>Running diagnostics...</Text>
        </View>
      )}

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'info' && renderInfo()}
        {activeTab === 'health' && renderHealth()}
        {activeTab === 'perf' && renderPerf()}
        {activeTab === 'logs' && renderLogs()}
      </ScrollView>
    </View>
  );
}

// ==================== Helper Components ====================

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={[infoRowStyles.value, highlight && infoRowStyles.highlight]}>{value}</Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
  value: {
    color: '#e8e8e8',
    fontSize: 14,
    fontWeight: '600',
  },
  highlight: {
    color: '#4ade80',
  },
});

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c63ff',
  },
  tabText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6c63ff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    color: '#6c63ff',
    fontSize: 13,
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: '#1e2a3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cardTitle: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  actionButtonText: {
    color: '#8b83ff',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerAction: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  dangerActionText: {
    color: '#ff6b6b',
  },

  // Run Button
  runButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  runButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },

  // Health
  healthSummary: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  healthBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  healthyBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  warningBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  errorBadge: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  healthBadgeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e8e8e8',
  },
  healthBadgeLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2a3a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  healthIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  healthInfo: {
    flex: 1,
  },
  healthName: {
    color: '#e8e8e8',
    fontSize: 14,
    fontWeight: '600',
  },
  healthCategory: {
    color: '#6c63ff',
    fontSize: 11,
  },
  healthMessage: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  // Benchmarks
  benchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  benchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  benchInfo: {
    flex: 1,
  },
  benchName: {
    color: '#e8e8e8',
    fontSize: 14,
    fontWeight: '500',
  },
  benchDuration: {
    color: '#888',
    fontSize: 12,
    marginTop: 1,
  },
  benchStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#4ade80',
  },
  dotYellow: {
    backgroundColor: '#fbbf24',
  },
  dotRed: {
    backgroundColor: '#ff4444',
  },

  // Logs
  logControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logCount: {
    color: '#888',
    fontSize: 13,
  },
  logEntry: {
    flexDirection: 'row',
    backgroundColor: '#1e2a3a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  logIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  log_info: {
    color: '#6c63ff',
  },
  log_warn: {
    color: '#fbbf24',
  },
  log_error: {
    color: '#ff4444',
  },
  log_debug: {
    color: '#888',
  },
  logTime: {
    color: '#666',
    fontSize: 10,
  },
  logMessage: {
    color: '#e0e0e0',
    fontSize: 13,
    lineHeight: 18,
  },
  logSource: {
    color: '#6c63ff',
    fontSize: 11,
    marginTop: 2,
  },
  logDetails: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
