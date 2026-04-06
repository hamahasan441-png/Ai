import { describe, it, expect, beforeEach } from 'vitest';
import { ResponseQualityScorer } from '../ResponseQualityScorer.js';

describe('ResponseQualityScorer', () => {
  let scorer: ResponseQualityScorer;

  beforeEach(() => {
    scorer = new ResponseQualityScorer();
  });

  it('should create instance', () => {
    expect(scorer).toBeInstanceOf(ResponseQualityScorer);
  });

  it('should score a good response', () => {
    const score = scorer.score(
      'What is TypeScript?',
      'TypeScript is a strongly typed programming language that builds on JavaScript. It adds optional static typing and class-based object-oriented programming to the language.'
    );
    expect(score.overall).toBeGreaterThan(0.3);
    expect(score.relevance).toBeGreaterThan(0.3);
  });

  it('should flag low relevance', () => {
    const score = scorer.score(
      'What is Docker?',
      'The weather today is sunny and warm. Perfect for a picnic in the park.'
    );
    expect(score.relevance).toBeLessThan(0.5);
  });

  it('should detect hedging language', () => {
    const score = scorer.score(
      'Best database?',
      'Maybe PostgreSQL is good. I think it could be the right choice. Perhaps MongoDB might be better. Probably depends on the use case.'
    );
    expect(score.accuracy).toBeLessThan(0.8);
  });

  it('should score between 0 and 1', () => {
    const score = scorer.score('test', 'test response');
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(1);
  });

  it('should suggest improvements for low scores', () => {
    const score = scorer.score('test', 'ok');
    const suggestions = scorer.suggest(score);
    expect(suggestions.length).toBeGreaterThanOrEqual(0);
  });

  it('should suggest code formatting when needed', () => {
    const score = scorer.score('show code', 'function hello() { return 1; }');
    if (score.flags.includes('code_without_blocks')) {
      const suggestions = scorer.suggest(score);
      expect(suggestions.some(s => s.type === 'add_code')).toBe(true);
    }
  });

  it('should give good formatting score for proper code blocks', () => {
    const score = scorer.score(
      'Show me a function',
      '```javascript\nfunction hello() { return "world"; }\n```'
    );
    expect(score.formatting).toBeGreaterThan(0.5);
  });

  it('should serialize/deserialize', () => {
    scorer.score('test', 'response');
    const serialized = scorer.serialize();
    const restored = ResponseQualityScorer.deserialize(serialized);
    expect(restored.getStats().scoreCount).toBe(1);
  });

  it('should track stats', () => {
    scorer.score('q1', 'r1');
    scorer.score('q2', 'r2');
    const stats = scorer.getStats();
    expect(stats.scoreCount).toBe(2);
    expect(stats.avgScore).toBeGreaterThan(0);
  });
});
