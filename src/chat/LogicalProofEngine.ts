/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LogicalProofEngine — Formal logic, proofs & argument construction          ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Propositional Logic — Evaluate logical expressions                     ║
 * ║    ✦ Syllogism Validation — Check validity of syllogistic arguments         ║
 * ║    ✦ Logical Fallacy Detection — Identify common logical fallacies          ║
 * ║    ✦ Argument Construction — Build valid logical arguments                  ║
 * ║    ✦ Truth Table Generation — Generate truth tables for expressions         ║
 * ║    ✦ Contradiction Detection — Find contradictions in premise sets          ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface LogicalProposition {
  id: string
  statement: string
  truthValue?: boolean
  negation: boolean
}

export interface Syllogism {
  majorPremise: string
  minorPremise: string
  conclusion: string
}

export interface SyllogismResult {
  isValid: boolean
  form: string
  explanation: string
  confidence: number
}

export interface FallacyResult {
  hasFallacy: boolean
  fallacies: DetectedFallacy[]
  confidence: number
}

export interface DetectedFallacy {
  type: string
  name: string
  description: string
  evidence: string
  severity: number // 0-1
}

export interface TruthTableRow {
  variables: Record<string, boolean>
  result: boolean
}

export interface ArgumentStructure {
  premises: string[]
  intermediateSteps: string[]
  conclusion: string
  isValid: boolean
  logicalForm: string
}

// ── Fallacy Definitions ──────────────────────────────────────────────────────

const FALLACY_PATTERNS: Array<{
  name: string
  type: string
  patterns: RegExp[]
  description: string
  severity: number
}> = [
  {
    name: 'Ad Hominem',
    type: 'informal',
    patterns: [
      /\b(you|they|he|she)\s+(are|is)\s+(stupid|idiot|dumb|ignorant|fool)/i,
      /\b(only\s+(?:an?\s+)?(?:fool|idiot|moron))\s+would\b/i,
      /\bdon'?t\s+listen\s+to\s+(?:him|her|them)\b/i,
    ],
    description: 'Attacking the person rather than their argument',
    severity: 0.7,
  },
  {
    name: 'Straw Man',
    type: 'informal',
    patterns: [
      /\bso\s+you('re|\s+are)\s+saying\s+that\b/i,
      /\bwhat\s+you('re|\s+are)\s+really\s+saying\b/i,
      /\bin\s+other\s+words,?\s+you\s+think\b/i,
    ],
    description: "Misrepresenting someone's argument to make it easier to attack",
    severity: 0.6,
  },
  {
    name: 'Appeal to Authority',
    type: 'informal',
    patterns: [
      /\b(?:experts?|scientists?|doctors?)\s+(?:say|agree|believe|think)\b/i,
      /\baccording\s+to\s+(?:experts?|authority|studies)\b/i,
      /\beveryone\s+knows\b/i,
    ],
    description: 'Using authority as evidence without proper justification',
    severity: 0.4,
  },
  {
    name: 'False Dilemma',
    type: 'informal',
    patterns: [
      /\b(?:either|you\s+(?:must|have\s+to))\s+.+\s+or\s+/i,
      /\bthere\s+(?:are|is)\s+only\s+two\s+(?:options?|choices?|ways?)\b/i,
      /\bif\s+(?:you'?re?\s+)?not\s+.+\s+(?:then|you(?:'re|\s+are))\s+/i,
    ],
    description: 'Presenting only two options when more exist',
    severity: 0.5,
  },
  {
    name: 'Slippery Slope',
    type: 'informal',
    patterns: [
      /\bif\s+we\s+(?:allow|let|start)\s+.+\s+(?:then|next|soon|eventually)\b/i,
      /\bwhere\s+does\s+it\s+end\b/i,
      /\bthis\s+will\s+(?:lead|result)\s+in\b/i,
    ],
    description: 'Assuming one event will inevitably lead to extreme consequences',
    severity: 0.5,
  },
  {
    name: 'Circular Reasoning',
    type: 'formal',
    patterns: [
      /\bbecause\s+it\s+(?:is|just\s+is)\b/i,
      /\b(?:it'?s?\s+)?true\s+because\s+(?:it'?s?\s+)?true\b/i,
    ],
    description: 'Using the conclusion as a premise in the argument',
    severity: 0.8,
  },
  {
    name: 'Hasty Generalization',
    type: 'informal',
    patterns: [
      /\ball\s+(?:\w+\s+)?(?:are|is|do|always)\b/i,
      /\beveryone\s+(?:knows?|thinks?|agrees?)\b/i,
      /\bnobody\s+(?:ever|likes?|wants?)\b/i,
      /\bnever\s+(?:works?|happens?)\b/i,
    ],
    description: 'Drawing broad conclusions from limited evidence',
    severity: 0.4,
  },
  {
    name: 'Appeal to Emotion',
    type: 'informal',
    patterns: [
      /\bthink\s+of\s+the\s+(?:children|poor|victims)\b/i,
      /\bhow\s+would\s+you\s+feel\b/i,
      /\bimagine\s+if\s+(?:it\s+were|that\s+happened\s+to)\s+you\b/i,
    ],
    description: 'Using emotional appeals instead of logical arguments',
    severity: 0.4,
  },
  {
    name: 'Red Herring',
    type: 'informal',
    patterns: [
      /\bbut\s+what\s+about\b/i,
      /\bthe\s+real\s+(?:issue|problem|question)\s+is\b/i,
      /\blet'?s?\s+(?:not\s+)?(?:talk|focus)\s+(?:about|on)\s+(?:something\s+else|the\s+real)\b/i,
    ],
    description: 'Introducing an irrelevant topic to divert attention',
    severity: 0.5,
  },
]

// ── Main Class ───────────────────────────────────────────────────────────────

export class LogicalProofEngine {
  constructor() {}

  // ── Propositional Logic ──────────────────────────────────────────────────

  /**
   * Evaluate a simple propositional logic expression
   * Supports: AND (∧), OR (∨), NOT (¬), IMPLIES (→), variables (true/false)
   */
  evaluate(expression: string, variables: Record<string, boolean> = {}): boolean {
    let expr = expression.trim()

    // Replace variables
    for (const [name, value] of Object.entries(variables)) {
      expr = expr.replace(new RegExp(`\\b${name}\\b`, 'g'), value ? 'true' : 'false')
    }

    // Normalize operators
    expr = expr
      .replace(/∧|&&|AND/gi, '&&')
      .replace(/∨|\|\||OR/gi, '||')
      .replace(/¬|NOT/gi, '!')
      .replace(/→|=>|IMPLIES/gi, '=>')

    // Handle implication: A => B is equivalent to !A || B
    while (expr.includes('=>')) {
      expr = expr.replace(/(.+?)\s*=>\s*(.+)/, '(!($1) || ($2))')
    }

    // Safe evaluation
    try {
      return this.safeEval(expr)
    } catch {
      return false
    }
  }

  /**
   * Generate truth table for an expression
   */
  generateTruthTable(expression: string, variableNames: string[]): TruthTableRow[] {
    const rows: TruthTableRow[] = []
    const combinations = 2 ** variableNames.length

    for (let i = 0; i < combinations; i++) {
      const variables: Record<string, boolean> = {}
      for (let j = 0; j < variableNames.length; j++) {
        variables[variableNames[j]!] = Boolean((i >> (variableNames.length - 1 - j)) & 1)
      }
      const result = this.evaluate(expression, variables)
      rows.push({ variables, result })
    }

    return rows
  }

  // ── Syllogism Validation ─────────────────────────────────────────────────

  /**
   * Validate a syllogism
   */
  validateSyllogism(syllogism: Syllogism): SyllogismResult {
    const { majorPremise, minorPremise, conclusion } = syllogism

    // Extract terms
    const majorTerms = this.extractSyllogismTerms(majorPremise)
    const minorTerms = this.extractSyllogismTerms(minorPremise)
    const concTerms = this.extractSyllogismTerms(conclusion)

    // Check for valid form: middle term appears in both premises but not conclusion
    const allPremiseTerms = [...majorTerms, ...minorTerms]
    const middleTerm = allPremiseTerms.find(
      t => majorTerms.includes(t) && minorTerms.includes(t) && !concTerms.includes(t),
    )

    if (!middleTerm) {
      return {
        isValid: false,
        form: 'undetermined',
        explanation:
          'No valid middle term found — the middle term must appear in both premises but not the conclusion.',
        confidence: 0.7,
      }
    }

    // Check if conclusion terms appear in premises
    const conclusionInPremises = concTerms.every(
      t => majorTerms.includes(t) || minorTerms.includes(t),
    )

    if (!conclusionInPremises) {
      return {
        isValid: false,
        form: 'invalid',
        explanation: 'Conclusion introduces terms not present in premises.',
        confidence: 0.8,
      }
    }

    // Check quantifier consistency
    const isUniversal =
      /\b(all|every|each|no|none)\b/i.test(majorPremise) ||
      /\b(all|every|each|no|none)\b/i.test(minorPremise)
    const conclusionUniversal = /\b(all|every|each|no|none)\b/i.test(conclusion)
    const premisesParticular =
      /\b(some|few|most|many)\b/i.test(majorPremise) ||
      /\b(some|few|most|many)\b/i.test(minorPremise)

    if (conclusionUniversal && premisesParticular) {
      return {
        isValid: false,
        form: 'illicit_major',
        explanation: 'Cannot draw a universal conclusion from particular premises.',
        confidence: 0.85,
      }
    }

    return {
      isValid: true,
      form: isUniversal ? 'universal_affirmative' : 'particular_affirmative',
      explanation: `Valid syllogism with middle term "${middleTerm}".`,
      confidence: 0.75,
    }
  }

  // ── Fallacy Detection ────────────────────────────────────────────────────

  /**
   * Detect logical fallacies in text
   */
  detectFallacies(text: string): FallacyResult {
    const detected: DetectedFallacy[] = []

    for (const fallacy of FALLACY_PATTERNS) {
      for (const pattern of fallacy.patterns) {
        const match = text.match(pattern)
        if (match) {
          // Avoid duplicate fallacy types
          if (!detected.some(d => d.name === fallacy.name)) {
            detected.push({
              type: fallacy.type,
              name: fallacy.name,
              description: fallacy.description,
              evidence: match[0],
              severity: fallacy.severity,
            })
          }
          break
        }
      }
    }

    return {
      hasFallacy: detected.length > 0,
      fallacies: detected,
      confidence: detected.length > 0 ? Math.min(0.9, 0.5 + detected.length * 0.1) : 0.7,
    }
  }

  // ── Argument Construction ────────────────────────────────────────────────

  /**
   * Build a logical argument structure from premises and conclusion
   */
  constructArgument(premises: string[], conclusion: string): ArgumentStructure {
    const intermediateSteps: string[] = []

    // Validate that premises logically support the conclusion
    const premiseKeywords = premises.flatMap(p =>
      p
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3),
    )
    const conclusionKeywords = conclusion
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)

    const overlap = conclusionKeywords.filter(k => premiseKeywords.includes(k))
    const coverageRatio = overlap.length / Math.max(conclusionKeywords.length, 1)

    // Build chain of reasoning
    if (premises.length >= 2) {
      for (let i = 0; i < premises.length - 1; i++) {
        const step = `From (${i + 1}) and (${i + 2}): Combined reasoning`
        intermediateSteps.push(step)
      }
    }

    const isValid = coverageRatio > 0.3 && premises.length >= 1

    // Determine logical form
    let logicalForm = 'deductive'
    if (/\b(probably|likely|typically|usually|often)\b/i.test(conclusion)) {
      logicalForm = 'inductive'
    }
    if (/\b(best explanation|simplest|most likely)\b/i.test(conclusion)) {
      logicalForm = 'abductive'
    }

    return {
      premises,
      intermediateSteps,
      conclusion,
      isValid,
      logicalForm,
    }
  }

  // ── Contradiction Detection ──────────────────────────────────────────────

  /**
   * Detect contradictions in a set of statements
   */
  detectContradictions(statements: string[]): {
    hasContradiction: boolean
    pairs: [number, number][]
    explanations: string[]
  } {
    const pairs: [number, number][] = []
    const explanations: string[] = []

    for (let i = 0; i < statements.length; i++) {
      for (let j = i + 1; j < statements.length; j++) {
        const s1 = statements[i]!.toLowerCase()
        const s2 = statements[j]!.toLowerCase()

        // Check for direct negation
        if (this.isNegation(s1, s2)) {
          pairs.push([i, j])
          explanations.push(`Statement ${i + 1} contradicts statement ${j + 1}: direct negation`)
        }

        // Check for quantifier contradiction
        if (this.hasQuantifierContradiction(s1, s2)) {
          pairs.push([i, j])
          explanations.push(
            `Statement ${i + 1} contradicts statement ${j + 1}: quantifier mismatch`,
          )
        }
      }
    }

    return {
      hasContradiction: pairs.length > 0,
      pairs,
      explanations,
    }
  }

  // ── Modus Ponens / Modus Tollens ─────────────────────────────────────────

  /**
   * Apply modus ponens: if P→Q and P, then Q
   */
  modusPonens(conditional: string, antecedent: string): { valid: boolean; conclusion: string } {
    // Simple pattern: "if X then Y"
    const match = conditional.match(/if\s+(.+?)\s+then\s+(.+)/i)
    if (!match) {
      return { valid: false, conclusion: '' }
    }

    const condAntecedent = match[1]!.trim().toLowerCase()
    const consequent = match[2]!.trim()

    // Check if antecedent matches
    const similarity = this.textSimilarity(condAntecedent, antecedent.toLowerCase())
    if (similarity > 0.6) {
      return { valid: true, conclusion: consequent }
    }

    return { valid: false, conclusion: '' }
  }

  /**
   * Apply modus tollens: if P→Q and ¬Q, then ¬P
   */
  modusTollens(
    conditional: string,
    negatedConsequent: string,
  ): { valid: boolean; conclusion: string } {
    const match = conditional.match(/if\s+(.+?)\s+then\s+(.+)/i)
    if (!match) {
      return { valid: false, conclusion: '' }
    }

    const antecedent = match[1]!.trim()
    const consequent = match[2]!.trim().toLowerCase()

    // Check if negated consequent matches (look for "not" + consequent)
    const cleanNeg = negatedConsequent
      .toLowerCase()
      .replace(/\bnot\b\s*/i, '')
      .trim()
    const similarity = this.textSimilarity(consequent, cleanNeg)

    if (similarity > 0.5) {
      return { valid: true, conclusion: `Not ${antecedent.toLowerCase()}` }
    }

    return { valid: false, conclusion: '' }
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private safeEval(expr: string): boolean {
    // Only allow logical operators and boolean values
    const sanitized = expr.replace(/[^true false!&|()]/g, '')
    const tokens = sanitized.match(/true|false|!|&&|\|\||\(|\)/g) || []

    // Simple recursive descent parser
    let pos = 0

    const parseExpr = (): boolean => {
      let result = parseTerm()
      while (pos < tokens.length && tokens[pos] === '||') {
        pos++
        result = result || parseTerm()
      }
      return result
    }

    const parseTerm = (): boolean => {
      let result = parseFactor()
      while (pos < tokens.length && tokens[pos] === '&&') {
        pos++
        result = result && parseFactor()
      }
      return result
    }

    const parseFactor = (): boolean => {
      if (tokens[pos] === '!') {
        pos++
        return !parseFactor()
      }
      if (tokens[pos] === '(') {
        pos++
        const result = parseExpr()
        if (tokens[pos] === ')') pos++
        return result
      }
      const val = tokens[pos] === 'true'
      pos++
      return val
    }

    return parseExpr()
  }

  private extractSyllogismTerms(statement: string): string[] {
    return statement
      .toLowerCase()
      .replace(/\b(all|some|no|every|each|none|are|is|a|an|the|if|then)\b/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .map(w => w.replace(/s$/, '')) // normalize simple plurals
  }

  private isNegation(s1: string, s2: string): boolean {
    // "X is Y" vs "X is not Y"
    const p1 = s1.match(/(.+?)\s+is\s+(?:not\s+)?(.+)/)
    const p2 = s2.match(/(.+?)\s+is\s+(?:not\s+)?(.+)/)
    if (!p1 || !p2) return false

    const sameTopic = this.textSimilarity(p1[1]!, p2[1]!) > 0.7
    const oneNegated =
      (s1.includes(' not ') && !s2.includes(' not ')) ||
      (!s1.includes(' not ') && s2.includes(' not '))
    const samePredicate =
      this.textSimilarity(p1[2]!.replace(/\bnot\s+/g, ''), p2[2]!.replace(/\bnot\s+/g, '')) > 0.7

    return sameTopic && oneNegated && samePredicate
  }

  private hasQuantifierContradiction(s1: string, s2: string): boolean {
    const allPattern = /\b(all|every|each)\b/
    const nonePattern = /\b(no|none|never)\b/
    const _somePattern = /\b(some|few|most)\b/

    // "All X are Y" vs "No X are Y"
    if (
      (allPattern.test(s1) && nonePattern.test(s2)) ||
      (nonePattern.test(s1) && allPattern.test(s2))
    ) {
      // Check if they're about the same subject
      const words1 = s1
        .replace(/\b(all|every|each|no|none|never|some|few|most|are|is)\b/g, '')
        .trim()
      const words2 = s2
        .replace(/\b(all|every|each|no|none|never|some|few|most|are|is)\b/g, '')
        .trim()
      return this.textSimilarity(words1, words2) > 0.5
    }

    return false
  }

  private textSimilarity(a: string, b: string): number {
    const words1 = new Set(a.split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(b.split(/\s+/).filter(w => w.length > 2))
    if (words1.size === 0 || words2.size === 0) return 0
    let intersection = 0
    for (const w of words1) if (words2.has(w)) intersection++
    return intersection / Math.max(words1.size, words2.size)
  }
}
