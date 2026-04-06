/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  User Profile Model — Track User Preferences & Skill Levels                 ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Skill Tracking — Infer skill level per domain from interactions         ║
 * ║    ✦ Preference Learning — Track language & framework preferences            ║
 * ║    ✦ Response Adaptation — Adjust verbosity to skill level                   ║
 * ║    ✦ Persistence — Serialize/deserialize across sessions                     ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = 'beginner' | 'intermediate' | 'expert' | 'unknown';

export interface DomainSkill {
  level: SkillLevel;
  confidence: number;
  interactions: number;
}

export interface UserPreferences {
  preferredLanguages: string[];
  preferredFrameworks: string[];
  verbosityPreference: 'concise' | 'normal' | 'detailed';
}

export interface UserProfile {
  skillLevels: Record<string, DomainSkill>;
  preferredLanguages: string[];
  preferredFrameworks: string[];
  verbosityPreference: 'concise' | 'normal' | 'detailed';
  totalInteractions: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = new Set([
  'javascript', 'typescript', 'python', 'java', 'rust', 'go', 'ruby',
  'c++', 'c#', 'swift', 'kotlin', 'php', 'scala', 'haskell', 'elixir',
  'dart', 'lua', 'r', 'julia', 'perl', 'bash', 'sql', 'html', 'css',
]);

const FRAMEWORKS = new Set([
  'react', 'angular', 'vue', 'svelte', 'next.js', 'express', 'django',
  'flask', 'spring', 'rails', 'laravel', 'fastapi', 'nestjs', 'gatsby',
  'nuxt', 'remix', 'astro', 'tailwind', 'bootstrap', 'kubernetes',
  'docker', 'terraform', 'pytorch', 'tensorflow', 'pandas', 'numpy',
]);

const EXPERT_INDICATORS = [
  /\b(implement|architecture|optimize|performance|trade-?off|scalability)\b/i,
  /\b(design pattern|refactor|benchmark|profil(e|ing)|distributed)\b/i,
  /\b(concurrency|parallelism|latency|throughput|capacity)\b/i,
];

const BEGINNER_INDICATORS = [
  /\b(what is|how to|beginner|learn|tutorial|getting started)\b/i,
  /\b(simple|basic|easy|introduction|explain|help me understand)\b/i,
  /\b(first time|new to|just started|never used)\b/i,
];

// ── UserProfileModel Class ───────────────────────────────────────────────────

export class UserProfileModel {
  private profile: UserProfile;
  private updateCount = 0;

  constructor() {
    this.profile = {
      skillLevels: {},
      preferredLanguages: [],
      preferredFrameworks: [],
      verbosityPreference: 'normal',
      totalInteractions: 0,
    };
  }

  /**
   * Update profile from a user interaction
   */
  updateFromInteraction(query: string, domain: string, _responseQuality?: number): void {
    this.updateCount++;
    this.profile.totalInteractions++;

    // Update skill level for domain
    this.updateSkillLevel(query, domain);

    // Detect language/framework mentions
    this.detectPreferences(query);
  }

  /**
   * Get skill level for a domain
   */
  getSkillLevel(domain: string): SkillLevel {
    return this.profile.skillLevels[domain]?.level || 'unknown';
  }

  /**
   * Get user preferences
   */
  getPreferences(): UserPreferences {
    return {
      preferredLanguages: [...this.profile.preferredLanguages],
      preferredFrameworks: [...this.profile.preferredFrameworks],
      verbosityPreference: this.profile.verbosityPreference,
    };
  }

  /**
   * Get full profile
   */
  getProfile(): UserProfile {
    return {
      ...this.profile,
      skillLevels: { ...this.profile.skillLevels },
      preferredLanguages: [...this.profile.preferredLanguages],
      preferredFrameworks: [...this.profile.preferredFrameworks],
    };
  }

  /**
   * Adapt response based on user's skill level
   */
  adaptResponse(text: string, domain: string): string {
    const level = this.getSkillLevel(domain);
    if (level === 'beginner') {
      return text + '\n\n*💡 Tip: Feel free to ask follow-up questions for more detail.*';
    }
    return text;
  }

  /**
   * Update skill level for a domain
   */
  private updateSkillLevel(query: string, domain: string): void {
    const current = this.profile.skillLevels[domain] || {
      level: 'unknown' as SkillLevel,
      confidence: 0,
      interactions: 0,
    };
    current.interactions++;

    // Check for skill indicators
    const isExpert = EXPERT_INDICATORS.some(p => p.test(query));
    const isBeginner = BEGINNER_INDICATORS.some(p => p.test(query));

    if (isExpert) {
      if (current.level === 'unknown' || current.level === 'beginner') {
        current.level = 'intermediate';
      } else if (current.interactions >= 3) {
        current.level = 'expert';
      }
      current.confidence = Math.min(1, current.confidence + 0.15);
    } else if (isBeginner) {
      if (current.level === 'unknown') {
        current.level = 'beginner';
      }
      current.confidence = Math.min(1, current.confidence + 0.1);
    } else {
      // Default progression
      if (current.level === 'unknown' && current.interactions >= 2) {
        current.level = 'intermediate';
      }
      current.confidence = Math.min(1, current.confidence + 0.05);
    }

    this.profile.skillLevels[domain] = current;
  }

  /**
   * Detect language/framework preferences from query
   */
  private detectPreferences(query: string): void {
    const words = query.toLowerCase().split(/[\s,.:;!?()[\]{}]+/);

    for (const word of words) {
      if (LANGUAGES.has(word) && !this.profile.preferredLanguages.includes(word)) {
        this.profile.preferredLanguages.push(word);
        if (this.profile.preferredLanguages.length > 10) {
          this.profile.preferredLanguages.shift();
        }
      }
      if (FRAMEWORKS.has(word) && !this.profile.preferredFrameworks.includes(word)) {
        this.profile.preferredFrameworks.push(word);
        if (this.profile.preferredFrameworks.length > 10) {
          this.profile.preferredFrameworks.shift();
        }
      }
    }
  }

  /**
   * Get statistics
   */
  getStats(): { updateCount: number; totalInteractions: number; domainCount: number } {
    return {
      updateCount: this.updateCount,
      totalInteractions: this.profile.totalInteractions,
      domainCount: Object.keys(this.profile.skillLevels).length,
    };
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      profile: this.profile,
      updateCount: this.updateCount,
    });
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): UserProfileModel {
    const parsed = JSON.parse(data);
    const model = new UserProfileModel();
    model.profile = parsed.profile || model.profile;
    model.updateCount = parsed.updateCount || 0;
    return model;
  }
}
