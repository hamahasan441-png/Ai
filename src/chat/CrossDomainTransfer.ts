/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Cross-Domain Transfer — Knowledge Transfer Across Multiple Domains          ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Domain Adjacency — Map related knowledge domains                        ║
 * ║    ✦ Multi-domain Detection — Identify cross-domain queries                  ║
 * ║    ✦ Knowledge Combination — Merge insights from multiple domains            ║
 * ║    ✦ Analogy Transfer — Apply patterns from one domain to another            ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrossDomainResult {
  isCrossDomain: boolean;
  primaryDomain: string;
  secondaryDomains: string[];
  transferStrategy: 'combine' | 'bridge' | 'analogize';
  confidence: number;
  bridgeConcepts: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_ADJACENCY: Record<string, string[]> = {
  'machine_learning': ['data_science', 'statistics', 'python', 'cloud', 'nlp', 'computer_vision'],
  'data_science': ['machine_learning', 'statistics', 'python', 'databases', 'visualization'],
  'web_development': ['javascript', 'typescript', 'react', 'frontend', 'backend', 'api_design'],
  'cloud': ['devops', 'kubernetes', 'docker', 'microservices', 'serverless', 'infrastructure'],
  'devops': ['cloud', 'ci_cd', 'docker', 'kubernetes', 'monitoring', 'sre'],
  'security': ['networking', 'cryptography', 'devsecops', 'pentesting', 'compliance'],
  'databases': ['sql', 'nosql', 'data_engineering', 'backend', 'performance'],
  'mobile': ['ios', 'android', 'react_native', 'flutter', 'ui_ux'],
  'systems': ['os', 'networking', 'distributed_systems', 'performance', 'embedded'],
  'frontend': ['css', 'javascript', 'react', 'ui_ux', 'accessibility'],
  'backend': ['api_design', 'databases', 'microservices', 'authentication', 'caching'],
  'blockchain': ['cryptography', 'distributed_systems', 'smart_contracts', 'defi'],
  'game_development': ['graphics', 'physics', 'audio', 'ai', 'performance'],
  'data_engineering': ['databases', 'etl', 'streaming', 'cloud', 'data_science'],
  'nlp': ['machine_learning', 'linguistics', 'text_processing', 'chatbots'],
  'api_design': ['rest', 'graphql', 'grpc', 'backend', 'microservices'],
};

const BRIDGE_CONCEPTS: Record<string, Record<string, string[]>> = {
  'machine_learning+cloud': ['MLOps', 'model deployment', 'GPU instances', 'model serving'],
  'security+devops': ['DevSecOps', 'SAST/DAST', 'secret management', 'compliance as code'],
  'frontend+backend': ['full-stack', 'API integration', 'SSR', 'BFF pattern'],
  'databases+cloud': ['managed databases', 'database migration', 'multi-region replication'],
  'mobile+backend': ['mobile BFF', 'push notifications', 'offline sync', 'API gateway'],
};

// ── CrossDomainTransfer Class ────────────────────────────────────────────────

export class CrossDomainTransfer {
  private detectCount = 0;
  private crossDomainCount = 0;
  private strategyCounts: Record<string, number> = {};

  constructor() {
    this.strategyCounts = {};
  }

  /**
   * Detect if a query spans multiple domains
   */
  detectCrossDomain(query: string, matchedDomains: string[]): CrossDomainResult {
    this.detectCount++;

    if (matchedDomains.length <= 1) {
      return {
        isCrossDomain: false,
        primaryDomain: matchedDomains[0] || 'general',
        secondaryDomains: [],
        transferStrategy: 'combine',
        confidence: 0,
        bridgeConcepts: [],
      };
    }

    this.crossDomainCount++;
    const primaryDomain = matchedDomains[0]!;
    const secondaryDomains = matchedDomains.slice(1);

    // Determine strategy based on domain adjacency
    const strategy = this.selectStrategy(primaryDomain, secondaryDomains);
    this.strategyCounts[strategy] = (this.strategyCounts[strategy] || 0) + 1;

    // Find bridge concepts
    const bridgeConcepts = this.findBridgeConcepts(primaryDomain, secondaryDomains);

    // Calculate confidence based on adjacency
    const confidence = this.calculateConfidence(primaryDomain, secondaryDomains);

    return {
      isCrossDomain: true,
      primaryDomain,
      secondaryDomains,
      transferStrategy: strategy,
      confidence,
      bridgeConcepts,
    };
  }

  /**
   * Combine knowledge from multiple domains
   */
  combineKnowledge(
    entries: Array<{ domain: string; content: string; confidence: number }>
  ): string {
    if (entries.length === 0) return '';
    if (entries.length === 1) return entries[0]!.content;

    // Sort by confidence
    const sorted = [...entries].sort((a, b) => b.confidence - a.confidence);

    const parts: string[] = [];
    for (const entry of sorted) {
      parts.push(`[${entry.domain}] ${entry.content}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Select transfer strategy
   */
  private selectStrategy(
    primary: string,
    secondary: string[]
  ): CrossDomainResult['transferStrategy'] {
    // Check if domains are adjacent
    const adjacent = DOMAIN_ADJACENCY[primary] || [];
    const adjacentCount = secondary.filter(d => adjacent.includes(d)).length;

    if (adjacentCount === secondary.length) return 'combine';
    if (adjacentCount > 0) return 'bridge';
    return 'analogize';
  }

  /**
   * Find bridge concepts between domains
   */
  private findBridgeConcepts(primary: string, secondary: string[]): string[] {
    const bridges: string[] = [];

    for (const sec of secondary) {
      const key1 = `${primary}+${sec}`;
      const key2 = `${sec}+${primary}`;
      const concepts = BRIDGE_CONCEPTS[key1] || BRIDGE_CONCEPTS[key2] || [];
      bridges.push(...concepts);
    }

    return [...new Set(bridges)];
  }

  /**
   * Calculate confidence in cross-domain connection
   */
  private calculateConfidence(primary: string, secondary: string[]): number {
    const adjacent = DOMAIN_ADJACENCY[primary] || [];
    let totalAdjacency = 0;

    for (const sec of secondary) {
      if (adjacent.includes(sec)) {
        totalAdjacency += 1;
      } else {
        // Check reverse adjacency
        const secAdjacent = DOMAIN_ADJACENCY[sec] || [];
        if (secAdjacent.includes(primary)) {
          totalAdjacency += 0.7;
        } else {
          totalAdjacency += 0.3;
        }
      }
    }

    return Math.min(1, totalAdjacency / secondary.length);
  }

  /**
   * Get statistics
   */
  getStats(): {
    detectCount: number;
    crossDomainCount: number;
    strategyCounts: Record<string, number>;
  } {
    return {
      detectCount: this.detectCount,
      crossDomainCount: this.crossDomainCount,
      strategyCounts: { ...this.strategyCounts },
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      detectCount: this.detectCount,
      crossDomainCount: this.crossDomainCount,
      strategyCounts: this.strategyCounts,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): CrossDomainTransfer {
    const parsed = JSON.parse(data);
    const transfer = new CrossDomainTransfer();
    transfer.detectCount = parsed.detectCount || 0;
    transfer.crossDomainCount = parsed.crossDomainCount || 0;
    transfer.strategyCounts = parsed.strategyCounts || {};
    return transfer;
  }
}
