import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Compiler & Language Design Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Lexical Analysis ──────────────────────────────────────────────────────

  describe('Lexical Analysis', () => {
    it('explains lexer and tokenizer implementation', async () => {
      const r = await brain.chat(
        'How does a lexer tokenizer implementation work for lexical analysis?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/lexer|token|scan|character|keyword|identifier|literal/)
    })

    it('describes finite automata for scanning', async () => {
      const r = await brain.chat(
        'How do finite automata and regular expressions help scanner implementation?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /scanner|finite\s*automat|dfa|regex|token|lexer|implement/,
      )
    })

    it('covers token types and error recovery', async () => {
      const r = await brain.chat(
        'What token types does a lexer scanner handle during lexical analysis?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /token|keyword|identifier|literal|operator|delimit|lexer/,
      )
    })
  })

  // ── Parsing ───────────────────────────────────────────────────────────────

  describe('Parsing & AST', () => {
    it('explains recursive descent parser implementation', async () => {
      const r = await brain.chat(
        'How does a recursive descent parser implementation work for syntax analysis?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/parser|recursive\s*descent|grammar|ast|production|rule/)
    })

    it('describes abstract syntax tree generation', async () => {
      const r = await brain.chat(
        'How does abstract syntax tree AST generation work from parsed tokens?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /ast|abstract\s*syntax|tree|node|expression|statement|declar/,
      )
    })

    it('covers parser generator tools', async () => {
      const r = await brain.chat('What parser generator tools like ANTLR and Bison are available?')
      expect(r.text.toLowerCase()).toMatch(/antlr|bison|yacc|parser\s*generator|grammar|lalr|ll/)
    })

    it('describes context-free grammar', async () => {
      const r = await brain.chat(
        'What is a context-free grammar CFG and how do production rules work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /context-?free|grammar|cfg|bnf|production|rule|non-?terminal/,
      )
    })
  })

  // ── Type Systems ──────────────────────────────────────────────────────────

  describe('Type Systems', () => {
    it('explains static type checking and Hindley-Milner', async () => {
      const r = await brain.chat(
        'How does a type system with static type checking and Hindley-Milner inference work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/type|check|infer|hindley|milner|static|algorithm/)
    })

    it('describes generics and polymorphism', async () => {
      const r = await brain.chat(
        'How do generic types and polymorphism work in type system design?',
      )
      expect(r.text.toLowerCase()).toMatch(/generic|polymorph|type\s*class|trait|parametric|subtyp/)
    })

    it('covers algebraic data types', async () => {
      const r = await brain.chat(
        'What are algebraic data types in type system design: sum and product types?',
      )
      expect(r.text.toLowerCase()).toMatch(/algebraic|sum|product|type|variant|pattern|dependent/)
    })
  })

  // ── Code Generation ───────────────────────────────────────────────────────

  describe('Code Generation & Optimization', () => {
    it('explains LLVM IR and code generation', async () => {
      const r = await brain.chat(
        'How does LLVM IR code generation backend work for compiler optimization?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/llvm|ir|code\s*gen|optim|backend|pass|ssa/)
    })

    it('describes compiler optimization passes', async () => {
      const r = await brain.chat(
        'What compiler optimization passes exist like constant folding and dead code elimination?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /optim|constant\s*fold|dead\s*code|inline|loop|register|pass/,
      )
    })

    it('covers JIT vs AOT compilation', async () => {
      const r = await brain.chat(
        'What are the tradeoffs between JIT and AOT compilation in code generation?',
      )
      expect(r.text.toLowerCase()).toMatch(/jit|aot|compil|runtime|code\s*gen|v8|performance/)
    })
  })

  // ── Garbage Collection ────────────────────────────────────────────────────

  describe('Garbage Collection', () => {
    it('explains mark-and-sweep garbage collection', async () => {
      const r = await brain.chat('How does mark-and-sweep garbage collection algorithm work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /garbage\s*collect|mark|sweep|reachable|root|free|reclaim/,
      )
    })

    it('describes generational GC and reference counting', async () => {
      const r = await brain.chat(
        'How do generational garbage collection and reference counting work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /generat|reference\s*count|young|old|minor|major|gc|collect/,
      )
    })

    it('covers Rust ownership vs GC approaches', async () => {
      const r = await brain.chat(
        'How does Rust ownership compare to garbage collection for memory management?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /rust|ownership|borrow|gc|garbage|memory|compile-?time|zero-?cost/,
      )
    })
  })

  // ── Virtual Machines ──────────────────────────────────────────────────────

  describe('Virtual Machines & Interpreters', () => {
    it('explains bytecode VM design', async () => {
      const r = await brain.chat('How does a bytecode compiler and virtual machine design work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /bytecode|virtual\s*machine|vm|compil|instruction|stack|register/,
      )
    })

    it('describes stack-based vs register-based VMs', async () => {
      const r = await brain.chat(
        'What is the difference between stack-based and register-based virtual machines?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /stack|register|vm|virtual\s*machine|push|pop|operand|instruction/,
      )
    })

    it('covers tree-walking interpretation', async () => {
      const r = await brain.chat('How does a tree-walking interpreter evaluate AST nodes directly?')
      expect(r.text.toLowerCase()).toMatch(/interpreter|tree|ast|evaluat|node|walk|travers/)
    })

    it('describes VM optimization techniques', async () => {
      const r = await brain.chat(
        'What bytecode VM optimization techniques exist like inline caching?',
      )
      expect(r.text.toLowerCase()).toMatch(/vm|optim|inline\s*cach|bytecode|nan\s*box|goto|intern/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Compiler & Language Design concepts', () => {
    it('has Compiler & Language Design concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Compiler & Language Design')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('computer-science')
    })

    it('has Lexical Analysis concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Lexical Analysis')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('compilers')
    })

    it('has Parsing & AST concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Parsing & AST')
      expect(concept).toBeDefined()
    })

    it('has Type Systems concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Type Systems')
      expect(concept).toBeDefined()
    })

    it('has Code Generation & Optimization concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Code Generation & Optimization')
      expect(concept).toBeDefined()
    })

    it('has Garbage Collection concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Garbage Collection')
      expect(concept).toBeDefined()
    })

    it('has Virtual Machines & Interpreters concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Virtual Machines & Interpreters')
      expect(concept).toBeDefined()
    })

    it('Compiler Design has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Compiler & Language Design')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Lexical Analysis is related to Parsing', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Lexical Analysis')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Parsing & AST')
    })

    it('GC is related to Virtual Machines', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Garbage Collection')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Virtual Machines & Interpreters')
    })
  })
})
