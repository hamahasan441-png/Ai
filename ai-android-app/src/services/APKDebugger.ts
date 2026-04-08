/**
 * APK Debugger Service - Comprehensive debugging tools for the Android app
 * Provides module health checks, performance profiling, error logging,
 * memory diagnostics, and runtime inspection.
 * Fully offline - no external APIs required.
 */

export interface DebugLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: string;
  source?: string;
}

export interface ModuleHealthResult {
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}

export interface PerformanceBenchmark {
  name: string;
  duration: number;
  timestamp: number;
  status: 'pass' | 'slow' | 'fail';
}

export interface MemorySnapshot {
  timestamp: number;
  logCount: number;
  historySize: number;
  estimatedUsageKB: number;
}

export interface DebugReport {
  appVersion: string;
  packageName: string;
  moduleCount: number;
  activeModules: number;
  uptime: number;
  errors: DebugLogEntry[];
  warnings: DebugLogEntry[];
  healthResults: ModuleHealthResult[];
  benchmarks: PerformanceBenchmark[];
  memory: MemorySnapshot;
  generatedAt: number;
}

/**
 * APKDebugger - Core debugging engine for the AI Assistant app
 */
export class APKDebugger {
  private static instance: APKDebugger | null = null;
  private logs: DebugLogEntry[] = [];
  private benchmarks: PerformanceBenchmark[] = [];
  private healthResults: ModuleHealthResult[] = [];
  private startTime: number = Date.now();
  private maxLogs: number = 500;
  private isRunning: boolean = false;

  static getInstance(): APKDebugger {
    if (!APKDebugger.instance) {
      APKDebugger.instance = new APKDebugger();
    }
    return APKDebugger.instance;
  }

  /**
   * Check if debugger is currently running diagnostics
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get app uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Format uptime as human-readable string
   */
  getFormattedUptime(): string {
    const ms = this.getUptime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  // ==================== LOGGING ====================

  /**
   * Add a log entry
   */
  log(level: DebugLogEntry['level'], message: string, details?: string, source?: string): void {
    const entry: DebugLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      level,
      message,
      details,
      source,
    };
    this.logs.push(entry);

    // Trim old logs if over max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Log an info message
   */
  logInfo(message: string, source?: string): void {
    this.log('info', message, undefined, source);
  }

  /**
   * Log a warning
   */
  logWarn(message: string, details?: string, source?: string): void {
    this.log('warn', message, details, source);
  }

  /**
   * Log an error from Error object
   */
  logError(error: Error, componentStack?: string): void {
    this.log('error', error.message, componentStack || error.stack, error.name);
  }

  /**
   * Log a debug message
   */
  logDebug(message: string, details?: string, source?: string): void {
    this.log('debug', message, details, source);
  }

  /**
   * Get all logs
   */
  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: DebugLogEntry['level']): DebugLogEntry[] {
    return this.logs.filter(l => l.level === level);
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.logs.filter(l => l.level === 'error').length;
  }

  /**
   * Get warning count
   */
  getWarningCount(): number {
    return this.logs.filter(l => l.level === 'warn').length;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  // ==================== MODULE HEALTH CHECK ====================

  /**
   * Run health check on all modules
   */
  async runModuleHealthCheck(
    modules: Array<{ name: string; category: string }>,
    isModuleActive: (name: string) => boolean
  ): Promise<ModuleHealthResult[]> {
    this.isRunning = true;
    this.healthResults = [];
    this.logInfo('Starting module health check...', 'APKDebugger');

    for (const mod of modules) {
      const startTime = Date.now();
      const active = isModuleActive(mod.name);
      const responseTime = Date.now() - startTime;

      let status: ModuleHealthResult['status'] = 'healthy';
      let message = 'Module registered and active';

      if (!active) {
        status = 'warning';
        message = 'Module is disabled';
      }

      if (!mod.name || !mod.category) {
        status = 'error';
        message = 'Module has missing metadata';
      }

      if (mod.name.length === 0) {
        status = 'error';
        message = 'Module has empty name';
      }

      const result: ModuleHealthResult = {
        name: mod.name,
        category: mod.category,
        status,
        message,
        responseTime,
      };

      this.healthResults.push(result);
    }

    const healthy = this.healthResults.filter(r => r.status === 'healthy').length;
    const warnings = this.healthResults.filter(r => r.status === 'warning').length;
    const errors = this.healthResults.filter(r => r.status === 'error').length;

    this.logInfo(
      `Health check complete: ${healthy} healthy, ${warnings} warnings, ${errors} errors`,
      'APKDebugger'
    );

    this.isRunning = false;
    return [...this.healthResults];
  }

  /**
   * Get last health check results
   */
  getHealthResults(): ModuleHealthResult[] {
    return [...this.healthResults];
  }

  /**
   * Get health summary
   */
  getHealthSummary(): { healthy: number; warning: number; error: number; total: number } {
    return {
      healthy: this.healthResults.filter(r => r.status === 'healthy').length,
      warning: this.healthResults.filter(r => r.status === 'warning').length,
      error: this.healthResults.filter(r => r.status === 'error').length,
      total: this.healthResults.length,
    };
  }

  // ==================== PERFORMANCE BENCHMARKS ====================

  /**
   * Run a performance benchmark
   */
  async runBenchmark(
    name: string,
    fn: () => void | Promise<void>,
    thresholdMs: number = 100
  ): Promise<PerformanceBenchmark> {
    const startTime = Date.now();

    try {
      await fn();
    } catch (error) {
      const duration = Date.now() - startTime;
      const benchmark: PerformanceBenchmark = {
        name,
        duration,
        timestamp: Date.now(),
        status: 'fail',
      };
      this.benchmarks.push(benchmark);
      this.logError(error instanceof Error ? error : new Error(String(error)));
      return benchmark;
    }

    const duration = Date.now() - startTime;
    const status: PerformanceBenchmark['status'] = duration <= thresholdMs ? 'pass' : 'slow';

    const benchmark: PerformanceBenchmark = {
      name,
      duration,
      timestamp: Date.now(),
      status,
    };

    this.benchmarks.push(benchmark);
    this.logDebug(
      `Benchmark "${name}": ${duration}ms (${status})`,
      undefined,
      'APKDebugger'
    );

    return benchmark;
  }

  /**
   * Run full performance suite against the AI engine
   */
  async runPerformanceSuite(
    processMessage: (msg: string) => Promise<{ response: string; module: string }>,
    findBestModule: (query: string) => { name: string } | null
  ): Promise<PerformanceBenchmark[]> {
    this.isRunning = true;
    const results: PerformanceBenchmark[] = [];
    this.logInfo('Starting performance benchmarks...', 'APKDebugger');

    // Benchmark 1: Module routing speed
    const routingBench = await this.runBenchmark('Module Routing', () => {
      const queries = [
        'search CVE vulnerability', 'trading strategy RSI', 'optimize code',
        'Kurdish translation', 'logical proof', 'hello',
        'sentiment analysis text', 'planning goals milestone',
        'creative story poem', 'knowledge graph entity',
      ];
      for (const q of queries) {
        findBestModule(q);
      }
    }, 50);
    results.push(routingBench);

    // Benchmark 2: Message processing speed
    const processingBench = await this.runBenchmark('Message Processing', async () => {
      await processMessage('What can you do?');
    }, 200);
    results.push(processingBench);

    // Benchmark 3: Greeting response
    const greetingBench = await this.runBenchmark('Greeting Response', async () => {
      await processMessage('Hello!');
    }, 100);
    results.push(greetingBench);

    // Benchmark 4: Cybersecurity query
    const secBench = await this.runBenchmark('Cybersecurity Query', async () => {
      await processMessage('Explain buffer overflow attacks');
    }, 200);
    results.push(secBench);

    // Benchmark 5: Multiple rapid queries
    const rapidBench = await this.runBenchmark('Rapid Queries (5x)', async () => {
      const queries = ['Hello', 'Help', 'Code', 'Trade', 'CVE'];
      for (const q of queries) {
        await processMessage(q);
      }
    }, 500);
    results.push(rapidBench);

    const passed = results.filter(r => r.status === 'pass').length;
    const slow = results.filter(r => r.status === 'slow').length;
    const failed = results.filter(r => r.status === 'fail').length;

    this.logInfo(
      `Benchmarks complete: ${passed} pass, ${slow} slow, ${failed} fail`,
      'APKDebugger'
    );

    this.isRunning = false;
    return results;
  }

  /**
   * Get all benchmarks
   */
  getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }

  /**
   * Clear benchmarks
   */
  clearBenchmarks(): void {
    this.benchmarks = [];
  }

  // ==================== MEMORY DIAGNOSTICS ====================

  /**
   * Get memory snapshot
   */
  getMemorySnapshot(): MemorySnapshot {
    const logSize = JSON.stringify(this.logs).length;
    const healthSize = JSON.stringify(this.healthResults).length;
    const benchSize = JSON.stringify(this.benchmarks).length;
    const totalBytes = logSize + healthSize + benchSize;

    return {
      timestamp: Date.now(),
      logCount: this.logs.length,
      historySize: this.healthResults.length,
      estimatedUsageKB: Math.round(totalBytes / 1024 * 10) / 10,
    };
  }

  // ==================== VALIDATION ====================

  /**
   * Validate APK configuration
   */
  validateConfig(config: {
    appVersion: string;
    packageName: string;
    moduleCount: number;
  }): DebugLogEntry[] {
    const issues: DebugLogEntry[] = [];

    // Check version format
    if (!/^\d+\.\d+\.\d+$/.test(config.appVersion)) {
      const entry: DebugLogEntry = {
        id: `val_${Date.now()}_1`,
        timestamp: Date.now(),
        level: 'warn',
        message: `Version "${config.appVersion}" doesn't follow semver format`,
        source: 'Validator',
      };
      issues.push(entry);
      this.logs.push(entry);
    }

    // Check package name
    if (!config.packageName.includes('.')) {
      const entry: DebugLogEntry = {
        id: `val_${Date.now()}_2`,
        timestamp: Date.now(),
        level: 'error',
        message: `Invalid package name: "${config.packageName}"`,
        source: 'Validator',
      };
      issues.push(entry);
      this.logs.push(entry);
    }

    // Check module count
    if (config.moduleCount < 100) {
      const entry: DebugLogEntry = {
        id: `val_${Date.now()}_3`,
        timestamp: Date.now(),
        level: 'warn',
        message: `Module count (${config.moduleCount}) is below expected minimum (100)`,
        source: 'Validator',
      };
      issues.push(entry);
      this.logs.push(entry);
    }

    if (issues.length === 0) {
      this.logInfo('Configuration validation passed', 'Validator');
    }

    return issues;
  }

  // ==================== REPORT GENERATION ====================

  /**
   * Generate a full debug report
   */
  generateReport(engineInfo: {
    appVersion: string;
    packageName: string;
    moduleCount: number;
    activeModules: number;
  }): DebugReport {
    return {
      appVersion: engineInfo.appVersion,
      packageName: engineInfo.packageName,
      moduleCount: engineInfo.moduleCount,
      activeModules: engineInfo.activeModules,
      uptime: this.getUptime(),
      errors: this.getLogsByLevel('error'),
      warnings: this.getLogsByLevel('warn'),
      healthResults: [...this.healthResults],
      benchmarks: [...this.benchmarks],
      memory: this.getMemorySnapshot(),
      generatedAt: Date.now(),
    };
  }

  /**
   * Format report as readable text
   */
  formatReport(report: DebugReport): string {
    const lines: string[] = [];
    lines.push('═══════════════════════════════════════');
    lines.push('  APK DEBUG REPORT');
    lines.push('═══════════════════════════════════════');
    lines.push('');
    lines.push(`📱 App Version: ${report.appVersion}`);
    lines.push(`📦 Package: ${report.packageName}`);
    lines.push(`🧩 Modules: ${report.activeModules}/${report.moduleCount} active`);
    lines.push(`⏱️ Uptime: ${this.getFormattedUptime()}`);
    lines.push(`💾 Memory: ~${report.memory.estimatedUsageKB} KB`);
    lines.push('');

    if (report.errors.length > 0) {
      lines.push(`❌ Errors (${report.errors.length}):`);
      for (const err of report.errors.slice(-5)) {
        lines.push(`  • ${err.message}`);
      }
      lines.push('');
    }

    if (report.warnings.length > 0) {
      lines.push(`⚠️ Warnings (${report.warnings.length}):`);
      for (const warn of report.warnings.slice(-5)) {
        lines.push(`  • ${warn.message}`);
      }
      lines.push('');
    }

    if (report.healthResults.length > 0) {
      const summary = this.getHealthSummary();
      lines.push(`🏥 Health: ${summary.healthy}✓ ${summary.warning}⚠ ${summary.error}✗`);
      lines.push('');
    }

    if (report.benchmarks.length > 0) {
      lines.push('⚡ Benchmarks:');
      for (const bench of report.benchmarks) {
        const icon = bench.status === 'pass' ? '✅' : bench.status === 'slow' ? '🐌' : '❌';
        lines.push(`  ${icon} ${bench.name}: ${bench.duration}ms`);
      }
      lines.push('');
    }

    lines.push(`📅 Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    lines.push('═══════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Reset the debugger
   */
  reset(): void {
    this.logs = [];
    this.benchmarks = [];
    this.healthResults = [];
    this.startTime = Date.now();
    this.isRunning = false;
  }
}

export default APKDebugger;
