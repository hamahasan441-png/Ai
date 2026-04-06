import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationSummarizer } from '../ConversationSummarizer.js';

describe('ConversationSummarizer', () => {
  let summarizer: ConversationSummarizer;

  beforeEach(() => {
    summarizer = new ConversationSummarizer();
  });

  it('should create instance', () => {
    expect(summarizer).toBeInstanceOf(ConversationSummarizer);
  });

  it('should add turns', () => {
    summarizer.addTurn('user', 'Hello world');
    summarizer.addTurn('assistant', 'Hi! How can I help?');
    const summary = summarizer.getSummary();
    expect(summary.turnCount).toBe(2);
  });

  it('should detect decisions', () => {
    summarizer.addTurn('user', "Let's use React for the frontend.");
    const summary = summarizer.getSummary();
    expect(summary.decisions.length).toBeGreaterThan(0);
  });

  it('should detect topics', () => {
    summarizer.addTurn('user', 'How do I set up Docker and Kubernetes for CI/CD?');
    const summary = summarizer.getSummary();
    expect(summary.topics).toContain('devops');
  });

  it('should track questions', () => {
    summarizer.addTurn('user', 'What is the best way to handle authentication?');
    const summary = summarizer.getSummary();
    expect(summary.openQuestions.length).toBeGreaterThan(0);
  });

  it('should mark questions answered', () => {
    summarizer.addTurn('user', 'What is Docker?');
    summarizer.addTurn('assistant', 'Docker is a containerization platform...');
    const summary = summarizer.getSummary();
    expect(summary.openQuestions.length).toBe(0);
  });

  it('should batch summarize', () => {
    const summary = summarizer.summarize([
      { role: 'user', content: 'Tell me about React for building web applications' },
      { role: 'assistant', content: 'React is a JavaScript library for building user interfaces. It uses a virtual DOM for efficient rendering.' },
    ]);
    expect(summary.turnCount).toBe(2);
    expect(summary.topics.length).toBeGreaterThanOrEqual(0);
  });

  it('should get topic summary', () => {
    summarizer.addTurn('user', 'How do Docker containers work in production?');
    const topicSummary = summarizer.getTopicSummary('devops');
    expect(topicSummary).toBeDefined();
  });

  it('should return null for unknown topics', () => {
    const result = summarizer.getTopicSummary('quantum');
    expect(result).toBeNull();
  });

  it('should serialize/deserialize', () => {
    summarizer.addTurn('user', 'Hello');
    const serialized = summarizer.serialize();
    const restored = ConversationSummarizer.deserialize(serialized);
    expect(restored.getStats().turnCount).toBe(1);
  });

  it('should track stats', () => {
    summarizer.addTurn('user', 'test');
    const stats = summarizer.getStats();
    expect(stats.turnCount).toBe(1);
  });
});
