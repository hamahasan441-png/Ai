/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Counterfactual Reasoner — "What If" Scenario Analysis                      ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Counterfactual Detection — Identify "what if" scenarios                 ║
 * ║    ✦ Premise Extraction — Parse the hypothetical condition                   ║
 * ║    ✦ Implication Generation — Predict likely consequences                    ║
 * ║    ✦ Risk Analysis — Identify potential negative outcomes                    ║
 * ║    ✦ Alternative Suggestion — Propose other options                          ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CounterfactualResult {
  isCounterfactual: boolean;
  premise: string;
  implications: string[];
  risks: string[];
  alternatives: string[];
  confidence: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const COUNTERFACTUAL_PATTERNS = [
  /\bwhat\s+if\b/i,
  /\bsuppose\b/i,
  /\bimagine\b/i,
  /\bhypothetically\b/i,
  /\bif\s+we\s+(changed|switched|replaced|used|moved|migrated)\b/i,
  /\bwhat\s+would\s+happen\b/i,
  /\bwhat\s+happens\s+if\b/i,
  /\bif\s+instead\b/i,
  /\bconsider\s+switching\b/i,
  /\bhad\s+we\s+chosen\b/i,
];

interface ScenarioTemplate {
  pattern: RegExp;
  category: string;
  implications: string[];
  risks: string[];
  alternatives: string[];
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    pattern: /\b(monolith|microservice|service-oriented|SOA)\b/i,
    category: 'architecture',
    implications: [
      'Service boundaries would need to be carefully defined',
      'Inter-service communication patterns must be established (REST, gRPC, message queues)',
      'Each service can scale independently based on demand',
      'Deployment complexity increases with independent service lifecycles',
    ],
    risks: [
      'Distributed system complexity (network failures, data consistency)',
      'Debugging across service boundaries becomes harder',
      'Operational overhead for managing multiple services',
    ],
    alternatives: [
      'Start with a modular monolith for easier initial development',
      'Consider a hybrid approach with key services extracted',
      'Use a service mesh to manage complexity',
    ],
  },
  {
    pattern: /\b(python|java|javascript|typescript|rust|go|golang|ruby|c\+\+|csharp|c#)\b/i,
    category: 'language',
    implications: [
      'Team would need to learn or upskill in the new language ecosystem',
      'Existing libraries and tooling would change significantly',
      'Performance characteristics would differ based on language runtime',
      'Hiring and talent pool would be affected',
    ],
    risks: [
      'Migration cost could be significant for large codebases',
      'Potential loss of existing expertise and institutional knowledge',
      'Library ecosystem may lack equivalent functionality',
    ],
    alternatives: [
      'Consider gradually introducing the new language for new components',
      'Use polyglot architecture to leverage strengths of both languages',
      'Evaluate if the benefits justify the migration cost',
    ],
  },
  {
    pattern: /\b(sql|nosql|postgres|mysql|mongodb|redis|dynamodb|cassandra)\b/i,
    category: 'database',
    implications: [
      'Data model would need to be redesigned for the new paradigm',
      'Query patterns and access patterns would change',
      'Data migration strategy needs careful planning',
      'Application code interacting with the database must be updated',
    ],
    risks: [
      'Data loss risk during migration if not carefully planned',
      'Performance may vary significantly under different workloads',
      'Consistency guarantees may differ (ACID vs eventual consistency)',
    ],
    alternatives: [
      'Use polyglot persistence — different stores for different use cases',
      'Start with a proof of concept before full migration',
      'Consider a data lake approach for analytics needs',
    ],
  },
  {
    pattern: /\b(scale|traffic|load|10x|100x|millions|concurrent)\b/i,
    category: 'scaling',
    implications: [
      'Infrastructure costs would increase proportionally or more',
      'Caching strategies become critical for performance',
      'Database query optimization and indexing need review',
      'Load balancing and horizontal scaling must be implemented',
    ],
    risks: [
      'Single points of failure become critical bottlenecks',
      'Costs may grow faster than revenue without optimization',
      'Data consistency challenges under high concurrency',
    ],
    alternatives: [
      'Implement aggressive caching at multiple levels',
      'Use CDN for static assets and edge computing for dynamic content',
      'Consider event-driven architecture for better scalability',
    ],
  },
  {
    pattern: /\b(cloud|aws|azure|gcp|on-?prem|kubernetes|serverless)\b/i,
    category: 'infrastructure',
    implications: [
      'Deployment pipelines would need to be reconfigured',
      'Networking and security policies must be updated',
      'Cost model changes between cloud providers or on-prem',
      'Team needs expertise in the new platform',
    ],
    risks: [
      'Vendor lock-in to cloud-specific services',
      'Migration downtime if not carefully planned',
      'Unexpected cost increases from cloud pricing models',
    ],
    alternatives: [
      'Use infrastructure-as-code for portability',
      'Consider multi-cloud strategy to avoid lock-in',
      'Evaluate hybrid cloud for gradual migration',
    ],
  },
];

// ── CounterfactualReasoner Class ─────────────────────────────────────────────

export class CounterfactualReasoner {
  private analyzeCount = 0;
  private counterfactualCount = 0;
  private categoryCounts: Record<string, number> = {};

  constructor() {
    this.categoryCounts = {};
  }

  /**
   * Check if text contains a counterfactual
   */
  isCounterfactual(text: string): boolean {
    return COUNTERFACTUAL_PATTERNS.some(p => p.test(text));
  }

  /**
   * Analyze a counterfactual scenario
   */
  analyze(query: string): CounterfactualResult {
    this.analyzeCount++;

    if (!query || !this.isCounterfactual(query)) {
      return {
        isCounterfactual: false,
        premise: '',
        implications: [],
        risks: [],
        alternatives: [],
        confidence: 0,
      };
    }

    this.counterfactualCount++;

    // Extract premise
    const premise = this.extractPremise(query);

    // Find matching scenario templates
    const matchedTemplates = SCENARIO_TEMPLATES.filter(t => t.pattern.test(query));

    let implications: string[] = [];
    let risks: string[] = [];
    let alternatives: string[] = [];
    let confidence = 0.5;

    if (matchedTemplates.length > 0) {
      // Combine from matched templates
      for (const template of matchedTemplates) {
        implications.push(...template.implications);
        risks.push(...template.risks);
        alternatives.push(...template.alternatives);
        this.categoryCounts[template.category] =
          (this.categoryCounts[template.category] || 0) + 1;
      }
      confidence = Math.min(1, 0.5 + matchedTemplates.length * 0.15);
    } else {
      // Generic counterfactual response
      implications = [
        'The change would affect existing workflows and processes',
        'Team familiarity and training needs would change',
        'Integration points with other systems need evaluation',
      ];
      risks = [
        'Unknown unknowns in the new approach',
        'Transition period may affect productivity',
      ];
      alternatives = [
        'Consider a gradual migration approach',
        'Prototype the change before committing fully',
      ];
    }

    // Deduplicate
    implications = [...new Set(implications)];
    risks = [...new Set(risks)];
    alternatives = [...new Set(alternatives)];

    return {
      isCounterfactual: true,
      premise,
      implications,
      risks,
      alternatives,
      confidence,
    };
  }

  /**
   * Extract the premise (hypothetical condition) from text
   */
  private extractPremise(text: string): string {
    // Try various patterns
    const patterns = [
      /what\s+if\s+(.+?)(?:\?|$)/i,
      /suppose\s+(.+?)(?:\?|$)/i,
      /imagine\s+(.+?)(?:\?|$)/i,
      /if\s+we\s+(.+?)(?:\?|,|$)/i,
      /what\s+would\s+happen\s+if\s+(.+?)(?:\?|$)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return text.replace(/\?/g, '').trim();
  }

  /**
   * Get statistics
   */
  getStats(): {
    analyzeCount: number;
    counterfactualCount: number;
    categoryCounts: Record<string, number>;
  } {
    return {
      analyzeCount: this.analyzeCount,
      counterfactualCount: this.counterfactualCount,
      categoryCounts: { ...this.categoryCounts },
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      analyzeCount: this.analyzeCount,
      counterfactualCount: this.counterfactualCount,
      categoryCounts: this.categoryCounts,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): CounterfactualReasoner {
    const parsed = JSON.parse(data);
    const reasoner = new CounterfactualReasoner();
    reasoner.analyzeCount = parsed.analyzeCount || 0;
    reasoner.counterfactualCount = parsed.counterfactualCount || 0;
    reasoner.categoryCounts = parsed.categoryCounts || {};
    return reasoner;
  }
}
