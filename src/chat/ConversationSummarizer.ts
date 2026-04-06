/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Conversation Summarizer — Summarize Conversations for Long-Term Memory     ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Key Point Extraction — Identify important points                        ║
 * ║    ✦ Topic Tracking — Track discussed topics                                 ║
 * ║    ✦ Decision Tracking — Detect decisions made                               ║
 * ║    ✦ Open Question Tracking — Track unanswered questions                     ║
 * ║    ✦ Incremental Summarization — Update summary with each turn               ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  keyPoints: string[];
  topics: string[];
  decisions: string[];
  openQuestions: string[];
  turnCount: number;
  duration: { firstTurn: string; lastTurn: string };
}

// ── Constants ────────────────────────────────────────────────────────────────

const DECISION_PATTERNS = [
  /\blet'?s?\s+use\b/i,
  /\bwe\s+should\s+go\s+with\b/i,
  /\bi('ll|'ll| will)\s+choose\b/i,
  /\blet'?s?\s+go\s+with\b/i,
  /\bdecided\s+to\b/i,
  /\bwe('ll|'ll| will)\s+use\b/i,
  /\bthe\s+plan\s+is\b/i,
  /\bi('m| am)\s+going\s+(to|with)\b/i,
];

const QUESTION_PATTERNS = [
  /\?$/,
  /^(what|where|when|why|who|how|which)\b/i,
  /\bcan\s+you\s+(explain|tell|show|help)\b/i,
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'web development': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'frontend', 'backend'],
  'machine learning': ['ml', 'model', 'training', 'neural', 'deep learning', 'ai', 'dataset'],
  'databases': ['sql', 'nosql', 'postgres', 'mysql', 'mongodb', 'query', 'schema', 'database'],
  'devops': ['docker', 'kubernetes', 'ci/cd', 'pipeline', 'deploy', 'container', 'cloud'],
  'security': ['authentication', 'encryption', 'vulnerability', 'security', 'ssl', 'tls'],
  'performance': ['optimize', 'cache', 'latency', 'throughput', 'performance', 'benchmark'],
  'testing': ['test', 'unit test', 'integration', 'e2e', 'coverage', 'mock', 'stub'],
  'architecture': ['microservice', 'monolith', 'pattern', 'design', 'architecture', 'scalability'],
};

// ── ConversationSummarizer Class ─────────────────────────────────────────────

export class ConversationSummarizer {
  private turns: Array<{ role: string; content: string; timestamp: string }> = [];
  private summary: ConversationSummary;
  private summarizeCount = 0;

  constructor() {
    const now = new Date().toISOString();
    this.summary = {
      keyPoints: [],
      topics: [],
      decisions: [],
      openQuestions: [],
      turnCount: 0,
      duration: { firstTurn: now, lastTurn: now },
    };
  }

  /**
   * Add a turn and incrementally update summary
   */
  addTurn(role: string, content: string): void {
    const timestamp = new Date().toISOString();
    this.turns.push({ role, content, timestamp });
    this.summary.turnCount++;
    this.summary.duration.lastTurn = timestamp;

    if (this.summary.turnCount === 1) {
      this.summary.duration.firstTurn = timestamp;
    }

    // Extract information from this turn
    this.extractKeyPoints(content);
    this.extractTopics(content);
    this.extractDecisions(content);
    this.trackQuestions(content, role);
  }

  /**
   * Summarize a batch of messages
   */
  summarize(
    messages: Array<{ role: string; content: string }>
  ): ConversationSummary {
    this.summarizeCount++;

    // Reset and process all messages
    const now = new Date().toISOString();
    this.summary = {
      keyPoints: [],
      topics: [],
      decisions: [],
      openQuestions: [],
      turnCount: 0,
      duration: { firstTurn: now, lastTurn: now },
    };

    for (const msg of messages) {
      this.addTurn(msg.role, msg.content);
    }

    return this.getSummary();
  }

  /**
   * Get current summary
   */
  getSummary(): ConversationSummary {
    return {
      keyPoints: [...this.summary.keyPoints],
      topics: [...this.summary.topics],
      decisions: [...this.summary.decisions],
      openQuestions: [...this.summary.openQuestions],
      turnCount: this.summary.turnCount,
      duration: { ...this.summary.duration },
    };
  }

  /**
   * Get summary for a specific topic
   */
  getTopicSummary(topic: string): string | null {
    const lower = topic.toLowerCase();
    if (!this.summary.topics.some(t => t.toLowerCase().includes(lower))) {
      return null;
    }

    const relevant = this.summary.keyPoints.filter(kp =>
      kp.toLowerCase().includes(lower)
    );
    if (relevant.length === 0) return `Topic "${topic}" was discussed.`;
    return relevant.join('. ');
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): void {
    const sentences = content.split(/[.!]+/).filter(s => s.trim().length > 15);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      const importance = this.scoreSentenceImportance(trimmed);
      if (importance > 0.5 && this.summary.keyPoints.length < 20) {
        // Truncate long sentences
        const keyPoint = trimmed.length > 120 ? trimmed.slice(0, 117) + '...' : trimmed;
        if (!this.summary.keyPoints.includes(keyPoint)) {
          this.summary.keyPoints.push(keyPoint);
        }
      }
    }
  }

  /**
   * Score sentence importance (0-1)
   */
  private scoreSentenceImportance(sentence: string): number {
    let score = 0;

    // Contains technical terms
    if (/\b[A-Z]{2,}\b/.test(sentence)) score += 0.2; // acronyms
    if (/\b[a-z]+[A-Z]\w+\b/.test(sentence)) score += 0.2; // camelCase
    if (/\b\w+\.\w+\b/.test(sentence)) score += 0.1; // dot notation

    // Contains actionable language
    if (/\b(should|must|need|important|critical|recommend)\b/i.test(sentence)) score += 0.3;

    // Contains quantitative info
    if (/\b\d+(?:\.\d+)?%?\b/.test(sentence)) score += 0.1;

    // Length factor (not too short, not too long)
    const words = sentence.split(/\s+/).length;
    if (words >= 5 && words <= 30) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Extract topics from content
   */
  private extractTopics(content: string): void {
    const lower = content.toLowerCase();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (this.summary.topics.includes(topic)) continue;
      if (keywords.some(kw => lower.includes(kw))) {
        this.summary.topics.push(topic);
      }
    }
  }

  /**
   * Extract decisions from content
   */
  private extractDecisions(content: string): void {
    const sentences = content.split(/[.!]+/).filter(s => s.trim().length > 5);
    for (const sentence of sentences) {
      for (const pattern of DECISION_PATTERNS) {
        if (pattern.test(sentence.trim())) {
          const decision = sentence.trim().length > 100
            ? sentence.trim().slice(0, 97) + '...'
            : sentence.trim();
          if (!this.summary.decisions.includes(decision)) {
            this.summary.decisions.push(decision);
          }
          break;
        }
      }
    }
  }

  /**
   * Track questions and mark answered ones
   */
  private trackQuestions(content: string, role: string): void {
    if (role === 'user') {
      // Check for questions
      const sentences = content.split(/[.!]+/);
      for (const sentence of sentences) {
        if (QUESTION_PATTERNS.some(p => p.test(sentence.trim()))) {
          const q = sentence.trim().length > 100
            ? sentence.trim().slice(0, 97) + '...'
            : sentence.trim();
          if (q.length > 5 && !this.summary.openQuestions.includes(q)) {
            this.summary.openQuestions.push(q);
          }
        }
      }
    } else if (role === 'assistant' && this.summary.openQuestions.length > 0) {
      // Heuristic: if assistant responds, mark most recent question as answered
      this.summary.openQuestions.pop();
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    summarizeCount: number;
    turnCount: number;
    keyPointCount: number;
    topicCount: number;
  } {
    return {
      summarizeCount: this.summarizeCount,
      turnCount: this.summary.turnCount,
      keyPointCount: this.summary.keyPoints.length,
      topicCount: this.summary.topics.length,
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      turns: this.turns,
      summary: this.summary,
      summarizeCount: this.summarizeCount,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): ConversationSummarizer {
    const parsed = JSON.parse(data);
    const summarizer = new ConversationSummarizer();
    summarizer.turns = parsed.turns || [];
    summarizer.summary = parsed.summary || summarizer.summary;
    summarizer.summarizeCount = parsed.summarizeCount || 0;
    return summarizer;
  }
}
