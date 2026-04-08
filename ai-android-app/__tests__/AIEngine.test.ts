/**
 * AI Engine Tests
 */
import { AIEngine, getAIEngine } from '../src/services/AIEngine';

describe('AIEngine', () => {
  let engine: AIEngine;

  beforeEach(() => {
    engine = new AIEngine();
  });

  describe('Module Registry', () => {
    it('should have 120 modules registered', () => {
      expect(engine.getModuleCount()).toBe(120);
    });

    it('should have all modules active by default', () => {
      expect(engine.getActiveModuleCount()).toBe(120);
    });

    it('should organize modules by category', () => {
      const categories = engine.getModulesByCategory();
      expect(Object.keys(categories).length).toBeGreaterThan(10);
    });

    it('should have cybersecurity modules', () => {
      const categories = engine.getModulesByCategory();
      expect(categories['Cybersecurity']).toBeDefined();
      expect(categories['Cybersecurity'].length).toBeGreaterThanOrEqual(10);
    });

    it('should have trading modules', () => {
      const categories = engine.getModulesByCategory();
      expect(categories['Trading & Finance']).toBeDefined();
    });

    it('should have Kurdish language modules', () => {
      const categories = engine.getModulesByCategory();
      expect(categories['Kurdish Language']).toBeDefined();
      expect(categories['Kurdish Language'].length).toBe(4);
    });

    it('should have reasoning modules', () => {
      const categories = engine.getModulesByCategory();
      expect(categories['Reasoning & Logic']).toBeDefined();
    });
  });

  describe('Module Toggle', () => {
    it('should toggle module off', () => {
      const result = engine.toggleModule('ExploitSearchEngine');
      expect(result).toBe(false);
      expect(engine.isModuleActive('ExploitSearchEngine')).toBe(false);
    });

    it('should toggle module back on', () => {
      engine.toggleModule('ExploitSearchEngine');
      const result = engine.toggleModule('ExploitSearchEngine');
      expect(result).toBe(true);
      expect(engine.isModuleActive('ExploitSearchEngine')).toBe(true);
    });

    it('should reduce active count when toggling off', () => {
      const initial = engine.getActiveModuleCount();
      engine.toggleModule('LocalBrain');
      expect(engine.getActiveModuleCount()).toBe(initial - 1);
    });
  });

  describe('Module Matching', () => {
    it('should match cybersecurity queries', () => {
      const module = engine.findBestModule('search for CVE vulnerabilities');
      expect(module).not.toBeNull();
      expect(module!.category).toBe('Cybersecurity');
    });

    it('should match trading queries', () => {
      const module = engine.findBestModule('analyze this trading strategy');
      expect(module).not.toBeNull();
      expect(module!.category).toBe('Trading & Finance');
    });

    it('should match Kurdish queries', () => {
      const module = engine.findBestModule('translate to Kurdish language');
      expect(module).not.toBeNull();
      expect(module!.category).toBe('Kurdish Language');
    });

    it('should match code queries', () => {
      const module = engine.findBestModule('optimize this code for performance');
      expect(module).not.toBeNull();
    });

    it('should match reasoning queries', () => {
      const module = engine.findBestModule('prove this logical statement');
      expect(module).not.toBeNull();
    });

    it('should match sentiment queries', () => {
      const module = engine.findBestModule('analyze the sentiment of this text');
      expect(module).not.toBeNull();
      expect(module!.name).toBe('SentimentAnalyzer');
    });

    it('should not match disabled modules', () => {
      engine.toggleModule('ExploitSearchEngine');
      const module = engine.findBestModule('search for CVE exploit vulnerability');
      // Should still find another cybersecurity module, but not ExploitSearchEngine
      if (module) {
        expect(module.name).not.toBe('ExploitSearchEngine');
      }
    });
  });

  describe('Message Processing', () => {
    it('should process a greeting', async () => {
      const result = await engine.processMessage('Hello!');
      expect(result.response).toContain('Hello');
      expect(result.module).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should process a help request', async () => {
      const result = await engine.processMessage('What can you do?');
      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(50);
    });

    it('should process cybersecurity queries', async () => {
      const result = await engine.processMessage('Tell me about CVE vulnerabilities');
      expect(result.response).toBeDefined();
      expect(result.module).toBeDefined();
    });

    it('should provide suggestions', async () => {
      const result = await engine.processMessage('Hello');
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('should track conversation history', async () => {
      await engine.processMessage('Hello');
      await engine.processMessage('Help me');
      const history = engine.getHistory();
      expect(history.length).toBe(4); // 2 user + 2 assistant
    });
  });

  describe('Conversation History', () => {
    it('should start with empty history', () => {
      expect(engine.getHistory().length).toBe(0);
    });

    it('should clear history', async () => {
      await engine.processMessage('Hello');
      engine.clearHistory();
      expect(engine.getHistory().length).toBe(0);
    });

    it('should have correct message roles', async () => {
      await engine.processMessage('Test');
      const history = engine.getHistory();
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
    });

    it('should have timestamps', async () => {
      await engine.processMessage('Test');
      const history = engine.getHistory();
      expect(history[0].timestamp).toBeDefined();
      expect(history[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const engine1 = getAIEngine();
      const engine2 = getAIEngine();
      expect(engine1).toBe(engine2);
    });
  });
});
