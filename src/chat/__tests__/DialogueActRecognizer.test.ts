import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueActRecognizer } from '../DialogueActRecognizer.js';

describe('DialogueActRecognizer', () => {
  let recognizer: DialogueActRecognizer;

  beforeEach(() => {
    recognizer = new DialogueActRecognizer();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(recognizer).toBeInstanceOf(DialogueActRecognizer);
    });
  });

  describe('recognize', () => {
    it('should detect questions', () => {
      const result = recognizer.recognize('What is TypeScript?');
      expect(result.act).toBe('question');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should detect factual sub-type', () => {
      const result = recognizer.recognize('What is a database?');
      expect(result.act).toBe('question');
      expect(result.subType).toBe('factual');
    });

    it('should detect procedural sub-type', () => {
      const result = recognizer.recognize('How do I install Node.js?');
      expect(result.act).toBe('question');
      expect(result.subType).toBe('procedural');
    });

    it('should detect commands', () => {
      const result = recognizer.recognize('Show me the code');
      expect(result.act).toBe('command');
    });

    it('should detect list commands', () => {
      const result = recognizer.recognize('List all the available options');
      expect(result.act).toBe('command');
    });

    it('should detect requests', () => {
      const result = recognizer.recognize('Please help me with this problem');
      expect(result.act).toBe('request');
    });

    it('should detect polite requests', () => {
      const result = recognizer.recognize('Please explain the algorithm');
      expect(result.act).toBe('request');
    });

    it('should detect challenges', () => {
      const result = recognizer.recognize("That's not right, the answer should be different");
      expect(result.act).toBe('challenge');
    });

    it('should detect corrections', () => {
      const result = recognizer.recognize('Actually, the correct answer is 42');
      expect(['correction', 'challenge']).toContain(result.act);
    });

    it('should detect confirmations', () => {
      const result = recognizer.recognize('Yes, exactly right');
      expect(result.act).toBe('confirmation');
    });

    it('should detect clarifications', () => {
      const result = recognizer.recognize('What do you mean by that?');
      expect(['clarification', 'question']).toContain(result.act);
    });

    it('should detect greetings', () => {
      const result = recognizer.recognize('Hello, how are you?');
      expect(['greeting', 'question']).toContain(result.act);
    });

    it('should detect opinions', () => {
      const result = recognizer.recognize('I think Python is better for data science');
      expect(result.act).toBe('opinion');
    });

    it('should detect comparisons', () => {
      const result = recognizer.recognize('React vs Angular which is better?');
      expect(result.act).toBe('comparison');
    });

    it('should detect hypotheticals', () => {
      const result = recognizer.recognize('Suppose we used microservices instead');
      expect(result.act).toBe('hypothetical');
    });

    it('should handle empty text', () => {
      const result = recognizer.recognize('');
      expect(result.act).toBe('assertion');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should return indicators', () => {
      const result = recognizer.recognize('What is JavaScript?');
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    it('should use context for better recognition', () => {
      const result = recognizer.recognize('Yes, that is correct', { previousAct: 'question' });
      expect(result.act).toBe('confirmation');
    });

    it('should handle question marks as strong question signal', () => {
      const result = recognizer.recognize('This is working?');
      expect(result.act).toBe('question');
    });

    it('should detect create commands', () => {
      const result = recognizer.recognize('Create a new component');
      expect(result.act).toBe('command');
    });

    it('should detect generate commands', () => {
      const result = recognizer.recognize('Generate a report');
      expect(result.act).toBe('command');
    });

    it('should detect causal questions', () => {
      const result = recognizer.recognize('Why does this error occur?');
      expect(result.act).toBe('question');
      expect(result.subType).toBe('causal');
    });
  });

  describe('getStats', () => {
    it('should track recognize count', () => {
      recognizer.recognize('Hello');
      recognizer.recognize('What is this?');
      const stats = recognizer.getStats();
      expect(stats.recognizeCount).toBe(2);
    });

    it('should track act counts', () => {
      recognizer.recognize('What is this?');
      recognizer.recognize('What is that?');
      const stats = recognizer.getStats();
      expect(stats.actCounts['question']).toBe(2);
    });
  });

  describe('serialize/deserialize', () => {
    it('should round-trip state', () => {
      recognizer.recognize('Hello');
      recognizer.recognize('What is this?');
      const serialized = recognizer.serialize();
      const restored = DialogueActRecognizer.deserialize(serialized);
      expect(restored.getStats().recognizeCount).toBe(2);
    });
  });
});
