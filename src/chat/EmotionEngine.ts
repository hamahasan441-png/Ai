/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          💭  E M O T I O N   E N G I N E                                    ║
 * ║                                                                             ║
 * ║   Sentiment analysis and emotion detection for programming contexts:        ║
 * ║     analyse → detect → empathise → adapt                                    ║
 * ║                                                                             ║
 * ║     • Sentiment scoring with keyword + pattern matching                     ║
 * ║     • Emotion classification (frustration, excitement, etc.)                ║
 * ║     • Empathetic response generation with tone adjustment                   ║
 * ║     • Emotion timeline tracking and trend detection                         ║
 * ║     • Pattern recognition for recurring emotional states                    ║
 * ║     • Feedback-driven accuracy improvement                                  ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface EmotionEngineConfig {
  sensitivityLevel: number;
  maxEmotionHistory: number;
  enableEmpathy: boolean;
  neutralThreshold: number;
  decayRate: number;
  contextWindowSize: number;
}

export interface EmotionEngineStats {
  totalAnalyses: number;
  totalEmotionsDetected: number;
  totalEmpathyGenerated: number;
  totalFeedbackReceived: number;
  avgSentimentScore: number;
  emotionDistribution: Record<string, number>;
}

export type EmotionCategory =
  | 'frustration' | 'confusion' | 'excitement' | 'satisfaction'
  | 'curiosity' | 'anxiety' | 'boredom' | 'determination'
  | 'pride' | 'overwhelmed' | 'neutral';

export interface SentimentResult {
  score: number;
  magnitude: number;
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  keywords: string[];
}

export interface EmotionDetection {
  id: string;
  primary: EmotionCategory;
  secondary: EmotionCategory | null;
  intensity: number;
  confidence: number;
  triggers: string[];
  context: string;
}

export interface EmpathyResponse {
  acknowledgment: string;
  suggestion: string;
  reframe: string;
  encouragement: string;
  actionItems: string[];
  tone: 'supportive' | 'celebratory' | 'calming' | 'motivating' | 'neutral';
}

export interface EmotionTimeline {
  entries: Array<{
    timestamp: number;
    emotion: EmotionCategory;
    intensity: number;
    trigger: string;
  }>;
  trend: 'improving' | 'declining' | 'stable' | 'volatile';
  dominantEmotion: EmotionCategory;
  averageIntensity: number;
}

export interface EmotionalContext {
  currentEmotion: EmotionDetection;
  recentEmotions: EmotionDetection[];
  emotionalTrend: 'improving' | 'declining' | 'stable' | 'volatile';
  stressLevel: number;
  engagementLevel: number;
  needsSupport: boolean;
}

export interface EmotionPattern {
  trigger: string;
  emotion: EmotionCategory;
  frequency: number;
  avgIntensity: number;
}

// ── Sentiment lexicon ────────────────────────────────────────────────────────

interface LexiconEntry {
  word: string;
  score: number;        // -1 to 1
  emotions: EmotionCategory[];
  domain: string;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
  'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some',
  'such', 'than', 'too', 'very', 'just', 'because', 'if', 'when',
  'where', 'how', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'it', 'its', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
]);

function buildSentimentLexicon(): LexiconEntry[] {
  const entries: LexiconEntry[] = [];
  const add = (word: string, score: number, emotions: EmotionCategory[], domain: string) => {
    entries.push({ word, score, emotions, domain });
  };

  // ── Negative (programming context) ──
  add('bug', -0.6, ['frustration'], 'code');
  add('error', -0.5, ['frustration', 'anxiety'], 'code');
  add('crash', -0.8, ['frustration', 'anxiety'], 'code');
  add('fail', -0.6, ['frustration'], 'code');
  add('failed', -0.7, ['frustration'], 'code');
  add('failure', -0.7, ['frustration', 'overwhelmed'], 'code');
  add('broken', -0.7, ['frustration'], 'code');
  add('stuck', -0.6, ['frustration', 'confusion'], 'general');
  add('confused', -0.5, ['confusion'], 'general');
  add('confusing', -0.5, ['confusion'], 'general');
  add('impossible', -0.7, ['overwhelmed', 'frustration'], 'general');
  add('terrible', -0.8, ['frustration'], 'general');
  add('horrible', -0.8, ['frustration'], 'general');
  add('awful', -0.7, ['frustration'], 'general');
  add('hate', -0.8, ['frustration'], 'general');
  add('annoying', -0.6, ['frustration'], 'general');
  add('frustrated', -0.7, ['frustration'], 'general');
  add('frustrating', -0.7, ['frustration'], 'general');
  add('deadline', -0.3, ['anxiety'], 'work');
  add('urgent', -0.4, ['anxiety'], 'work');
  add('overdue', -0.5, ['anxiety'], 'work');
  add('overwhelmed', -0.6, ['overwhelmed'], 'general');
  add('complex', -0.2, ['anxiety', 'curiosity'], 'code');
  add('complicated', -0.4, ['confusion', 'overwhelmed'], 'code');
  add('deprecated', -0.3, ['anxiety'], 'code');
  add('legacy', -0.2, ['boredom', 'frustration'], 'code');
  add('spaghetti', -0.6, ['frustration'], 'code');
  add('nightmare', -0.8, ['frustration', 'overwhelmed'], 'general');
  add('slow', -0.4, ['frustration', 'boredom'], 'code');
  add('boring', -0.5, ['boredom'], 'general');
  add('tedious', -0.5, ['boredom'], 'general');
  add('repetitive', -0.4, ['boredom'], 'general');
  add('worried', -0.5, ['anxiety'], 'general');
  add('nervous', -0.4, ['anxiety'], 'general');
  add('scared', -0.5, ['anxiety'], 'general');
  add('regression', -0.5, ['frustration', 'anxiety'], 'code');
  add('memory leak', -0.6, ['anxiety', 'frustration'], 'code');
  add('vulnerability', -0.5, ['anxiety'], 'code');
  add('downtime', -0.6, ['anxiety', 'frustration'], 'ops');

  // ── Positive ──
  add('fix', 0.5, ['satisfaction'], 'code');
  add('fixed', 0.6, ['satisfaction', 'pride'], 'code');
  add('solved', 0.7, ['satisfaction', 'pride'], 'code');
  add('works', 0.5, ['satisfaction', 'excitement'], 'code');
  add('working', 0.4, ['satisfaction'], 'code');
  add('success', 0.7, ['satisfaction', 'pride'], 'general');
  add('successful', 0.7, ['satisfaction', 'pride'], 'general');
  add('great', 0.6, ['excitement', 'satisfaction'], 'general');
  add('awesome', 0.7, ['excitement'], 'general');
  add('amazing', 0.8, ['excitement'], 'general');
  add('excellent', 0.8, ['excitement', 'pride'], 'general');
  add('perfect', 0.7, ['satisfaction', 'pride'], 'general');
  add('love', 0.7, ['excitement', 'satisfaction'], 'general');
  add('elegant', 0.6, ['satisfaction', 'pride'], 'code');
  add('clean', 0.4, ['satisfaction'], 'code');
  add('fast', 0.4, ['satisfaction', 'excitement'], 'code');
  add('efficient', 0.5, ['satisfaction'], 'code');
  add('optimized', 0.5, ['satisfaction', 'pride'], 'code');
  add('refactor', 0.3, ['determination'], 'code');
  add('refactored', 0.5, ['satisfaction', 'determination'], 'code');
  add('deploy', 0.3, ['excitement', 'anxiety'], 'ops');
  add('deployed', 0.5, ['satisfaction', 'pride'], 'ops');
  add('shipped', 0.6, ['pride', 'excitement'], 'ops');
  add('released', 0.5, ['pride', 'excitement'], 'ops');
  add('learned', 0.5, ['curiosity', 'satisfaction'], 'general');
  add('learning', 0.4, ['curiosity', 'determination'], 'general');
  add('interesting', 0.5, ['curiosity', 'excitement'], 'general');
  add('curious', 0.4, ['curiosity'], 'general');
  add('discover', 0.5, ['curiosity', 'excitement'], 'general');
  add('understand', 0.4, ['satisfaction', 'curiosity'], 'general');
  add('breakthrough', 0.8, ['excitement', 'pride'], 'general');
  add('progress', 0.4, ['satisfaction', 'determination'], 'general');
  add('improved', 0.5, ['satisfaction'], 'general');
  add('milestone', 0.5, ['pride', 'satisfaction'], 'work');
  add('accomplished', 0.6, ['pride', 'satisfaction'], 'general');
  add('proud', 0.7, ['pride'], 'general');
  add('confident', 0.5, ['determination', 'pride'], 'general');
  add('motivated', 0.5, ['determination', 'excitement'], 'general');
  add('inspired', 0.6, ['excitement', 'curiosity'], 'general');
  add('excited', 0.7, ['excitement'], 'general');
  add('happy', 0.6, ['satisfaction'], 'general');
  add('enjoy', 0.5, ['satisfaction'], 'general');
  add('fun', 0.5, ['excitement', 'satisfaction'], 'general');
  add('beautiful', 0.6, ['satisfaction', 'pride'], 'general');
  add('robust', 0.4, ['satisfaction'], 'code');
  add('scalable', 0.4, ['satisfaction', 'pride'], 'code');

  // ── Neutral / context-dependent ──
  add('help', -0.1, ['confusion'], 'general');
  add('try', 0.1, ['determination'], 'general');
  add('debug', -0.1, ['determination', 'frustration'], 'code');
  add('test', 0.1, ['determination'], 'code');
  add('testing', 0.1, ['determination'], 'code');
  add('review', 0.0, ['curiosity'], 'code');
  add('think', 0.1, ['curiosity'], 'general');
  add('maybe', -0.1, ['confusion'], 'general');
  add('wonder', 0.2, ['curiosity'], 'general');

  return entries;
}

// ── Empathy templates ────────────────────────────────────────────────────────

interface EmpathyTemplate {
  emotion: EmotionCategory;
  acknowledgments: string[];
  suggestions: string[];
  reframes: string[];
  encouragements: string[];
  actionItems: string[];
  tone: EmpathyResponse['tone'];
}

function buildEmpathyTemplates(): EmpathyTemplate[] {
  return [
    {
      emotion: 'frustration',
      acknowledgments: [
        'I can see this is really frustrating.',
        'That sounds like a tough situation.',
        'Debugging can be incredibly challenging.',
      ],
      suggestions: [
        'Try stepping away for a few minutes — fresh eyes often spot the issue.',
        'Consider adding logging at key points to narrow down the problem.',
        'Breaking the problem into smaller pieces might help isolate the cause.',
      ],
      reframes: [
        'Every bug you fix makes you a stronger developer.',
        'This is an opportunity to deepen your understanding of the system.',
        'The hardest bugs often teach the most valuable lessons.',
      ],
      encouragements: [
        'You\'ve solved tough problems before — you can do this.',
        'Keep going, the solution is closer than you think.',
        'Persistence is the key to great debugging.',
      ],
      actionItems: [
        'Reproduce the issue with a minimal test case',
        'Check recent changes that might have introduced the problem',
        'Review error logs for additional context',
      ],
      tone: 'supportive',
    },
    {
      emotion: 'confusion',
      acknowledgments: [
        'It\'s natural to feel confused when learning something new.',
        'This topic can be tricky to wrap your head around.',
        'Many developers find this concept challenging at first.',
      ],
      suggestions: [
        'Try reading the official documentation or a tutorial.',
        'Sometimes working through a simple example helps clarify things.',
        'Consider drawing a diagram to visualize the flow.',
      ],
      reframes: [
        'Confusion is the first step toward understanding.',
        'Asking questions shows you\'re engaged and thinking critically.',
        'Every expert was once a beginner with the same questions.',
      ],
      encouragements: [
        'Take it one step at a time — you\'ll get there.',
        'Understanding will click soon, keep exploring.',
        'Don\'t be afraid to ask for help — that\'s how we all learn.',
      ],
      actionItems: [
        'Break the concept into smaller, manageable parts',
        'Find a simple working example to study',
        'Write down what you do understand and identify specific gaps',
      ],
      tone: 'supportive',
    },
    {
      emotion: 'excitement',
      acknowledgments: [
        'That\'s fantastic! Your enthusiasm is great.',
        'How exciting! That sounds like a great achievement.',
        'Wonderful — it\'s great to see that energy.',
      ],
      suggestions: [
        'Channel that energy into documenting what you learned.',
        'Consider sharing your discovery with the team.',
        'This might be a good time to tackle the next challenge.',
      ],
      reframes: [
        'This momentum can carry you through the next challenge too.',
        'Your excitement shows real passion for the craft.',
        'Celebrate the win — you earned it!',
      ],
      encouragements: [
        'Keep riding that wave of inspiration!',
        'Your passion for coding really shows.',
        'Great developers are driven by this kind of excitement.',
      ],
      actionItems: [
        'Document your approach for future reference',
        'Share your solution with teammates',
        'Consider what else you can apply this technique to',
      ],
      tone: 'celebratory',
    },
    {
      emotion: 'satisfaction',
      acknowledgments: [
        'Well done — you should be pleased with that result.',
        'That\'s a solid accomplishment.',
        'Great job getting that working.',
      ],
      suggestions: [
        'Consider writing a brief retrospective on what worked well.',
        'This is a good time to add tests to lock in the behavior.',
        'Take a moment to appreciate the progress before moving on.',
      ],
      reframes: [
        'Each success builds your skills and confidence.',
        'This shows your growing expertise.',
        'You\'re making real, tangible progress.',
      ],
      encouragements: [
        'Excellent work — keep up the great quality.',
        'Your dedication is paying off.',
        'You\'re building something to be proud of.',
      ],
      actionItems: [
        'Add tests to protect this functionality',
        'Update documentation to reflect the changes',
        'Consider if this approach can be reused elsewhere',
      ],
      tone: 'celebratory',
    },
    {
      emotion: 'curiosity',
      acknowledgments: [
        'Great question — curiosity drives the best engineers.',
        'That\'s an interesting thing to explore.',
        'Your desire to understand deeper is admirable.',
      ],
      suggestions: [
        'Try experimenting with a small prototype to test your hypothesis.',
        'Reading the source code can reveal how things work under the hood.',
        'Consider setting up a sandbox environment to explore safely.',
      ],
      reframes: [
        'This curiosity will lead to deeper expertise.',
        'The best innovations come from asking "why" and "what if".',
        'Exploring is how great solutions are discovered.',
      ],
      encouragements: [
        'Follow that curiosity — it\'s leading you somewhere great.',
        'Keep asking questions — that\'s how experts are made.',
        'Your inquisitive nature is a real asset.',
      ],
      actionItems: [
        'Create a small experiment to test the idea',
        'Research how others have approached similar questions',
        'Document your findings as you explore',
      ],
      tone: 'motivating',
    },
    {
      emotion: 'anxiety',
      acknowledgments: [
        'It\'s understandable to feel anxious about this.',
        'That kind of pressure can be stressful.',
        'Your concern shows you care about quality.',
      ],
      suggestions: [
        'Break the task into smaller, manageable steps.',
        'Focus on one thing at a time rather than the whole picture.',
        'Consider what the worst case scenario actually looks like — it\'s often less scary.',
      ],
      reframes: [
        'Some nervousness can actually sharpen your focus.',
        'You have more experience to draw on than you think.',
        'Many successful deployments started with pre-launch jitters.',
      ],
      encouragements: [
        'You\'ve handled challenges like this before.',
        'Take a deep breath — you\'ve got this.',
        'Trust your preparation and your skills.',
      ],
      actionItems: [
        'Create a checklist of what needs to be done',
        'Identify the highest-risk areas and address them first',
        'Set up a rollback plan for peace of mind',
      ],
      tone: 'calming',
    },
    {
      emotion: 'boredom',
      acknowledgments: [
        'Repetitive work can feel draining.',
        'It\'s natural to want more engaging challenges.',
        'Routine tasks are part of the job, but they don\'t have to be dull.',
      ],
      suggestions: [
        'Consider automating the repetitive parts.',
        'Try turning it into a coding challenge or kata.',
        'Listen to music or a podcast while working on routine tasks.',
      ],
      reframes: [
        'Even routine work maintains the foundation of your project.',
        'This could be an opportunity to practice writing more elegant code.',
        'Mastery comes from doing the basics well, even when they\'re boring.',
      ],
      encouragements: [
        'The sooner you finish, the sooner you can move to something exciting.',
        'You\'re building discipline, which is a superpower.',
        'Every task done well is a building block for bigger things.',
      ],
      actionItems: [
        'Look for automation opportunities',
        'Set a timer and challenge yourself to finish faster',
        'Identify ways to make the task more interesting',
      ],
      tone: 'motivating',
    },
    {
      emotion: 'determination',
      acknowledgments: [
        'Your determination is impressive.',
        'That\'s the kind of persistence that leads to breakthroughs.',
        'Pushing through challenges shows real character.',
      ],
      suggestions: [
        'Make sure you\'re taking breaks to stay sharp.',
        'Consider pair programming for a fresh perspective.',
        'Document your progress so you can see how far you\'ve come.',
      ],
      reframes: [
        'This persistence is what separates good from great.',
        'Each attempt brings you closer to the solution.',
        'Your tenacity will pay off.',
      ],
      encouragements: [
        'Keep going — that determination will get you there.',
        'You\'re showing exactly the mindset of a great developer.',
        'Stay focused — the breakthrough is coming.',
      ],
      actionItems: [
        'Set small milestones to track progress',
        'Take a short break every 25 minutes (Pomodoro technique)',
        'Celebrate small wins along the way',
      ],
      tone: 'motivating',
    },
    {
      emotion: 'pride',
      acknowledgments: [
        'You should be proud of that achievement!',
        'That\'s something to celebrate.',
        'Outstanding work — you earned that feeling.',
      ],
      suggestions: [
        'Share your accomplishment with the team.',
        'Write a blog post or document about what you built.',
        'Use this momentum for the next challenge.',
      ],
      reframes: [
        'This success is proof of your growing expertise.',
        'You\'re raising the bar for quality.',
        'This achievement will inspire others too.',
      ],
      encouragements: [
        'Enjoy this moment — you worked hard for it!',
        'Your skills are clearly advancing.',
        'Keep setting high standards — it\'s what makes you stand out.',
      ],
      actionItems: [
        'Document the approach for team knowledge sharing',
        'Identify what made this successful and repeat it',
        'Set an even more ambitious next goal',
      ],
      tone: 'celebratory',
    },
    {
      emotion: 'overwhelmed',
      acknowledgments: [
        'It\'s okay to feel overwhelmed — this is a lot to handle.',
        'Anyone would feel the pressure in your situation.',
        'Take a breath — you don\'t have to solve everything at once.',
      ],
      suggestions: [
        'Prioritize: what\'s the one most important thing right now?',
        'Delegate or ask for help where possible.',
        'Write down everything on your plate to get it out of your head.',
      ],
      reframes: [
        'Being overwhelmed often means you\'re growing beyond your comfort zone.',
        'You\'ve handled big challenges before and you will again.',
        'Breaking it down makes it manageable.',
      ],
      encouragements: [
        'One step at a time — you\'ll get through this.',
        'It\'s okay to ask for help or push back on scope.',
        'You\'re stronger than you think.',
      ],
      actionItems: [
        'List all tasks and ruthlessly prioritize',
        'Identify tasks that can be delegated or deferred',
        'Communicate with stakeholders about realistic timelines',
      ],
      tone: 'calming',
    },
    {
      emotion: 'neutral',
      acknowledgments: [
        'Thanks for sharing.',
        'Understood.',
        'Got it.',
      ],
      suggestions: [
        'Is there anything specific you\'d like to focus on?',
        'Let me know if you need help with anything.',
        'Feel free to ask if questions come up.',
      ],
      reframes: [
        'A calm, steady approach is often the most productive.',
        'Consistency is underrated — keep going.',
        'You\'re in a good headspace for focused work.',
      ],
      encouragements: [
        'Keep up the steady progress.',
        'You\'re doing well.',
        'Onward!',
      ],
      actionItems: [
        'Review your current priorities',
        'Consider what to tackle next',
        'Take stock of recent progress',
      ],
      tone: 'neutral',
    },
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Default config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: EmotionEngineConfig = {
  sensitivityLevel: 0.5,
  maxEmotionHistory: 200,
  enableEmpathy: true,
  neutralThreshold: 0.15,
  decayRate: 0.05,
  contextWindowSize: 10,
};

// ══════════════════════════════════════════════════════════════════════════════
// CLASS
// ══════════════════════════════════════════════════════════════════════════════

export class EmotionEngine {
  private config: EmotionEngineConfig;
  private lexicon: LexiconEntry[];
  private empathyTemplates: EmpathyTemplate[];
  private emotionHistory: Array<{
    id: string;
    timestamp: number;
    emotion: EmotionCategory;
    intensity: number;
    trigger: string;
    correct: boolean | null;
  }> = [];
  private sentimentSum: number = 0;
  private totalAnalyses: number = 0;
  private totalEmotionsDetected: number = 0;
  private totalEmpathyGenerated: number = 0;
  private totalFeedbackReceived: number = 0;
  private emotionCounts: Record<string, number> = {};

  constructor(config?: Partial<EmotionEngineConfig>) {
    this.config = {
      sensitivityLevel: config?.sensitivityLevel ?? DEFAULT_CONFIG.sensitivityLevel,
      maxEmotionHistory: config?.maxEmotionHistory ?? DEFAULT_CONFIG.maxEmotionHistory,
      enableEmpathy: config?.enableEmpathy ?? DEFAULT_CONFIG.enableEmpathy,
      neutralThreshold: config?.neutralThreshold ?? DEFAULT_CONFIG.neutralThreshold,
      decayRate: config?.decayRate ?? DEFAULT_CONFIG.decayRate,
      contextWindowSize: config?.contextWindowSize ?? DEFAULT_CONFIG.contextWindowSize,
    };
    this.lexicon = buildSentimentLexicon();
    this.empathyTemplates = buildEmpathyTemplates();
  }

  // ── Sentiment Analysis ─────────────────────────────────────────────────────

  analyzeSentiment(text: string): SentimentResult {
    this.totalAnalyses++;
    const tokens = tokenize(text);
    if (tokens.length === 0) {
      return { score: 0, magnitude: 0, label: 'neutral', confidence: 0.3, keywords: [] };
    }

    let totalScore = 0;
    let totalMagnitude = 0;
    const matchedKeywords: string[] = [];
    let matchCount = 0;

    // Check for negation words
    const negationWords = new Set(['not', "don't", "doesn't", "didn't", "can't", "won't", 'never', 'no', 'without', "isn't", "aren't"]);
    const negationPositions = new Set<number>();
    const lowerText = text.toLowerCase();
    const allWords = lowerText.split(/\s+/);
    for (let i = 0; i < allWords.length; i++) {
      if (negationWords.has(allWords[i])) {
        // Mark next 2 words as negated
        negationPositions.add(i + 1);
        negationPositions.add(i + 2);
      }
    }

    for (const entry of this.lexicon) {
      const entryTokens = entry.word.split(/\s+/);
      if (entryTokens.length > 1) {
        // Multi-word matching
        if (lowerText.includes(entry.word)) {
          totalScore += entry.score * this.config.sensitivityLevel * 2;
          totalMagnitude += Math.abs(entry.score);
          matchedKeywords.push(entry.word);
          matchCount++;
        }
      } else {
        const idx = tokens.indexOf(entry.word);
        if (idx >= 0) {
          // Check if the word position is negated in the original text
          const wordIdx = allWords.indexOf(entry.word);
          const isNegated = negationPositions.has(wordIdx);
          const modifier = isNegated ? -0.7 : 1;

          totalScore += entry.score * modifier * this.config.sensitivityLevel * 2;
          totalMagnitude += Math.abs(entry.score);
          matchedKeywords.push(isNegated ? `NOT ${entry.word}` : entry.word);
          matchCount++;
        }
      }
    }

    // Intensifiers
    const intensifiers = ['very', 'really', 'extremely', 'so', 'incredibly', 'absolutely', 'totally'];
    for (const word of intensifiers) {
      if (tokens.includes(word)) {
        totalScore *= 1.3;
        totalMagnitude *= 1.2;
      }
    }

    // Exclamation marks boost magnitude
    const exclamationCount = (text.match(/!/g) ?? []).length;
    if (exclamationCount > 0) {
      totalMagnitude *= 1 + exclamationCount * 0.1;
    }

    // All caps words boost magnitude
    const capsWords = text.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
    if (capsWords.length > 0) {
      totalMagnitude *= 1.2;
    }

    const normalizedScore = matchCount > 0 ? clamp(totalScore / matchCount, -1, 1) : 0;
    const normalizedMagnitude = clamp(totalMagnitude / Math.max(tokens.length, 1), 0, 1);
    const confidence = clamp(0.3 + matchCount * 0.1, 0.3, 0.95);

    let label: SentimentResult['label'];
    if (Math.abs(normalizedScore) < this.config.neutralThreshold) {
      label = 'neutral';
    } else if (normalizedScore > 0 && normalizedMagnitude > 0.3 && matchedKeywords.some(k => k.startsWith('NOT'))) {
      label = 'mixed';
    } else {
      label = normalizedScore > 0 ? 'positive' : 'negative';
    }

    this.sentimentSum += normalizedScore;

    return {
      score: round2(normalizedScore),
      magnitude: round2(normalizedMagnitude),
      label,
      confidence: round2(confidence),
      keywords: matchedKeywords.slice(0, 10),
    };
  }

  // ── Emotion Detection ──────────────────────────────────────────────────────

  detectEmotion(text: string, context?: string[]): EmotionDetection {
    this.totalEmotionsDetected++;
    const tokens = tokenize(text);
    const sentiment = this.analyzeSentiment(text);
    // Don't double-count the analysis
    this.totalAnalyses--;

    // Score each emotion category
    const emotionScores = new Map<EmotionCategory, { score: number; triggers: string[] }>();
    const categories: EmotionCategory[] = [
      'frustration', 'confusion', 'excitement', 'satisfaction',
      'curiosity', 'anxiety', 'boredom', 'determination',
      'pride', 'overwhelmed', 'neutral',
    ];

    for (const cat of categories) {
      emotionScores.set(cat, { score: 0, triggers: [] });
    }

    // Score from lexicon matches
    for (const entry of this.lexicon) {
      const entryTokens = entry.word.split(/\s+/);
      let matched = false;
      if (entryTokens.length > 1) {
        matched = text.toLowerCase().includes(entry.word);
      } else {
        matched = tokens.includes(entry.word);
      }
      if (matched) {
        for (const emotion of entry.emotions) {
          const e = emotionScores.get(emotion);
          if (e) {
            e.score += Math.abs(entry.score) * this.config.sensitivityLevel * 2;
            e.triggers.push(entry.word);
          }
        }
      }
    }

    // Question marks suggest confusion or curiosity
    const questionCount = (text.match(/\?/g) ?? []).length;
    if (questionCount > 0) {
      const confusion = emotionScores.get('confusion')!;
      confusion.score += questionCount * 0.2;
      confusion.triggers.push('?');
      const curiosity = emotionScores.get('curiosity')!;
      curiosity.score += questionCount * 0.15;
      curiosity.triggers.push('?');
    }

    // Exclamation marks suggest excitement or frustration
    const exclamationCount = (text.match(/!/g) ?? []).length;
    if (exclamationCount > 0) {
      if (sentiment.score > 0) {
        const excitement = emotionScores.get('excitement')!;
        excitement.score += exclamationCount * 0.2;
        excitement.triggers.push('!');
      } else {
        const frustration = emotionScores.get('frustration')!;
        frustration.score += exclamationCount * 0.15;
        frustration.triggers.push('!');
      }
    }

    // Context influence (recent emotions carry forward)
    if (context && context.length > 0) {
      const contextWindow = context.slice(-this.config.contextWindowSize);
      for (const msg of contextWindow) {
        const ctxTokens = tokenize(msg);
        for (const entry of this.lexicon) {
          if (ctxTokens.includes(entry.word)) {
            for (const emotion of entry.emotions) {
              const e = emotionScores.get(emotion);
              if (e) {
                e.score += Math.abs(entry.score) * 0.1; // reduced weight for context
              }
            }
          }
        }
      }
    }

    // Sort by score
    const sorted = [...emotionScores.entries()]
      .sort((a, b) => b[1].score - a[1].score);

    const primary = sorted[0];
    const secondary = sorted[1];

    let primaryEmotion: EmotionCategory = primary[0];
    let secondaryEmotion: EmotionCategory | null = null;
    let intensity = clamp(primary[1].score, 0, 1);

    // If no strong signal, default to neutral
    if (intensity < this.config.neutralThreshold) {
      primaryEmotion = 'neutral';
      intensity = 0.1;
    }

    if (secondary[1].score > this.config.neutralThreshold && secondary[0] !== primaryEmotion) {
      secondaryEmotion = secondary[0];
    }

    const confidence = clamp(0.3 + intensity * 0.6, 0.3, 0.95);
    const id = generateId('emo');

    const contextDesc = primaryEmotion === 'neutral'
      ? 'No strong emotional signal detected'
      : `Detected ${primaryEmotion}${secondaryEmotion ? ` with undertones of ${secondaryEmotion}` : ''}`;

    // Track in history
    this.emotionHistory.push({
      id,
      timestamp: Date.now(),
      emotion: primaryEmotion,
      intensity: round2(intensity),
      trigger: primary[1].triggers[0] ?? text.slice(0, 50),
      correct: null,
    });

    // Trim history
    while (this.emotionHistory.length > this.config.maxEmotionHistory) {
      this.emotionHistory.shift();
    }

    // Update distribution
    this.emotionCounts[primaryEmotion] = (this.emotionCounts[primaryEmotion] ?? 0) + 1;

    return {
      id,
      primary: primaryEmotion,
      secondary: secondaryEmotion,
      intensity: round2(intensity),
      confidence: round2(confidence),
      triggers: primary[1].triggers.slice(0, 5),
      context: contextDesc,
    };
  }

  // ── Empathy Generation ─────────────────────────────────────────────────────

  generateEmpathy(emotion: EmotionDetection): EmpathyResponse {
    this.totalEmpathyGenerated++;

    if (!this.config.enableEmpathy) {
      return {
        acknowledgment: '',
        suggestion: '',
        reframe: '',
        encouragement: '',
        actionItems: [],
        tone: 'neutral',
      };
    }

    const template = this.empathyTemplates.find(t => t.emotion === emotion.primary)
      ?? this.empathyTemplates.find(t => t.emotion === 'neutral')!;

    // Pick from templates based on intensity
    const pick = (arr: string[]): string => {
      const idx = Math.min(Math.floor(emotion.intensity * arr.length), arr.length - 1);
      return arr[idx];
    };

    return {
      acknowledgment: pick(template.acknowledgments),
      suggestion: pick(template.suggestions),
      reframe: pick(template.reframes),
      encouragement: pick(template.encouragements),
      actionItems: template.actionItems.slice(0, Math.max(1, Math.ceil(emotion.intensity * 3))),
      tone: template.tone,
    };
  }

  // ── Timeline ───────────────────────────────────────────────────────────────

  getEmotionTimeline(): EmotionTimeline {
    const entries = this.emotionHistory.map(h => ({
      timestamp: h.timestamp,
      emotion: h.emotion,
      intensity: h.intensity,
      trigger: h.trigger,
    }));

    if (entries.length === 0) {
      return {
        entries: [],
        trend: 'stable',
        dominantEmotion: 'neutral',
        averageIntensity: 0,
      };
    }

    // Compute dominant emotion
    const counts = new Map<EmotionCategory, number>();
    let totalIntensity = 0;
    for (const e of entries) {
      counts.set(e.emotion, (counts.get(e.emotion) ?? 0) + 1);
      totalIntensity += e.intensity;
    }
    const dominantEmotion = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const averageIntensity = round2(totalIntensity / entries.length);

    // Compute trend
    const trend = this.computeTrend(entries);

    return { entries, trend, dominantEmotion, averageIntensity };
  }

  // ── Emotional Context ──────────────────────────────────────────────────────

  getEmotionalContext(): EmotionalContext {
    const recent = this.emotionHistory.slice(-this.config.contextWindowSize);

    if (recent.length === 0) {
      const defaultDetection: EmotionDetection = {
        id: 'none',
        primary: 'neutral',
        secondary: null,
        intensity: 0,
        confidence: 0.3,
        triggers: [],
        context: 'No emotional data available',
      };
      return {
        currentEmotion: defaultDetection,
        recentEmotions: [],
        emotionalTrend: 'stable',
        stressLevel: 0,
        engagementLevel: 0.5,
        needsSupport: false,
      };
    }

    const current = recent[recent.length - 1];
    const currentDetection: EmotionDetection = {
      id: current.id,
      primary: current.emotion,
      secondary: null,
      intensity: current.intensity,
      confidence: 0.7,
      triggers: [current.trigger],
      context: `Current emotion: ${current.emotion}`,
    };

    const recentDetections: EmotionDetection[] = recent.map(r => ({
      id: r.id,
      primary: r.emotion,
      secondary: null,
      intensity: r.intensity,
      confidence: 0.7,
      triggers: [r.trigger],
      context: `Emotion: ${r.emotion}`,
    }));

    // Stress level based on negative emotion frequency and intensity
    const negativeEmotions: EmotionCategory[] = ['frustration', 'anxiety', 'overwhelmed', 'confusion'];
    const negativeEntries = recent.filter(r => negativeEmotions.includes(r.emotion));
    const stressLevel = clamp(negativeEntries.length / recent.length + negativeEntries.reduce((s, e) => s + e.intensity, 0) / Math.max(recent.length, 1) * 0.5, 0, 1);

    // Engagement level based on emotion intensity and variety
    const uniqueEmotions = new Set(recent.map(r => r.emotion)).size;
    const avgIntensity = recent.reduce((s, r) => s + r.intensity, 0) / recent.length;
    const engagementLevel = clamp(avgIntensity * 0.6 + (uniqueEmotions / 5) * 0.4, 0, 1);

    // Needs support if stress is high or overwhelmed/frustrated recently
    const needsSupport = stressLevel > 0.5 || negativeEntries.some(e => e.intensity > 0.7);

    const entries = recent.map(h => ({
      timestamp: h.timestamp,
      emotion: h.emotion,
      intensity: h.intensity,
      trigger: h.trigger,
    }));
    const trend = this.computeTrend(entries);

    return {
      currentEmotion: currentDetection,
      recentEmotions: recentDetections,
      emotionalTrend: trend,
      stressLevel: round2(stressLevel),
      engagementLevel: round2(engagementLevel),
      needsSupport,
    };
  }

  // ── Pattern Detection ──────────────────────────────────────────────────────

  detectEmotionPatterns(): EmotionPattern[] {
    const patterns = new Map<string, { emotion: EmotionCategory; count: number; totalIntensity: number }>();

    for (const entry of this.emotionHistory) {
      const key = `${entry.trigger}:${entry.emotion}`;
      const existing = patterns.get(key);
      if (existing) {
        existing.count++;
        existing.totalIntensity += entry.intensity;
      } else {
        patterns.set(key, { emotion: entry.emotion, count: 1, totalIntensity: entry.intensity });
      }
    }

    return [...patterns.entries()]
      .filter(([, v]) => v.count >= 2)
      .map(([key, v]) => ({
        trigger: key.split(':')[0],
        emotion: v.emotion,
        frequency: v.count,
        avgIntensity: round2(v.totalIntensity / v.count),
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  // ── Tone Adjustment ────────────────────────────────────────────────────────

  adjustTone(text: string, targetTone: EmpathyResponse['tone']): string {
    const tokens = text.split(/\s+/);
    let adjusted = text;

    switch (targetTone) {
      case 'supportive':
        if (!adjusted.startsWith('I understand') && !adjusted.startsWith('I see')) {
          adjusted = `I understand. ${adjusted}`;
        }
        adjusted = adjusted.replace(/you must/gi, 'you might consider');
        adjusted = adjusted.replace(/you should/gi, 'you could');
        break;
      case 'celebratory':
        if (!adjusted.includes('!') && tokens.length < 50) {
          adjusted = adjusted.replace(/\.\s*$/, '!');
        }
        if (!adjusted.toLowerCase().includes('great') && !adjusted.toLowerCase().includes('excellent')) {
          adjusted = `Great work! ${adjusted}`;
        }
        break;
      case 'calming':
        adjusted = adjusted.replace(/!/g, '.');
        adjusted = adjusted.replace(/URGENT|IMMEDIATELY|NOW/gi, 'when you\'re ready');
        if (!adjusted.toLowerCase().includes('no rush') && !adjusted.toLowerCase().includes('take your time')) {
          adjusted = `${adjusted} Take your time with this.`;
        }
        break;
      case 'motivating':
        if (!adjusted.toLowerCase().includes('you can') && !adjusted.toLowerCase().includes('you\'ve got')) {
          adjusted = `You can do this! ${adjusted}`;
        }
        break;
      case 'neutral':
      default:
        break;
    }

    return adjusted;
  }

  // ── Feedback ───────────────────────────────────────────────────────────────

  provideFeedback(emotionId: string, correct: boolean): void {
    this.totalFeedbackReceived++;
    const entry = this.emotionHistory.find(e => e.id === emotionId);
    if (entry) {
      entry.correct = correct;
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): EmotionEngineStats {
    return {
      totalAnalyses: this.totalAnalyses,
      totalEmotionsDetected: this.totalEmotionsDetected,
      totalEmpathyGenerated: this.totalEmpathyGenerated,
      totalFeedbackReceived: this.totalFeedbackReceived,
      avgSentimentScore: this.totalAnalyses > 0 ? round2(this.sentimentSum / this.totalAnalyses) : 0,
      emotionDistribution: { ...this.emotionCounts },
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private computeTrend(
    entries: Array<{ intensity: number; emotion: EmotionCategory }>,
  ): 'improving' | 'declining' | 'stable' | 'volatile' {
    if (entries.length < 3) return 'stable';

    const negativeEmotions: EmotionCategory[] = ['frustration', 'anxiety', 'overwhelmed', 'confusion', 'boredom'];
    const half = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, half);
    const secondHalf = entries.slice(half);

    const negScore = (arr: typeof entries) => {
      let s = 0;
      for (const e of arr) {
        if (negativeEmotions.includes(e.emotion)) s += e.intensity;
        else s -= e.intensity * 0.5;
      }
      return s / arr.length;
    };

    const firstNeg = negScore(firstHalf);
    const secondNeg = negScore(secondHalf);
    const diff = secondNeg - firstNeg;

    // Check volatility
    const emotions = entries.map(e => e.emotion);
    let switches = 0;
    for (let i = 1; i < emotions.length; i++) {
      if (emotions[i] !== emotions[i - 1]) switches++;
    }
    const volatility = switches / (emotions.length - 1);
    if (volatility > 0.7) return 'volatile';

    if (diff < -0.15) return 'improving';
    if (diff > 0.15) return 'declining';
    return 'stable';
  }
}
