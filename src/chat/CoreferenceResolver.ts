/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Coreference Resolver — Resolve Pronouns & References in Conversation       ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Pronoun Resolution — Map "it", "that", "they" to referents             ║
 * ║    ✦ Entity Tracking — Track mentioned entities across turns                 ║
 * ║    ✦ Demonstrative Resolution — Resolve "this", "those", "these"            ║
 * ║    ✦ Conversation Context — Use conversation history for resolution          ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CoreferenceReplacement {
  pronoun: string;
  referent: string;
  position: number;
  confidence: number;
}

export interface CoreferenceResult {
  resolvedText: string;
  replacements: CoreferenceReplacement[];
  entities: Map<string, string[]>;
  confidence: number;
}

export interface EntityMention {
  text: string;
  type: 'noun' | 'proper_noun' | 'technical_term' | 'concept';
  turnIndex: number;
  frequency: number;
  lastSeen: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SINGULAR_PRONOUNS = ['it', 'this', 'that', 'its'];
const PLURAL_PRONOUNS = ['they', 'them', 'those', 'these', 'their'];
const RELATIVE_PRONOUNS = ['which', 'who', 'whom'];
const ALL_PRONOUNS = [...SINGULAR_PRONOUNS, ...PLURAL_PRONOUNS, ...RELATIVE_PRONOUNS];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'about', 'what', 'up',
  'i', 'you', 'he', 'she', 'we', 'me', 'him', 'her', 'us', 'my', 'your',
  'his', 'our', 'yes', 'no', 'okay', 'ok', 'sure', 'please', 'thanks',
]);

// ── CoreferenceResolver Class ────────────────────────────────────────────────

export class CoreferenceResolver {
  private entityHistory: EntityMention[] = [];
  private resolveCount = 0;
  private totalCalls = 0;

  constructor() {
    this.entityHistory = [];
  }

  /**
   * Resolve coreferences in text given conversation history.
   */
  resolve(
    text: string,
    history: Array<{ role: string; content: string }>
  ): CoreferenceResult {
    this.totalCalls++;
    const entities = this.extractEntities(history);
    const replacements = this.findReplacements(text, entities);
    let resolvedText = text;

    // Apply replacements in reverse order to maintain positions
    const sorted = [...replacements].sort((a, b) => b.position - a.position);
    for (const rep of sorted) {
      const before = resolvedText.slice(0, rep.position);
      const after = resolvedText.slice(rep.position + rep.pronoun.length);
      resolvedText = before + rep.referent + after;
    }

    if (replacements.length > 0) {
      this.resolveCount++;
    }

    const avgConfidence = replacements.length > 0
      ? replacements.reduce((s, r) => s + r.confidence, 0) / replacements.length
      : 0;

    return {
      resolvedText,
      replacements,
      entities,
      confidence: Math.min(1, avgConfidence),
    };
  }

  /**
   * Extract entities from conversation history
   */
  private extractEntities(
    history: Array<{ role: string; content: string }>
  ): Map<string, string[]> {
    const entitiesMap = new Map<string, string[]>();
    const mentions: EntityMention[] = [];

    for (let i = 0; i < history.length; i++) {
      const turn = history[i]!;
      const words = this.tokenize(turn.content);

      // Extract noun phrases (capitalized words, technical terms, quoted strings)
      const nounPhrases = this.extractNounPhrases(turn.content);
      for (const phrase of nounPhrases) {
        const existing = mentions.find(m => m.text.toLowerCase() === phrase.toLowerCase());
        if (existing) {
          existing.frequency++;
          existing.lastSeen = i;
        } else {
          mentions.push({
            text: phrase,
            type: this.classifyEntity(phrase),
            turnIndex: i,
            frequency: 1,
            lastSeen: i,
          });
        }
      }

      // Track technical terms (words with special chars or camelCase)
      for (const word of words) {
        if (this.isTechnicalTerm(word) && !STOP_WORDS.has(word.toLowerCase())) {
          const existing = mentions.find(m => m.text.toLowerCase() === word.toLowerCase());
          if (existing) {
            existing.frequency++;
            existing.lastSeen = i;
          } else {
            mentions.push({
              text: word,
              type: 'technical_term',
              turnIndex: i,
              frequency: 1,
              lastSeen: i,
            });
          }
        }
      }
    }

    // Build entity map grouped by type
    for (const mention of mentions) {
      const key = mention.type;
      const existing = entitiesMap.get(key) || [];
      if (!existing.includes(mention.text)) {
        existing.push(mention.text);
      }
      entitiesMap.set(key, existing);
    }

    this.entityHistory = mentions;
    return entitiesMap;
  }

  /**
   * Find pronoun→referent replacements in text
   */
  private findReplacements(
    text: string,
    entities: Map<string, string[]>
  ): CoreferenceReplacement[] {
    const replacements: CoreferenceReplacement[] = [];
    const lowerText = text.toLowerCase();
    const allEntities = this.getAllEntitiesRanked();

    for (const pronoun of ALL_PRONOUNS) {
      let searchStart = 0;
      while (true) {
        const idx = lowerText.indexOf(pronoun, searchStart);
        if (idx === -1) break;

        // Ensure it's a whole word
        const before = idx > 0 ? lowerText[idx - 1]! : ' ';
        const after = idx + pronoun.length < lowerText.length
          ? lowerText[idx + pronoun.length]!
          : ' ';

        if (/\w/.test(before) || /\w/.test(after)) {
          searchStart = idx + 1;
          continue;
        }

        // Find best referent
        const referent = this.findBestReferent(pronoun, allEntities);
        if (referent) {
          replacements.push({
            pronoun: text.slice(idx, idx + pronoun.length),
            referent: referent.text,
            position: idx,
            confidence: this.calculateConfidence(pronoun, referent),
          });
        }

        searchStart = idx + pronoun.length;
      }
    }

    return replacements;
  }

  /**
   * Find the best referent for a pronoun
   */
  private findBestReferent(
    pronoun: string,
    entities: EntityMention[]
  ): EntityMention | null {
    if (entities.length === 0) return null;

    const isSingular = SINGULAR_PRONOUNS.includes(pronoun.toLowerCase());
    const isPlural = PLURAL_PRONOUNS.includes(pronoun.toLowerCase());

    // Score each entity
    let best: EntityMention | null = null;
    let bestScore = 0;

    for (const entity of entities) {
      let score = 0;

      // Recency bonus (more recent = higher score)
      score += entity.lastSeen * 2;

      // Frequency bonus
      score += entity.frequency * 0.5;

      // Type bonus: prefer proper nouns and technical terms
      if (entity.type === 'proper_noun') score += 3;
      if (entity.type === 'technical_term') score += 2;

      // Number agreement
      const entityWords = entity.text.split(/\s+/).length;
      if (isSingular && entityWords <= 2) score += 1;
      if (isPlural && (entity.text.endsWith('s') || entityWords > 2)) score += 1;

      if (score > bestScore) {
        bestScore = score;
        best = entity;
      }
    }

    return best;
  }

  /**
   * Calculate confidence for a pronoun-referent pairing
   */
  private calculateConfidence(pronoun: string, referent: EntityMention): number {
    let confidence = 0.4; // base

    // Higher frequency → more confident
    if (referent.frequency >= 3) confidence += 0.2;
    else if (referent.frequency >= 2) confidence += 0.1;

    // More recent → more confident
    const maxTurn = Math.max(...this.entityHistory.map(e => e.lastSeen), 1);
    if (referent.lastSeen === maxTurn) confidence += 0.2;
    else if (referent.lastSeen >= maxTurn - 1) confidence += 0.1;

    // Technical terms are more specific → higher confidence
    if (referent.type === 'technical_term') confidence += 0.1;
    if (referent.type === 'proper_noun') confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Get all entities ranked by relevance (most recent first, then by frequency)
   */
  private getAllEntitiesRanked(): EntityMention[] {
    return [...this.entityHistory].sort((a, b) => {
      // Sort by lastSeen descending, then frequency descending
      if (b.lastSeen !== a.lastSeen) return b.lastSeen - a.lastSeen;
      return b.frequency - a.frequency;
    });
  }

  /**
   * Extract noun phrases from text
   */
  private extractNounPhrases(text: string): string[] {
    const phrases: string[] = [];

    // Extract quoted strings
    const quoteMatches = text.match(/"([^"]+)"|'([^']+)'|`([^`]+)`/g);
    if (quoteMatches) {
      for (const m of quoteMatches) {
        phrases.push(m.replace(/['"` ]/g, '').trim());
      }
    }

    // Extract capitalized sequences (proper nouns)
    const capMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    if (capMatches) {
      for (const m of capMatches) {
        if (!STOP_WORDS.has(m.toLowerCase()) && m.length > 2) {
          phrases.push(m);
        }
      }
    }

    // Extract technical terms (camelCase, snake_case, containing dots)
    const techMatches = text.match(/\b[a-z]+[A-Z]\w+\b|\b\w+_\w+\b|\b\w+\.\w+/g);
    if (techMatches) {
      for (const m of techMatches) {
        phrases.push(m);
      }
    }

    return phrases;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text.split(/[\s,.:;!?()[\]{}]+/).filter(w => w.length > 0);
  }

  /**
   * Check if word is a technical term
   */
  private isTechnicalTerm(word: string): boolean {
    // camelCase
    if (/[a-z][A-Z]/.test(word)) return true;
    // snake_case
    if (word.includes('_')) return true;
    // dot notation
    if (/\w\.\w/.test(word)) return true;
    // ALL_CAPS
    if (/^[A-Z]{2,}$/.test(word)) return true;
    return false;
  }

  /**
   * Classify an entity mention
   */
  private classifyEntity(text: string): EntityMention['type'] {
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(text)) return 'proper_noun';
    if (this.isTechnicalTerm(text)) return 'technical_term';
    if (text.length > 15) return 'concept';
    return 'noun';
  }

  /**
   * Get statistics
   */
  getStats(): { totalCalls: number; resolveCount: number; entityCount: number } {
    return {
      totalCalls: this.totalCalls,
      resolveCount: this.resolveCount,
      entityCount: this.entityHistory.length,
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      entityHistory: this.entityHistory,
      resolveCount: this.resolveCount,
      totalCalls: this.totalCalls,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): CoreferenceResolver {
    const parsed = JSON.parse(data);
    const resolver = new CoreferenceResolver();
    resolver.entityHistory = parsed.entityHistory || [];
    resolver.resolveCount = parsed.resolveCount || 0;
    resolver.totalCalls = parsed.totalCalls || 0;
    return resolver;
  }
}
