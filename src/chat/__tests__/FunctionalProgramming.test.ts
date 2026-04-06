import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Functional Programming Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── FP Fundamentals ────────────────────────────────────────────────────
  describe('FP Fundamentals', () => {
    it('explains pure functions and immutability', async () => {
      const r = await brain.chat('What are functional programming pure function immutability concepts?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pure\s*function|immutab|functional|side\s*effect|first.?class/)
    })

    it('covers higher order functions', async () => {
      const r = await brain.chat('How do higher order function map filter reduce functional composition work?')
      expect(r.text.toLowerCase()).toMatch(/higher.?order|map|filter|reduce|composition|function/)
    })
  })

  // ── Monads & ADTs ──────────────────────────────────────────────────────
  describe('Monads & Algebraic Types', () => {
    it('explains monads and ADTs', async () => {
      const r = await brain.chat('What are monad functor applicative type class algebraic data types in FP?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/monad|functor|applicative|algebraic|type|maybe|either/)
    })

    it('covers Maybe Either error handling', async () => {
      const r = await brain.chat('How does Maybe Either Option Result error handling work in functional programming?')
      expect(r.text.toLowerCase()).toMatch(/maybe|either|option|result|error|monad|pattern/)
    })
  })

  // ── Haskell ────────────────────────────────────────────────────────────
  describe('Haskell', () => {
    it('explains Haskell type system and lazy evaluation', async () => {
      const r = await brain.chat('How does the Haskell type system lazy evaluation and typeclass system work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/haskell|type|lazy|evaluation|typeclass|io\s*monad|pure/)
    })

    it('covers GHC compiler and packages', async () => {
      const r = await brain.chat('What are GHC Haskell compiler cabal stack package management tools?')
      expect(r.text.toLowerCase()).toMatch(/haskell|ghc|cabal|stack|compiler|package|hackage/)
    })
  })

  // ── Rust Functional Features ───────────────────────────────────────────
  describe('Rust Functional', () => {
    it('explains Rust ownership and pattern matching', async () => {
      const r = await brain.chat('How do Rust ownership borrow checker lifetime safety and pattern matching work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/rust|ownership|borrow|lifetime|pattern\s*match|option|result/)
    })

    it('covers Rust traits and iterators', async () => {
      const r = await brain.chat('How do Rust trait generic zero cost abstraction iterators work?')
      expect(r.text.toLowerCase()).toMatch(/rust|trait|generic|iterator|zero.?cost|closure|abstract/)
    })
  })

  // ── FP Languages ───────────────────────────────────────────────────────
  describe('FP Languages', () => {
    it('explains Scala Elixir Clojure', async () => {
      const r = await brain.chat('What are Scala functional OOP and Elixir Erlang OTP and Clojure Lisp JVM languages?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/scala|elixir|clojure|erlang|jvm|pattern\s*match|otp|functional/)
    })
  })

  // ── Reactive Programming ───────────────────────────────────────────────
  describe('Reactive Programming', () => {
    it('explains RxJS and reactive streams', async () => {
      const r = await brain.chat('How does reactive programming with RxJS observable stream operators work?')
      expect(r.text.toLowerCase()).toMatch(/reactive|rxjs|observable|stream|operator|signal|event/)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - FP concepts', () => {
    it('has Functional Programming concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Functional Programming')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('programming')
    })

    it('has FP Fundamentals concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('FP Fundamentals')
      expect(c).toBeDefined()
    })

    it('has Monads & ADTs concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Monads & ADTs')
      expect(c).toBeDefined()
    })

    it('has Haskell concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Haskell')
      expect(c).toBeDefined()
    })

    it('has Rust Functional Features concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Rust Functional Features')
      expect(c).toBeDefined()
    })

    it('Functional Programming has many related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Functional Programming')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('FP Fundamentals is related to Monads', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('FP Fundamentals')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Monads & ADTs')
    })
  })
})
