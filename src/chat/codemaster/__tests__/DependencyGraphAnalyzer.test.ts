import { describe, it, expect, beforeEach } from 'vitest'
import {
  DependencyGraphAnalyzer,
  type FileContent,
} from '../DependencyGraphAnalyzer.js'

describe('DependencyGraphAnalyzer', () => {
  let analyzer: DependencyGraphAnalyzer

  beforeEach(() => {
    analyzer = new DependencyGraphAnalyzer()
  })

  // ── CONSTRUCTOR ──────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance without errors', () => {
      expect(analyzer).toBeInstanceOf(DependencyGraphAnalyzer)
    })
  })

  // ── EMPTY INPUT ──────────────────────────────────────────────────────

  describe('empty input handling', () => {
    it('analyzeFiles with empty array returns defaults', () => {
      const result = analyzer.analyzeFiles([])
      expect(result.nodes).toHaveLength(0)
      expect(result.circularDeps).toHaveLength(0)
      expect(result.issues).toHaveLength(0)
      expect(result.couplingScore).toBe(100)
      expect(result.summary).toContain('0 module(s) analyzed')
    })

    it('addFile with empty content returns node with no imports/exports', () => {
      const node = analyzer.addFile('empty.ts', '')
      expect(node.imports).toHaveLength(0)
      expect(node.exports).toHaveLength(0)
      expect(node.fanOut).toBe(0)
    })
  })

  // ── ES6 IMPORT EXTRACTION ───────────────────────────────────────────

  describe('ES6 import extraction', () => {
    it('extracts named imports', () => {
      const node = analyzer.addFile('a.ts', `import { foo, bar } from './b'`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].names).toEqual(['foo', 'bar'])
      expect(node.imports[0].isDefault).toBe(false)
      expect(node.imports[0].source).toBe('./b')
    })

    it('extracts default imports', () => {
      const node = analyzer.addFile('a.ts', `import MyClass from './module'`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].isDefault).toBe(true)
      expect(node.imports[0].names).toContain('MyClass')
    })

    it('extracts type-only imports', () => {
      const node = analyzer.addFile('a.ts', `import type { Foo } from './types'`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].isTypeOnly).toBe(true)
      expect(node.imports[0].names).toEqual(['Foo'])
    })

    it('extracts side-effect imports', () => {
      const node = analyzer.addFile('a.ts', `import './polyfill'`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].source).toBe('./polyfill')
      expect(node.imports[0].names).toHaveLength(0)
      expect(node.imports[0].isDefault).toBe(false)
    })

    it('extracts default + named imports', () => {
      const node = analyzer.addFile('a.ts', `import React, { useState } from 'react'`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].isDefault).toBe(true)
      expect(node.imports[0].names).toContain('React')
      expect(node.imports[0].names).toContain('useState')
    })

    it('records correct line numbers', () => {
      const content = `const x = 1\nimport { a } from './a'\nimport { b } from './b'`
      const node = analyzer.addFile('f.ts', content)
      expect(node.imports[0].line).toBe(2)
      expect(node.imports[1].line).toBe(3)
    })
  })

  // ── COMMONJS REQUIRE EXTRACTION ─────────────────────────────────────

  describe('CommonJS require extraction', () => {
    it('extracts default require', () => {
      const node = analyzer.addFile('a.js', `const fs = require('fs')`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].source).toBe('fs')
      expect(node.imports[0].names).toEqual(['fs'])
      expect(node.imports[0].isDefault).toBe(true)
    })

    it('extracts destructured require', () => {
      const node = analyzer.addFile('a.js', `const { readFile, writeFile } = require('fs')`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].names).toEqual(['readFile', 'writeFile'])
      expect(node.imports[0].isDefault).toBe(false)
    })
  })

  // ── PYTHON IMPORT EXTRACTION ────────────────────────────────────────

  describe('Python import extraction', () => {
    it('extracts from X import Y', () => {
      const node = analyzer.addFile('a.py', `from os.path import join, exists`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].source).toBe('os.path')
      expect(node.imports[0].names).toEqual(['join', 'exists'])
    })

    it('extracts import X', () => {
      const node = analyzer.addFile('a.py', `import os.path`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].source).toBe('os.path')
      expect(node.imports[0].names).toEqual(['path'])
      expect(node.imports[0].isDefault).toBe(true)
    })

    it('handles aliased python imports', () => {
      const node = analyzer.addFile('a.py', `from collections import OrderedDict as OD, defaultdict as dd`)
      expect(node.imports).toHaveLength(1)
      expect(node.imports[0].names).toEqual(['OrderedDict', 'defaultdict'])
    })
  })

  // ── EXPORT EXTRACTION ───────────────────────────────────────────────

  describe('export extraction', () => {
    it('extracts default export with name', () => {
      const node = analyzer.addFile('a.ts', `export default class Foo {}`)
      expect(node.exports).toHaveLength(1)
      expect(node.exports[0].isDefault).toBe(true)
      expect(node.exports[0].name).toBe('Foo')
    })

    it('extracts default export without name', () => {
      const node = analyzer.addFile('a.ts', `export default {}`)
      expect(node.exports).toHaveLength(1)
      expect(node.exports[0].isDefault).toBe(true)
      expect(node.exports[0].name).toBe('default')
    })

    it('extracts named exports from block', () => {
      const node = analyzer.addFile('a.ts', `export { foo, bar }`)
      expect(node.exports).toHaveLength(2)
      expect(node.exports.map(e => e.name)).toEqual(['foo', 'bar'])
    })

    it('extracts type-only exports', () => {
      const node = analyzer.addFile('a.ts', `export type { MyType }`)
      expect(node.exports).toHaveLength(1)
      expect(node.exports[0].isTypeOnly).toBe(true)
    })

    it('extracts direct export declarations', () => {
      const content = [
        `export const VALUE = 42`,
        `export function doStuff() {}`,
        `export class MyClass {}`,
        `export interface MyInterface {}`,
        `export enum Status {}`,
      ].join('\n')
      const node = analyzer.addFile('a.ts', content)
      expect(node.exports).toHaveLength(5)
      expect(node.exports.map(e => e.name)).toEqual([
        'VALUE', 'doStuff', 'MyClass', 'MyInterface', 'Status',
      ])
    })

    it('detects module.exports as default export', () => {
      const node = analyzer.addFile('a.js', `module.exports = something`)
      expect(node.exports).toHaveLength(1)
      expect(node.exports[0].isDefault).toBe(true)
    })

    it('marks interface and type exports as type-only', () => {
      const content = `export interface Foo {}\nexport type Bar = string`
      const node = analyzer.addFile('a.ts', content)
      expect(node.exports[0].isTypeOnly).toBe(true)
      expect(node.exports[1].isTypeOnly).toBe(true)
    })
  })

  // ── SINGLE FILE ANALYSIS ────────────────────────────────────────────

  describe('single file analysis', () => {
    it('addFile returns a DependencyNode with correct id', () => {
      const node = analyzer.addFile('src/utils.ts', `export const x = 1`)
      expect(node.id).toBe('src/utils.ts')
    })

    it('analyzeSingle delegates to addFile', () => {
      const content = `import { foo } from './foo'\nexport const bar = 1`
      const node = analyzer.analyzeSingle('bar.ts', content)
      expect(node.id).toBe('bar.ts')
      expect(node.imports).toHaveLength(1)
      expect(node.exports).toHaveLength(1)
    })

    it('fanOut equals the number of imports', () => {
      const content = `import { a } from './a'\nimport { b } from './b'\nimport { c } from './c'`
      const node = analyzer.addFile('x.ts', content)
      expect(node.fanOut).toBe(3)
    })
  })

  // ── MULTI-FILE ANALYSIS ─────────────────────────────────────────────

  describe('multi-file analysis (analyzeFiles)', () => {
    it('returns nodes for all provided files', () => {
      const files: FileContent[] = [
        { path: 'a.ts', content: `export const a = 1` },
        { path: 'b.ts', content: `import { a } from './a'` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.nodes).toHaveLength(2)
    })

    it('resets state between calls', () => {
      analyzer.analyzeFiles([{ path: 'a.ts', content: '' }])
      const result = analyzer.analyzeFiles([{ path: 'b.ts', content: '' }])
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].id).toBe('b.ts')
    })
  })

  // ── FAN-IN / FAN-OUT ────────────────────────────────────────────────

  describe('fan-in/fan-out calculation', () => {
    it('calculates fan-in correctly for a shared module', () => {
      const files: FileContent[] = [
        { path: 'utils', content: `export const helper = 1` },
        { path: 'a', content: `import { helper } from './utils'` },
        { path: 'b', content: `import { helper } from './utils'` },
        { path: 'c', content: `import { helper } from './utils'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const utilsNode = result.nodes.find(n => n.id === 'utils')!
      expect(utilsNode.fanIn).toBe(3)
      expect(utilsNode.fanOut).toBe(0)
    })

    it('calculates fan-out correctly for a consuming module', () => {
      const files: FileContent[] = [
        { path: 'a.ts', content: `export const a = 1` },
        { path: 'b.ts', content: `export const b = 2` },
        { path: 'main.ts', content: `import { a } from './a'\nimport { b } from './b'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const mainNode = result.nodes.find(n => n.id === 'main.ts')!
      expect(mainNode.fanOut).toBe(2)
    })
  })

  // ── INSTABILITY METRIC ──────────────────────────────────────────────

  describe('instability metric', () => {
    it('is 0 for a module with only fan-in (perfectly stable)', () => {
      const files: FileContent[] = [
        { path: 'lib.ts', content: `export const fn = 1` },
        { path: 'a.ts', content: `import { fn } from './lib'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const libNode = result.nodes.find(n => n.id === 'lib.ts')!
      expect(libNode.instability).toBe(0)
    })

    it('is 1 for a module with only fan-out (maximally unstable)', () => {
      const files: FileContent[] = [
        { path: 'lib.ts', content: `export const fn = 1` },
        { path: 'consumer.ts', content: `import { fn } from './lib'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const consumer = result.nodes.find(n => n.id === 'consumer.ts')!
      expect(consumer.instability).toBe(1)
    })

    it('is 0 when both fan-in and fan-out are 0', () => {
      const files: FileContent[] = [
        { path: 'isolated.ts', content: `const x = 1` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.nodes[0].instability).toBe(0)
    })

    it('is between 0 and 1 for mixed fan-in/fan-out', () => {
      const files: FileContent[] = [
        { path: 'base', content: `export const x = 1` },
        { path: 'mid', content: `import { x } from './base'\nexport const y = x` },
        { path: 'top', content: `import { y } from './mid'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const mid = result.nodes.find(n => n.id === 'mid')!
      // fanIn=1, fanOut=1 → instability = 1/2 = 0.5
      expect(mid.instability).toBe(0.5)
    })
  })

  // ── CIRCULAR DEPENDENCY DETECTION ───────────────────────────────────

  describe('circular dependency detection', () => {
    it('detects a 2-node cycle (A → B → A)', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { b } from './b'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.circularDeps.length).toBeGreaterThanOrEqual(1)
      const cycle = result.circularDeps[0].cycle
      expect(cycle[0]).toBe(cycle[cycle.length - 1])
    })

    it('detects a 3-node cycle (A → B → C → A)', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { c } from './c'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
        { path: 'c', content: `import { b } from './b'\nexport const c = 3` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.circularDeps.length).toBeGreaterThanOrEqual(1)
    })

    it('assigns low severity to short cycles', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { b } from './b'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.circularDeps[0].severity).toBe('low')
    })

    it('returns no cycles when there are none', () => {
      const files: FileContent[] = [
        { path: 'a.ts', content: `export const a = 1` },
        { path: 'b.ts', content: `import { a } from './a'` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.circularDeps).toHaveLength(0)
    })

    it('getCircularDependencies works after addFile calls', () => {
      analyzer.addFile('a', `import { b } from './b'\nexport const a = 1`)
      analyzer.addFile('b', `import { a } from './a'\nexport const b = 2`)
      const cycles = analyzer.getCircularDependencies()
      expect(cycles.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── UNUSED EXPORT DETECTION ─────────────────────────────────────────

  describe('unused export detection', () => {
    it('detects unused named exports across files', () => {
      const files: FileContent[] = [
        { path: 'lib.ts', content: `export const used = 1\nexport const unused = 2` },
        { path: 'main.ts', content: `import { used } from './lib'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const unusedIssues = result.issues.filter(i => i.type === 'unused-export')
      expect(unusedIssues.some(i => i.title.includes('unused'))).toBe(true)
    })

    it('does not flag default exports as unused', () => {
      const files: FileContent[] = [
        { path: 'lib.ts', content: `export default class Foo {}` },
        { path: 'main.ts', content: `const x = 1` },
      ]
      const result = analyzer.analyzeFiles(files)
      const unusedDefaults = result.issues.filter(
        i => i.type === 'unused-export' && i.title.includes('default'),
      )
      expect(unusedDefaults).toHaveLength(0)
    })
  })

  // ── HIGH COUPLING DETECTION ─────────────────────────────────────────

  describe('high coupling detection', () => {
    it('flags a module with more than 10 imports', () => {
      const imports = Array.from({ length: 12 }, (_, i) =>
        `import { x${i} } from './m${i}'`,
      ).join('\n')
      const files: FileContent[] = [
        { path: 'big.ts', content: imports },
      ]
      const result = analyzer.analyzeFiles(files)
      const highCoupling = result.issues.filter(i => i.type === 'high-coupling')
      expect(highCoupling.length).toBeGreaterThanOrEqual(1)
      expect(highCoupling[0].file).toBe('big.ts')
    })

    it('does not flag a module with 10 or fewer imports', () => {
      const imports = Array.from({ length: 10 }, (_, i) =>
        `import { x${i} } from './m${i}'`,
      ).join('\n')
      const files: FileContent[] = [
        { path: 'ok.ts', content: imports },
      ]
      const result = analyzer.analyzeFiles(files)
      const fanOutIssues = result.issues.filter(
        i => i.type === 'high-coupling' && i.title.includes('fan-out'),
      )
      expect(fanOutIssues).toHaveLength(0)
    })
  })

  // ── DEEP RELATIVE IMPORT DETECTION ──────────────────────────────────

  describe('deep relative import detection', () => {
    it('flags imports with 4+ slash levels that start with .', () => {
      const content = `import { x } from '../../../../deeply/nested/module'`
      const files: FileContent[] = [{ path: 'deep.ts', content }]
      const result = analyzer.analyzeFiles(files)
      const deepIssues = result.issues.filter(i => i.type === 'deep-import')
      expect(deepIssues.length).toBeGreaterThanOrEqual(1)
    })

    it('does not flag absolute package imports regardless of depth', () => {
      const content = `import { x } from '@scope/pkg/a/b/c/d/e'`
      const files: FileContent[] = [{ path: 'ok.ts', content }]
      const result = analyzer.analyzeFiles(files)
      const deepIssues = result.issues.filter(i => i.type === 'deep-import')
      expect(deepIssues).toHaveLength(0)
    })
  })

  // ── IMPORT PATH RESOLUTION ──────────────────────────────────────────

  describe('import path resolution', () => {
    it('resolves relative paths into the adjacency graph', () => {
      const files: FileContent[] = [
        { path: 'src/utils/helper.ts', content: `export const h = 1` },
        { path: 'src/app.ts', content: `import { h } from './utils/helper'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const appNode = result.nodes.find(n => n.id === 'src/app.ts')!
      // app.ts imports ./utils/helper → resolved to src/utils/helper
      expect(appNode.fanOut).toBe(1)
    })

    it('resolves .. paths correctly', () => {
      const files: FileContent[] = [
        { path: 'src/shared/types.ts', content: `export type X = string` },
        { path: 'src/features/a/index.ts', content: `import type { X } from '../../shared/types'` },
      ]
      const result = analyzer.analyzeFiles(files)
      const aNode = result.nodes.find(n => n.id === 'src/features/a/index.ts')!
      expect(aNode.fanOut).toBe(1)
    })

    it('keeps non-relative (package) imports as-is', () => {
      analyzer.addFile('a.ts', `import express from 'express'`)
      // Should not throw, and the import source is preserved
      const node = analyzer.analyzeSingle('b.ts', `import lodash from 'lodash'`)
      expect(node.imports[0].source).toBe('lodash')
    })
  })

  // ── RESET ───────────────────────────────────────────────────────────

  describe('reset functionality', () => {
    it('clears all nodes and adjacency data', () => {
      analyzer.addFile('a', `import { b } from './b'\nexport const a = 1`)
      analyzer.addFile('b', `import { a } from './a'\nexport const b = 2`)
      const cyclesBefore = analyzer.getCircularDependencies()
      expect(cyclesBefore.length).toBeGreaterThanOrEqual(1)

      analyzer.reset()

      const cyclesAfter = analyzer.getCircularDependencies()
      expect(cyclesAfter).toHaveLength(0)
    })
  })

  // ── COUPLING SCORE ──────────────────────────────────────────────────

  describe('coupling score', () => {
    it('is 100 for a clean codebase with no issues', () => {
      const files: FileContent[] = [
        { path: 'a.ts', content: `export const a = 1` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.couplingScore).toBe(100)
    })

    it('decreases when circular dependencies exist', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { b } from './b'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.couplingScore).toBeLessThan(100)
    })

    it('never goes below 0', () => {
      // Create many circular dependencies to heavily penalize
      const files: FileContent[] = Array.from({ length: 20 }, (_, i) => ({
        path: `m${i}.ts`,
        content: `import { x } from './m${(i + 1) % 20}'\nexport const x = ${i}`,
      }))
      const result = analyzer.analyzeFiles(files)
      expect(result.couplingScore).toBeGreaterThanOrEqual(0)
    })
  })

  // ── SUMMARY GENERATION ──────────────────────────────────────────────

  describe('summary generation', () => {
    it('includes module count', () => {
      const files: FileContent[] = [
        { path: 'a.ts', content: `export const a = 1` },
        { path: 'b.ts', content: `export const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.summary).toContain('2 module(s) analyzed')
    })

    it('mentions circular dependencies when present', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { b } from './b'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.summary).toContain('circular dependency cycle(s) found')
    })

    it('mentions issue count when issues exist', () => {
      const files: FileContent[] = [
        { path: 'a', content: `import { b } from './b'\nexport const a = 1` },
        { path: 'b', content: `import { a } from './a'\nexport const b = 2` },
      ]
      const result = analyzer.analyzeFiles(files)
      expect(result.summary).toContain('dependency issue(s) detected')
    })

    it('includes coupling score', () => {
      const result = analyzer.analyzeFiles([
        { path: 'a.ts', content: `export const a = 1` },
      ])
      expect(result.summary).toMatch(/Coupling score: \d+\/100/)
    })
  })
})
