/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DocumentAnalyzer — Tests                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { DocumentAnalyzer } from '../DocumentAnalyzer.js'

// ── Test Documents ──

const MARKDOWN_DOC = `# Getting Started with TypeScript

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
It adds optional static typing and class-based object-oriented programming.

## Installation

To install TypeScript globally:

\`\`\`bash
npm install -g typescript
\`\`\`

## Basic Types

TypeScript provides several basic types:

| Type | Example | Description |
|------|---------|-------------|
| string | "hello" | Text values |
| number | 42 | Numeric values |
| boolean | true | True/false values |

## Functions

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

Functions can have typed parameters and return types.

## Conclusion

TypeScript helps catch errors early and makes code more maintainable.
Visit https://www.typescriptlang.org for more information.
Contact: support@typescript.org
`

const TECHNICAL_DOC = `
API Reference: UserService

The UserService module handles user authentication and management.

## Endpoints

### POST /api/users/login

Parameters:
- username: string (required)
- password: string (required)

Response: JWT token with user profile.

### GET /api/users/:id

Returns user profile by ID.

### Error Handling

All endpoints return standard error responses:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Configuration

Set the following environment variables:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret key for token signing
- REDIS_URL: Cache connection (optional)

Version: v2.3.1
`

const CODE_DOC = `import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
`

const SHORT_DOC = 'Hello world. This is a short document with just a few words.'

describe('DocumentAnalyzer', () => {
  let analyzer: DocumentAnalyzer

  beforeEach(() => {
    analyzer = new DocumentAnalyzer()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      expect(analyzer.totalAnalyses).toBe(0)
    })

    it('accepts custom config', () => {
      const custom = new DocumentAnalyzer({ keywordCount: 5, wordsPerPage: 300 })
      expect(custom.totalAnalyses).toBe(0)
    })
  })

  // ── Metadata ──

  describe('metadata extraction', () => {
    it('counts words accurately', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.wordCount).toBeGreaterThan(50)
    })

    it('counts sentences', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.sentenceCount).toBeGreaterThan(3)
    })

    it('counts paragraphs', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.paragraphCount).toBeGreaterThan(2)
    })

    it('estimates pages', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.estimatedPages).toBeGreaterThanOrEqual(1)
    })

    it('detects title from markdown', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.title).toContain('TypeScript')
    })

    it('detects language as english', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.language).toBe('english')
    })

    it('detects features — code', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.hasCode).toBe(true)
    })

    it('detects features — tables', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.hasTables).toBe(true)
    })

    it('detects features — links', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.hasLinks).toBe(true)
    })
  })

  // ── Format Detection ──

  describe('format detection', () => {
    it('detects markdown format', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.metadata.format).toBe('markdown')
    })

    it('detects code format', () => {
      const result = analyzer.analyze({ content: CODE_DOC, fileName: 'UserList.tsx' })
      expect(result.metadata.format).toBe('code')
    })

    it('detects format from MIME type', () => {
      const result = analyzer.analyze({ content: 'Some text', mimeType: 'application/pdf' })
      expect(result.metadata.format).toBe('pdf')
    })

    it('detects format from file extension', () => {
      const result = analyzer.analyze({ content: 'Data', fileName: 'report.pdf' })
      expect(result.metadata.format).toBe('pdf')
    })

    it('detects plaintext as fallback', () => {
      const result = analyzer.analyze({ content: SHORT_DOC })
      expect(result.metadata.format).toBe('plaintext')
    })

    it('detects JSON format', () => {
      const result = analyzer.analyze({ content: '{"key": "value", "count": 42}' })
      expect(result.metadata.format).toBe('json')
    })
  })

  // ── Structure Analysis ──

  describe('structure analysis', () => {
    it('extracts sections from markdown headings', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.structure.sections.length).toBeGreaterThan(2)
    })

    it('detects section hierarchy depth', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.structure.depth).toBeGreaterThanOrEqual(1)
    })

    it('builds outline', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.structure.outline.length).toBeGreaterThan(0)
    })

    it('detects structure type', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(['flat', 'hierarchical', 'tabular', 'mixed']).toContain(result.structure.structureType)
    })

    it('creates single section for flat content', () => {
      const result = analyzer.analyze({ content: SHORT_DOC })
      expect(result.structure.sections.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Content Analysis ──

  describe('content analysis', () => {
    it('extracts key sentences', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.content.keySentences.length).toBeGreaterThan(0)
    })

    it('computes vocabulary size', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.content.vocabularySize).toBeGreaterThan(10)
    })

    it('computes average sentence length', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.content.avgSentenceLength).toBeGreaterThan(0)
    })

    it('computes complex word percentage', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.content.complexWordPercentage).toBeGreaterThanOrEqual(0)
      expect(result.content.complexWordPercentage).toBeLessThanOrEqual(1)
    })

    it('extracts entities — URLs', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const urls = result.content.entities.filter(e => e.type === 'url')
      expect(urls.length).toBeGreaterThan(0)
    })

    it('extracts entities — emails', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const emails = result.content.entities.filter(e => e.type === 'email')
      expect(emails.length).toBeGreaterThan(0)
    })

    it('extracts acronyms', () => {
      const result = analyzer.analyze({ content: TECHNICAL_DOC })
      expect(result.content.acronyms.length).toBeGreaterThan(0)
    })
  })

  // ── Readability ──

  describe('readability metrics', () => {
    it('computes Flesch-Kincaid score', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.readability.fleschKincaid).toBeGreaterThanOrEqual(0)
      expect(result.readability.fleschKincaid).toBeLessThanOrEqual(100)
    })

    it('computes Gunning Fog index', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.readability.gunningFog).toBeGreaterThanOrEqual(0)
    })

    it('computes reading time', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.readability.readingTimeMinutes).toBeGreaterThanOrEqual(1)
    })

    it('assigns readability level', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const validLevels = ['elementary', 'middle_school', 'high_school', 'college', 'graduate', 'professional']
      expect(validLevels).toContain(result.readability.level)
    })
  })

  // ── Classification ──

  describe('document classification', () => {
    it('classifies technical documentation', () => {
      const result = analyzer.analyze({ content: TECHNICAL_DOC })
      const techTypes = ['technical', 'api_docs', 'code_documentation', 'reference']
      expect(techTypes).toContain(result.classification.primaryType)
    })

    it('provides confidence score', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.classification.confidence).toBeGreaterThanOrEqual(0)
      expect(result.classification.confidence).toBeLessThanOrEqual(1)
    })

    it('detects domain', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.classification.domain).toBeTruthy()
    })
  })

  // ── Keywords ──

  describe('keyword extraction', () => {
    it('extracts keywords', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.keywords.length).toBeGreaterThan(0)
    })

    it('keywords have scores', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      for (const kw of result.keywords) {
        expect(kw.word).toBeTruthy()
        expect(kw.score).toBeGreaterThan(0)
        expect(kw.frequency).toBeGreaterThan(0)
      }
    })

    it('keywords are sorted by score descending', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      for (let i = 1; i < result.keywords.length; i++) {
        expect(result.keywords[i - 1]!.score).toBeGreaterThanOrEqual(result.keywords[i]!.score)
      }
    })

    it('includes TypeScript-related keywords for TS doc', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const kwWords = result.keywords.map(k => k.word.toLowerCase())
      expect(kwWords.some(w => w.includes('typescript') || w.includes('type') || w.includes('function'))).toBe(true)
    })
  })

  // ── Section Summaries ──

  describe('section summaries', () => {
    it('generates summaries for each section', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.summaries.length).toBe(result.structure.sections.length)
    })

    it('summaries have titles and key points', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      for (const summary of result.summaries) {
        expect(summary.sectionTitle).toBeTruthy()
        expect(summary.summary).toBeTruthy()
      }
    })
  })

  // ── Table Detection ──

  describe('table detection', () => {
    it('detects markdown tables', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.tables.length).toBeGreaterThan(0)
    })

    it('extracts table headers and rows', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const table = result.tables[0]!
      expect(table.headers.length).toBeGreaterThan(0)
      expect(table.rowCount).toBeGreaterThan(0)
      expect(table.columnCount).toBeGreaterThan(0)
    })

    it('can be disabled', () => {
      const noTables = new DocumentAnalyzer({ detectTables: false })
      const result = noTables.analyze({ content: MARKDOWN_DOC })
      expect(result.tables).toHaveLength(0)
    })
  })

  // ── Code Block Detection ──

  describe('code block detection', () => {
    it('detects fenced code blocks', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.codeBlocks.length).toBeGreaterThan(0)
    })

    it('identifies code language', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const tsBlock = result.codeBlocks.find(b => b.language === 'typescript')
      expect(tsBlock).toBeDefined()
    })

    it('can be disabled', () => {
      const noCode = new DocumentAnalyzer({ detectCode: false })
      const result = noCode.analyze({ content: MARKDOWN_DOC })
      expect(result.codeBlocks).toHaveLength(0)
    })
  })

  // ── Cross-References ──

  describe('cross-reference extraction', () => {
    it('extracts URLs', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const urls = result.references.filter(r => r.type === 'url')
      expect(urls.length).toBeGreaterThan(0)
    })

    it('extracts emails', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      const emails = result.references.filter(r => r.type === 'email')
      expect(emails.length).toBeGreaterThan(0)
    })
  })

  // ── Sentiment ──

  describe('sentiment analysis', () => {
    it('analyzes overall sentiment', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(result.sentiment.overall)
    })

    it('computes objectivity', () => {
      const result = analyzer.analyze({ content: TECHNICAL_DOC })
      expect(result.sentiment.objectivity).toBeGreaterThanOrEqual(0)
      expect(result.sentiment.objectivity).toBeLessThanOrEqual(1)
    })
  })

  // ── Question Answering ──

  describe('question answering', () => {
    it('answers questions about document content', () => {
      const result = analyzer.analyze({
        content: MARKDOWN_DOC,
        question: 'How do I install TypeScript?',
      })
      expect(result.answer).toBeTruthy()
      expect(result.answer!.length).toBeGreaterThan(10)
    })

    it('handles unanswerable questions gracefully', () => {
      const result = analyzer.analyze({
        content: MARKDOWN_DOC,
        question: 'What is quantum computing?',
      })
      expect(result.answer).toBeTruthy()
      // Should mention it couldn't find a direct answer
    })

    it('returns null when no question', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.answer).toBeNull()
    })
  })

  // ── Description ──

  describe('description', () => {
    it('generates a comprehensive description', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.description).toBeTruthy()
      expect(result.description.length).toBeGreaterThan(50)
    })

    it('includes document type in description', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.description.toLowerCase()).toMatch(/document|tutorial|technical|code/)
    })
  })

  // ── Validation ──

  describe('input validation', () => {
    it('throws on empty content', () => {
      expect(() => analyzer.analyze({ content: '' })).toThrow('empty')
    })

    it('throws on whitespace-only content', () => {
      expect(() => analyzer.analyze({ content: '   \n  \n  ' })).toThrow('empty')
    })

    it('truncates oversized content', () => {
      const huge = 'a '.repeat(300_000)
      const result = analyzer.analyze({ content: huge })
      // Should not throw, but should be truncated
      expect(result.metadata.wordCount).toBeLessThanOrEqual(300_000)
    })
  })

  // ── Stats ──

  describe('stats', () => {
    it('tracks analysis count', () => {
      analyzer.analyze({ content: MARKDOWN_DOC })
      analyzer.analyze({ content: TECHNICAL_DOC })
      expect(analyzer.totalAnalyses).toBe(2)
    })

    it('tracks format distribution', () => {
      analyzer.analyze({ content: MARKDOWN_DOC })
      analyzer.analyze({ content: SHORT_DOC })
      const stats = analyzer.getStats()
      expect(stats.formatDistribution['markdown']).toBe(1)
      expect(stats.formatDistribution['plaintext']).toBe(1)
    })

    it('tracks total words processed', () => {
      analyzer.analyze({ content: MARKDOWN_DOC })
      const stats = analyzer.getStats()
      expect(stats.totalWordsProcessed).toBeGreaterThan(0)
    })

    it('clears stats', () => {
      analyzer.analyze({ content: MARKDOWN_DOC })
      analyzer.clear()
      expect(analyzer.totalAnalyses).toBe(0)
    })
  })

  // ── Confidence ──

  describe('confidence', () => {
    it('has confidence between 0 and 1', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('higher confidence for longer, structured docs', () => {
      const shortResult = analyzer.analyze({ content: SHORT_DOC })
      const longResult = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(longResult.confidence).toBeGreaterThanOrEqual(shortResult.confidence)
    })
  })

  // ── Processing Time ──

  describe('processing time', () => {
    it('records processing time', () => {
      const result = analyzer.analyze({ content: MARKDOWN_DOC })
      expect(result.processingMs).toBeGreaterThanOrEqual(0)
    })
  })
})
