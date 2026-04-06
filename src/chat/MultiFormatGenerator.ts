/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Multi-Format Generator — Adapt Output Format to Query Type                  ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Format Detection — Detect optimal output format from query              ║
 * ║    ✦ Code Formatting — Wrap code in proper blocks                            ║
 * ║    ✦ Table Generation — Create comparison tables                             ║
 * ║    ✦ List Formatting — Convert to bullet/numbered lists                      ║
 * ║    ✦ Step Formatting — Create step-by-step guides                            ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type FormatType = 'plain' | 'code' | 'table' | 'list' | 'steps' | 'comparison';

export interface FormatDetection {
  recommendedFormat: FormatType;
  confidence: number;
  indicators: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const FORMAT_PATTERNS: Record<FormatType, { patterns: RegExp[]; keywords: string[] }> = {
  code: {
    patterns: [
      /\b(write|show|create|implement)\s+(a|an|the)?\s*(function|class|method|code|script|program)\b/i,
      /\b(code|implement|write)\s+(for|to|that)\b/i,
      /\bshow\s+me\s+(the\s+)?code\b/i,
      /\bgive\s+me\s+an?\s+example\b/i,
    ],
    keywords: ['code', 'function', 'implement', 'script', 'snippet', 'example'],
  },
  table: {
    patterns: [
      /\bcompare\b/i,
      /\bpros\s+and\s+cons\b/i,
      /\badvantages\s+and\s+disadvantages\b/i,
      /\bdifferences?\s+between\b/i,
      /\bvs\.?\b/i,
    ],
    keywords: ['compare', 'versus', 'differences', 'pros', 'cons', 'advantages'],
  },
  list: {
    patterns: [
      /\blist\s+(all|the|some)\b/i,
      /\bwhat\s+are\s+(the|some|all)\b/i,
      /\btypes?\s+of\b/i,
      /\boptions?\s+for\b/i,
      /\bfeatures?\s+of\b/i,
    ],
    keywords: ['list', 'types', 'options', 'features', 'enumerate'],
  },
  steps: {
    patterns: [
      /\bhow\s+to\b/i,
      /\bstep\s+by\s+step\b/i,
      /\bsteps?\s+to\b/i,
      /\bguide\s+(to|for)\b/i,
      /\btutorial\b/i,
      /\bprocess\s+(for|to)\b/i,
    ],
    keywords: ['how to', 'steps', 'guide', 'tutorial', 'process', 'setup'],
  },
  comparison: {
    patterns: [
      /\bwhich\s+is\s+(better|best|faster|more)\b/i,
      /\bshould\s+i\s+use\b/i,
      /\bvs\.?\b/i,
      /\bversus\b/i,
    ],
    keywords: ['better', 'best', 'versus', 'should I use', 'which'],
  },
  plain: {
    patterns: [],
    keywords: [],
  },
};

// ── MultiFormatGenerator Class ───────────────────────────────────────────────

export class MultiFormatGenerator {
  private detectCount = 0;
  private formatCount = 0;
  private formatCounts: Record<string, number> = {};

  constructor() {
    this.formatCounts = {};
  }

  /**
   * Detect optimal format for a query
   */
  detectFormat(query: string): FormatDetection {
    this.detectCount++;

    if (!query || query.trim().length === 0) {
      return { recommendedFormat: 'plain', confidence: 0.5, indicators: [] };
    }

    const trimmed = query.trim().toLowerCase();
    let bestFormat: FormatType = 'plain';
    let bestScore = 0;
    let bestIndicators: string[] = [];

    for (const [format, { patterns, keywords }] of Object.entries(FORMAT_PATTERNS) as Array<[FormatType, { patterns: RegExp[]; keywords: string[] }]>) {
      if (format === 'plain') continue;

      let score = 0;
      const indicators: string[] = [];

      for (const pattern of patterns) {
        if (pattern.test(trimmed)) {
          score += 0.35;
          indicators.push(`pattern:${pattern.source.slice(0, 25)}`);
        }
      }

      for (const keyword of keywords) {
        if (trimmed.includes(keyword)) {
          score += 0.15;
          indicators.push(`keyword:${keyword}`);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestFormat = format;
        bestIndicators = indicators;
      }
    }

    this.formatCounts[bestFormat] = (this.formatCounts[bestFormat] || 0) + 1;

    return {
      recommendedFormat: bestFormat,
      confidence: Math.min(1, bestScore),
      indicators: bestIndicators,
    };
  }

  /**
   * Format text according to format type
   */
  format(text: string, formatType: string): string {
    this.formatCount++;

    switch (formatType) {
      case 'code':
        return this.formatAsCode(text);
      case 'table':
        return this.formatAsTable(text);
      case 'list':
        return this.formatAsList(text);
      case 'steps':
        return this.formatAsSteps(text);
      case 'comparison':
        return this.formatAsTable(text); // comparison uses table format
      default:
        return text;
    }
  }

  /**
   * Format as code block (wrap if not already)
   */
  private formatAsCode(text: string): string {
    if (text.includes('```')) return text; // already formatted
    return '```\n' + text + '\n```';
  }

  /**
   * Format as markdown table
   */
  private formatAsTable(text: string): string {
    // If already has table markers, return as-is
    if (text.includes('|') && text.includes('---')) return text;

    // Try to extract comparison items
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return text;

    return text; // return as-is if we can't reliably table-ify
  }

  /**
   * Format as bullet list
   */
  private formatAsList(text: string): string {
    // If already has list markers, return as-is
    if (/^[-*•]\s/m.test(text)) return text;

    // Split by sentences and format as list
    const sentences = text.split(/[.]\s+/).filter(s => s.trim().length > 5);
    if (sentences.length <= 1) return text;

    return sentences.map(s => `• ${s.trim().replace(/\.$/, '')}`).join('\n');
  }

  /**
   * Format as numbered steps
   */
  private formatAsSteps(text: string): string {
    // If already has numbered steps, return as-is
    if (/^\d+[.)]\s/m.test(text)) return text;

    // Split by sentences and number them
    const sentences = text.split(/[.]\s+/).filter(s => s.trim().length > 5);
    if (sentences.length <= 1) return text;

    return sentences.map((s, i) => `${i + 1}. ${s.trim().replace(/\.$/, '')}`).join('\n');
  }

  /**
   * Get statistics
   */
  getStats(): {
    detectCount: number;
    formatCount: number;
    formatCounts: Record<string, number>;
  } {
    return {
      detectCount: this.detectCount,
      formatCount: this.formatCount,
      formatCounts: { ...this.formatCounts },
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      detectCount: this.detectCount,
      formatCount: this.formatCount,
      formatCounts: this.formatCounts,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): MultiFormatGenerator {
    const parsed = JSON.parse(data);
    const generator = new MultiFormatGenerator();
    generator.detectCount = parsed.detectCount || 0;
    generator.formatCount = parsed.formatCount || 0;
    generator.formatCounts = parsed.formatCounts || {};
    return generator;
  }
}
