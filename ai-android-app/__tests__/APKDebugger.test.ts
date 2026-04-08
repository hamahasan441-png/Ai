/**
 * APK Debugger Tests
 */
import { APKDebugger } from '../src/services/APKDebugger';

describe('APKDebugger', () => {
  let debugger_: APKDebugger;

  beforeEach(() => {
    // Reset singleton by creating fresh instance via reset
    debugger_ = APKDebugger.getInstance();
    debugger_.reset();
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = APKDebugger.getInstance();
      const instance2 = APKDebugger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Logging', () => {
    it('should log info messages', () => {
      debugger_.logInfo('Test info message', 'TestSource');
      const logs = debugger_.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test info message');
      expect(logs[0].source).toBe('TestSource');
    });

    it('should log warning messages', () => {
      debugger_.logWarn('Test warning', 'details here', 'TestSource');
      const logs = debugger_.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].details).toBe('details here');
    });

    it('should log error from Error object', () => {
      const error = new Error('Test error');
      debugger_.logError(error);
      const logs = debugger_.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Test error');
    });

    it('should log debug messages', () => {
      debugger_.logDebug('Debug msg', 'debug details', 'Debug');
      const logs = debugger_.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('debug');
    });

    it('should filter logs by level', () => {
      debugger_.logInfo('info 1');
      debugger_.logWarn('warn 1');
      debugger_.logInfo('info 2');
      debugger_.logError(new Error('err 1'));

      expect(debugger_.getLogsByLevel('info').length).toBe(2);
      expect(debugger_.getLogsByLevel('warn').length).toBe(1);
      expect(debugger_.getLogsByLevel('error').length).toBe(1);
      expect(debugger_.getLogsByLevel('debug').length).toBe(0);
    });

    it('should count errors', () => {
      debugger_.logInfo('info');
      debugger_.logError(new Error('err 1'));
      debugger_.logError(new Error('err 2'));
      expect(debugger_.getErrorCount()).toBe(2);
    });

    it('should count warnings', () => {
      debugger_.logWarn('w1');
      debugger_.logWarn('w2');
      debugger_.logWarn('w3');
      expect(debugger_.getWarningCount()).toBe(3);
    });

    it('should clear logs', () => {
      debugger_.logInfo('msg1');
      debugger_.logInfo('msg2');
      debugger_.clearLogs();
      expect(debugger_.getLogs().length).toBe(0);
    });

    it('should have unique IDs for each log', () => {
      debugger_.logInfo('msg1');
      debugger_.logInfo('msg2');
      const logs = debugger_.getLogs();
      expect(logs[0].id).not.toBe(logs[1].id);
    });

    it('should have timestamps', () => {
      debugger_.logInfo('msg');
      const logs = debugger_.getLogs();
      expect(logs[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('Module Health Check', () => {
    it('should check module health', async () => {
      const modules = [
        { name: 'TestModule1', category: 'Test' },
        { name: 'TestModule2', category: 'Test' },
      ];

      const results = await debugger_.runModuleHealthCheck(
        modules,
        (name: string) => name === 'TestModule1'
      );

      expect(results.length).toBe(2);
      expect(results[0].status).toBe('healthy');
      expect(results[1].status).toBe('warning'); // disabled
    });

    it('should detect empty module names', async () => {
      const modules = [
        { name: '', category: 'Test' },
      ];

      const results = await debugger_.runModuleHealthCheck(
        modules,
        () => true
      );

      expect(results[0].status).toBe('error');
    });

    it('should provide health summary', async () => {
      const modules = [
        { name: 'Active1', category: 'A' },
        { name: 'Active2', category: 'A' },
        { name: 'Disabled1', category: 'B' },
      ];

      await debugger_.runModuleHealthCheck(
        modules,
        (name: string) => name.startsWith('Active')
      );

      const summary = debugger_.getHealthSummary();
      expect(summary.healthy).toBe(2);
      expect(summary.warning).toBe(1);
      expect(summary.error).toBe(0);
      expect(summary.total).toBe(3);
    });

    it('should return health results', async () => {
      const modules = [{ name: 'Mod1', category: 'Cat' }];
      await debugger_.runModuleHealthCheck(modules, () => true);
      const results = debugger_.getHealthResults();
      expect(results.length).toBe(1);
    });

    it('should not be running after completion', async () => {
      const modules = [{ name: 'Mod', category: 'Cat' }];
      await debugger_.runModuleHealthCheck(modules, () => true);
      expect(debugger_.getIsRunning()).toBe(false);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should run a benchmark', async () => {
      const result = await debugger_.runBenchmark('Test Bench', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) sum += i;
      });

      expect(result.name).toBe('Test Bench');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.status).toBe('pass'); // Should be fast
    });

    it('should mark slow benchmarks', async () => {
      const result = await debugger_.runBenchmark('Slow Bench', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      }, 10); // 10ms threshold

      expect(result.status).toBe('slow');
    });

    it('should mark failed benchmarks', async () => {
      const result = await debugger_.runBenchmark('Fail Bench', () => {
        throw new Error('Benchmark failed');
      });

      expect(result.status).toBe('fail');
    });

    it('should run performance suite', async () => {
      const mockProcess = async (msg: string) => ({
        response: `Reply to: ${msg}`,
        module: 'TestModule',
      });
      const mockFind = (query: string) => ({ name: 'TestModule' });

      const results = await debugger_.runPerformanceSuite(mockProcess, mockFind);
      expect(results.length).toBe(5);
      expect(results.every(r => r.duration >= 0)).toBe(true);
    });

    it('should get benchmarks', async () => {
      await debugger_.runBenchmark('B1', () => {});
      await debugger_.runBenchmark('B2', () => {});
      expect(debugger_.getBenchmarks().length).toBe(2);
    });

    it('should clear benchmarks', async () => {
      await debugger_.runBenchmark('B1', () => {});
      debugger_.clearBenchmarks();
      expect(debugger_.getBenchmarks().length).toBe(0);
    });
  });

  describe('Memory Diagnostics', () => {
    it('should return memory snapshot', () => {
      const snapshot = debugger_.getMemorySnapshot();
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.logCount).toBe(0);
      expect(snapshot.estimatedUsageKB).toBeGreaterThanOrEqual(0);
    });

    it('should reflect log count in memory', () => {
      debugger_.logInfo('msg1');
      debugger_.logInfo('msg2');
      debugger_.logInfo('msg3');
      const snapshot = debugger_.getMemorySnapshot();
      expect(snapshot.logCount).toBe(3);
    });
  });

  describe('Uptime', () => {
    it('should track uptime', () => {
      expect(debugger_.getUptime()).toBeGreaterThanOrEqual(0);
    });

    it('should format uptime as string', () => {
      const formatted = debugger_.getFormattedUptime();
      expect(formatted).toMatch(/\d+s/);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct config', () => {
      const issues = debugger_.validateConfig({
        appVersion: '2.3.0',
        packageName: 'com.ai.assistant',
        moduleCount: 120,
      });
      expect(issues.length).toBe(0);
    });

    it('should detect invalid version format', () => {
      const issues = debugger_.validateConfig({
        appVersion: 'invalid',
        packageName: 'com.ai.assistant',
        moduleCount: 120,
      });
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].level).toBe('warn');
    });

    it('should detect invalid package name', () => {
      const issues = debugger_.validateConfig({
        appVersion: '2.3.0',
        packageName: 'invalid',
        moduleCount: 120,
      });
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].level).toBe('error');
    });

    it('should warn on low module count', () => {
      const issues = debugger_.validateConfig({
        appVersion: '2.3.0',
        packageName: 'com.ai.assistant',
        moduleCount: 50,
      });
      expect(issues.some(i => i.message.includes('Module count'))).toBe(true);
    });
  });

  describe('Report Generation', () => {
    it('should generate report', () => {
      debugger_.logInfo('test');
      const report = debugger_.generateReport({
        appVersion: '2.3.0',
        packageName: 'com.ai.assistant',
        moduleCount: 120,
        activeModules: 120,
      });

      expect(report.appVersion).toBe('2.3.0');
      expect(report.packageName).toBe('com.ai.assistant');
      expect(report.moduleCount).toBe(120);
      expect(report.activeModules).toBe(120);
      expect(report.uptime).toBeGreaterThanOrEqual(0);
      expect(report.generatedAt).toBeGreaterThan(0);
    });

    it('should format report as readable text', () => {
      const report = debugger_.generateReport({
        appVersion: '2.3.0',
        packageName: 'com.ai.assistant',
        moduleCount: 120,
        activeModules: 120,
      });

      const formatted = debugger_.formatReport(report);
      expect(formatted).toContain('APK DEBUG REPORT');
      expect(formatted).toContain('2.3.0');
      expect(formatted).toContain('com.ai.assistant');
    });

    it('should include errors in report', () => {
      debugger_.logError(new Error('test error'));
      const report = debugger_.generateReport({
        appVersion: '2.3.0',
        packageName: 'com.ai.assistant',
        moduleCount: 120,
        activeModules: 120,
      });
      expect(report.errors.length).toBe(1);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      debugger_.logInfo('msg');
      debugger_.logError(new Error('err'));
      debugger_.reset();

      expect(debugger_.getLogs().length).toBe(0);
      expect(debugger_.getBenchmarks().length).toBe(0);
      expect(debugger_.getHealthResults().length).toBe(0);
      expect(debugger_.getIsRunning()).toBe(false);
    });
  });
});
