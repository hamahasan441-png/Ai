/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PdfExpert — Tests                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { PdfExpert, DEFAULT_PDF_EXPERT_CONFIG } from '../PdfExpert.js'

// ── Test Documents ──

const TYPESCRIPT_DOC = `# Getting Started with TypeScript

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
It adds optional static typing and class-based object-oriented programming.

## Installation

To install TypeScript globally:

\`\`\`bash
npm install -g typescript
\`\`\`

You can also install it locally as a dev dependency:

\`\`\`bash
npm install --save-dev typescript
\`\`\`

## Basic Types

TypeScript provides several basic types:

- string: text values like "hello"
- number: numeric values like 42
- boolean: true or false values
- array: ordered lists of values
- tuple: fixed-length arrays with specific types
- enum: named constants
- any: opt-out of type checking
- void: absence of a value

## Functions

Functions can have typed parameters and return types.

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

Arrow functions also support type annotations:

\`\`\`typescript
const add = (a: number, b: number): number => a + b
\`\`\`

## Interfaces

Interfaces define the shape of objects:

\`\`\`typescript
interface User {
  name: string
  age: number
  email?: string
}
\`\`\`

The question mark (?) indicates optional properties.

## Conclusion

TypeScript helps catch errors early and makes code more maintainable.
Visit https://www.typescriptlang.org for more information.
`

const API_DOC = `# UserService API Reference

The UserService module handles user authentication and management operations.

## Authentication

### POST /api/auth/login

Authenticates a user and returns a JWT token.

Parameters:
- username: string (required) — the user's login name
- password: string (required) — the user's password

Response: A JSON object containing the JWT token and user profile.

### POST /api/auth/register

Creates a new user account.

Parameters:
- username: string (required)
- email: string (required)
- password: string (required, min 8 characters)

Response: The created user profile.

### POST /api/auth/logout

Invalidates the current JWT token.

## User Management

### GET /api/users/:id

Returns the user profile for the given ID.

### PUT /api/users/:id

Updates user profile information.

Parameters:
- name: string (optional)
- email: string (optional)
- avatar: string (optional)

### DELETE /api/users/:id

Permanently deletes a user account. Requires admin privileges.

## Error Handling

All endpoints return standard error responses:
- 400: Bad Request — invalid parameters
- 401: Unauthorized — missing or expired token
- 403: Forbidden — insufficient permissions
- 404: Not Found — resource does not exist
- 500: Internal Server Error — unexpected failure

## Rate Limiting

API requests are limited to 100 requests per minute per user.
Exceeding this limit will result in a 429 Too Many Requests response.
`

const PYTHON_DOC = `# Python Data Science Handbook

Python is widely used for data science and machine learning.

## NumPy Basics

NumPy provides powerful N-dimensional array operations.

Creating arrays:
- np.array([1, 2, 3]) creates a 1D array
- np.zeros((3, 3)) creates a 3x3 matrix of zeros
- np.ones((2, 4)) creates a 2x4 matrix of ones

Array operations support broadcasting and vectorization.

## Pandas DataFrames

Pandas provides the DataFrame for structured data manipulation.

Key operations:
- df.head() shows the first 5 rows
- df.describe() provides statistical summaries
- df.groupby() enables group-level aggregations
- df.merge() joins multiple DataFrames

## Machine Learning with Scikit-Learn

Scikit-Learn provides tools for classification, regression, and clustering.

Common workflow:
1. Split data into train and test sets
2. Create a model instance (e.g., RandomForestClassifier)
3. Fit the model on training data
4. Predict on test data
5. Evaluate with metrics (accuracy, precision, recall)

## Matplotlib Visualization

Matplotlib is the foundational plotting library.

Common plot types:
- plt.plot() for line charts
- plt.scatter() for scatter plots
- plt.bar() for bar charts
- plt.hist() for histograms
`

const SHORT_DOC = `Security Guidelines

Always validate user input before processing.
Use prepared statements to prevent SQL injection.
Hash passwords with bcrypt before storing them.
Enable HTTPS for all API endpoints.
`

// ── Tests ──

describe('PdfExpert', () => {
  let expert: PdfExpert

  beforeEach(() => {
    expert = new PdfExpert()
  })

  // ── Construction & Configuration ──

  describe('construction', () => {
    it('creates with default config', () => {
      const e = new PdfExpert()
      expect(e.documentCount).toBe(0)
    })

    it('creates with custom config', () => {
      const e = new PdfExpert({ maxDocuments: 5, relevanceThreshold: 0.5 })
      expect(e.documentCount).toBe(0)
    })

    it('DEFAULT_PDF_EXPERT_CONFIG has expected values', () => {
      expect(DEFAULT_PDF_EXPERT_CONFIG.maxDocuments).toBe(50)
      expect(DEFAULT_PDF_EXPERT_CONFIG.relevanceThreshold).toBe(0.1)
      expect(DEFAULT_PDF_EXPERT_CONFIG.maxQuotesPerAnswer).toBe(5)
      expect(DEFAULT_PDF_EXPERT_CONFIG.maxQuoteLength).toBe(500)
      expect(DEFAULT_PDF_EXPERT_CONFIG.enableComparison).toBe(true)
    })
  })

  // ── Document Management ──

  describe('loadDocument', () => {
    it('loads a document and returns an ID', () => {
      const id = expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      expect(id).toBe('doc-1')
      expect(expert.documentCount).toBe(1)
    })

    it('loads multiple documents with incremental IDs', () => {
      const id1 = expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      const id2 = expert.loadDocument(API_DOC, 'api.md')
      const id3 = expert.loadDocument(PYTHON_DOC, 'python.md')
      expect(id1).toBe('doc-1')
      expect(id2).toBe('doc-2')
      expect(id3).toBe('doc-3')
      expect(expert.documentCount).toBe(3)
    })

    it('throws on empty content', () => {
      expect(() => expert.loadDocument('')).toThrow('Document content is empty')
      expect(() => expert.loadDocument('   ')).toThrow('Document content is empty')
    })

    it('throws when max documents exceeded', () => {
      const e = new PdfExpert({ maxDocuments: 2 })
      e.loadDocument(TYPESCRIPT_DOC, 'doc1.md')
      e.loadDocument(API_DOC, 'doc2.md')
      expect(() => e.loadDocument(PYTHON_DOC, 'doc3.md')).toThrow('Maximum number of documents')
    })

    it('assigns default file name when not provided', () => {
      expert.loadDocument(TYPESCRIPT_DOC)
      const docs = expert.listDocuments()
      expect(docs[0]!.fileName).toContain('Document')
    })
  })

  describe('removeDocument', () => {
    it('removes an existing document', () => {
      const id = expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expect(expert.removeDocument(id)).toBe(true)
      expect(expert.documentCount).toBe(0)
    })

    it('returns false for non-existent document', () => {
      expect(expert.removeDocument('doc-999')).toBe(false)
    })
  })

  describe('listDocuments', () => {
    it('returns empty array when no documents loaded', () => {
      expect(expert.listDocuments()).toEqual([])
    })

    it('returns document metadata', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      expert.loadDocument(API_DOC, 'api.md')

      const docs = expert.listDocuments()
      expect(docs).toHaveLength(2)
      expect(docs[0]!.fileName).toBe('typescript.md')
      expect(docs[0]!.wordCount).toBeGreaterThan(50)
      expect(docs[0]!.estimatedPages).toBeGreaterThanOrEqual(1)
      expect(docs[1]!.fileName).toBe('api.md')
    })
  })

  describe('getDocument', () => {
    it('returns loaded document by ID', () => {
      const id = expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      const doc = expert.getDocument(id)
      expect(doc).not.toBeNull()
      expect(doc!.fileName).toBe('ts.md')
      expect(doc!.content).toBe(TYPESCRIPT_DOC)
    })

    it('returns null for non-existent ID', () => {
      expect(expert.getDocument('doc-999')).toBeNull()
    })
  })

  // ── Question Answering ──

  describe('ask', () => {
    beforeEach(() => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      expert.loadDocument(API_DOC, 'api.md')
    })

    it('answers a question from the TypeScript document', () => {
      const result = expert.ask('How do I install TypeScript?')
      expect(result.found).toBe(true)
      expect(result.answer).toContain('typescript.md')
      expect(result.citations.length).toBeGreaterThan(0)
      expect(result.citations[0]!.documentName).toBe('typescript.md')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('answers a question from the API document', () => {
      const result = expert.ask('How does authentication work?')
      expect(result.found).toBe(true)
      expect(result.citations.some(c => c.documentName === 'api.md')).toBe(true)
    })

    it('returns "not covered" for unrelated questions', () => {
      const result = expert.ask('What is quantum computing?')
      expect(result.found).toBe(false)
      expect(result.answer).toContain('not covered in the uploaded documents')
      expect(result.citations).toHaveLength(0)
    })

    it('handles string query shorthand', () => {
      const result = expert.ask('What are TypeScript basic types?')
      expect(result.found).toBe(true)
      expect(result.processingMs).toBeGreaterThanOrEqual(0)
    })

    it('handles PdfExpertQuery object', () => {
      const result = expert.ask({ question: 'What error codes are returned?' })
      expect(result.found).toBe(true)
      expect(result.citations.some(c => c.documentName === 'api.md')).toBe(true)
    })

    it('limits search to specific document IDs', () => {
      const result = expert.ask({
        question: 'What types are available?',
        documentIds: ['doc-1'], // TypeScript doc only
      })
      expect(result.found).toBe(true)
      expect(result.citations.every(c => c.documentId === 'doc-1')).toBe(true)
    })

    it('returns not found for non-existent document IDs', () => {
      const result = expert.ask({
        question: 'Anything?',
        documentIds: ['doc-999'],
      })
      expect(result.found).toBe(false)
    })

    it('returns correct message when no documents loaded', () => {
      const emptyExpert = new PdfExpert()
      const result = emptyExpert.ask('Any question?')
      expect(result.found).toBe(false)
      expect(result.answer).toContain('No documents have been loaded')
    })

    it('throws on empty question', () => {
      expect(() => expert.ask('')).toThrow('Question is empty')
    })

    it('citations include section title and quoted text', () => {
      const result = expert.ask('What are interfaces in TypeScript?')
      expect(result.found).toBe(true)
      for (const citation of result.citations) {
        expect(citation.sectionTitle).toBeTruthy()
        expect(citation.quotedText).toBeTruthy()
        expect(citation.relevance).toBeGreaterThan(0)
        expect(citation.documentId).toBeTruthy()
        expect(citation.documentName).toBeTruthy()
      }
    })

    it('cites from multiple documents when relevant', () => {
      // Both docs mention "parameters"
      const result = expert.ask('What parameters are used?')
      expect(result.found).toBe(true)
      // Should find relevant passages in API doc at least
      expect(result.citations.length).toBeGreaterThan(0)
    })

    it('answer format includes document name and quote', () => {
      const result = expert.ask('How do I install TypeScript?')
      expect(result.answer).toContain('typescript.md')
      expect(result.answer).toContain('"')
    })

    it('tracks queries answered and not found in stats', () => {
      expert.ask('How do I install TypeScript?')
      expert.ask('What is quantum physics?')
      expert.ask('What error codes exist?')

      const stats = expert.getStats()
      expect(stats.queriesAnswered).toBeGreaterThanOrEqual(1)
      expect(stats.queriesNotFound).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Cross-Document Search ──

  describe('searchDocuments', () => {
    beforeEach(() => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      expert.loadDocument(API_DOC, 'api.md')
      expert.loadDocument(PYTHON_DOC, 'python.md')
    })

    it('searches across all documents', () => {
      const results = expert.searchDocuments('types')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.relevance).toBeGreaterThan(0)
    })

    it('returns results with document names and snippets', () => {
      const results = expert.searchDocuments('authentication')
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) {
        expect(r.documentId).toBeTruthy()
        expect(r.documentName).toBeTruthy()
        expect(r.sectionTitle).toBeTruthy()
        expect(r.snippet).toBeTruthy()
        expect(r.relevance).toBeGreaterThan(0)
      }
    })

    it('returns empty for unrelated queries', () => {
      const results = expert.searchDocuments('astrophysics cosmology nebula pulsar')
      expect(results).toHaveLength(0)
    })

    it('throws on empty query', () => {
      expect(() => expert.searchDocuments('')).toThrow('Search query is empty')
    })

    it('tracks search count in stats', () => {
      expert.searchDocuments('function')
      expert.searchDocuments('data')
      expect(expert.getStats().searchesPerformed).toBe(2)
    })

    it('results are sorted by relevance', () => {
      const results = expert.searchDocuments('function types parameters')
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.relevance).toBeGreaterThanOrEqual(results[i]!.relevance)
      }
    })
  })

  // ── Document Comparison ──

  describe('compare', () => {
    beforeEach(() => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      expert.loadDocument(API_DOC, 'api.md')
      expert.loadDocument(PYTHON_DOC, 'python.md')
    })

    it('compares all documents when no IDs provided', () => {
      const result = expert.compare()
      expect(result.documentIds).toHaveLength(3)
      expect(result.summary).toContain('Compared 3 documents')
      expect(result.processingMs).toBeGreaterThanOrEqual(0)
    })

    it('compares specific documents by ID', () => {
      const result = expert.compare(['doc-1', 'doc-2'])
      expect(result.documentIds).toHaveLength(2)
      expect(result.documentIds).toContain('doc-1')
      expect(result.documentIds).toContain('doc-2')
    })

    it('finds shared topics between documents', () => {
      const result = expert.compare()
      // sharedTopics should be an array
      expect(Array.isArray(result.sharedTopics)).toBe(true)
    })

    it('finds unique topics per document', () => {
      const result = expert.compare()
      expect(result.uniqueTopics instanceof Map).toBe(true)
    })

    it('identifies connections between documents', () => {
      const result = expert.compare()
      expect(Array.isArray(result.connections)).toBe(true)
      for (const conn of result.connections) {
        expect(conn.sourceDocId).toBeTruthy()
        expect(conn.targetDocId).toBeTruthy()
        expect(conn.description).toBeTruthy()
        expect(conn.strength).toBeGreaterThanOrEqual(0)
        expect(conn.strength).toBeLessThanOrEqual(1)
      }
    })

    it('throws with fewer than 2 documents', () => {
      const e = new PdfExpert()
      e.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expect(() => e.compare()).toThrow('At least 2 documents are required')
    })

    it('throws when comparison disabled', () => {
      const e = new PdfExpert({ enableComparison: false })
      e.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      e.loadDocument(API_DOC, 'api.md')
      expect(() => e.compare()).toThrow('comparison is disabled')
    })

    it('summary includes document names', () => {
      const result = expert.compare()
      expect(result.summary).toContain('typescript.md')
      expect(result.summary).toContain('api.md')
      expect(result.summary).toContain('python.md')
    })

    it('tracks comparison count in stats', () => {
      expert.compare()
      expert.compare(['doc-1', 'doc-2'])
      expect(expert.getStats().comparisonsPerformed).toBe(2)
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns zero stats initially', () => {
      const stats = expert.getStats()
      expect(stats.documentsLoaded).toBe(0)
      expect(stats.totalWords).toBe(0)
      expect(stats.queriesAnswered).toBe(0)
      expect(stats.queriesNotFound).toBe(0)
      expect(stats.comparisonsPerformed).toBe(0)
      expect(stats.searchesPerformed).toBe(0)
    })

    it('updates document stats on load', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      const stats = expert.getStats()
      expect(stats.documentsLoaded).toBe(1)
      expect(stats.totalWords).toBeGreaterThan(0)
    })

    it('reflects document removal', () => {
      const id = expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expert.removeDocument(id)
      expect(expert.getStats().documentsLoaded).toBe(0)
    })
  })

  // ── Clear ──

  describe('clear', () => {
    it('removes all documents and resets stats', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expert.loadDocument(API_DOC, 'api.md')
      expert.ask('How do I install TypeScript?')
      expert.searchDocuments('function')

      expert.clear()

      expect(expert.documentCount).toBe(0)
      const stats = expert.getStats()
      expect(stats.documentsLoaded).toBe(0)
      expect(stats.queriesAnswered).toBe(0)
      expect(stats.searchesPerformed).toBe(0)
    })

    it('resets document ID counter', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expert.clear()
      const id = expert.loadDocument(API_DOC, 'api.md')
      expect(id).toBe('doc-1')
    })
  })

  // ── Edge Cases ──

  describe('edge cases', () => {
    it('handles very short documents', () => {
      const id = expert.loadDocument(SHORT_DOC, 'security.md')
      expect(id).toBeTruthy()
      const result = expert.ask('How to prevent SQL injection?')
      expect(result.found).toBe(true)
    })

    it('handles documents with special characters', () => {
      const content = `# Special Characters Guide\n\nUse & for "and" and <> for HTML tags.\nBackslashes \\ are escape characters.`
      const id = expert.loadDocument(content, 'special.md')
      expect(id).toBeTruthy()
    })

    it('truncates very long documents', () => {
      const longContent = 'word '.repeat(200_000)
      const e = new PdfExpert({ maxContentLength: 1000 })
      const id = e.loadDocument(longContent, 'long.md')
      const doc = e.getDocument(id)
      expect(doc!.content.length).toBeLessThanOrEqual(1000)
    })

    it('confidence is between 0 and 1', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      const result = expert.ask('What is TypeScript?')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('handles multiple questions sequentially', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expert.loadDocument(API_DOC, 'api.md')

      const r1 = expert.ask('What is TypeScript?')
      const r2 = expert.ask('How does login work?')
      const r3 = expert.ask('What is dark matter?')

      expect(r1.found).toBe(true)
      expect(r2.found).toBe(true)
      expect(r3.found).toBe(false)
    })

    it('handles document with only a title', () => {
      const id = expert.loadDocument('# Just a Title\n\nSingle paragraph content here.', 'minimal.md')
      expect(id).toBeTruthy()
    })
  })

  // ── Integration with multiple documents ──

  describe('multi-document workflows', () => {
    it('load, ask, compare, search full workflow', () => {
      const id1 = expert.loadDocument(TYPESCRIPT_DOC, 'typescript.md')
      const id2 = expert.loadDocument(API_DOC, 'api.md')
      const id3 = expert.loadDocument(PYTHON_DOC, 'python.md')

      // Ask questions
      const answer = expert.ask('What functions are available?')
      expect(answer.found).toBe(true)

      // Search
      const searchResults = expert.searchDocuments('install')
      expect(searchResults.length).toBeGreaterThan(0)

      // Compare
      const comparison = expert.compare([id1, id2, id3])
      expect(comparison.documentIds).toHaveLength(3)
      expect(comparison.summary).toBeTruthy()

      // Stats should reflect all operations
      const stats = expert.getStats()
      expect(stats.documentsLoaded).toBe(3)
      expect(stats.queriesAnswered).toBeGreaterThanOrEqual(1)
      expect(stats.searchesPerformed).toBe(1)
      expect(stats.comparisonsPerformed).toBe(1)
    })

    it('add and remove documents dynamically', () => {
      const id1 = expert.loadDocument(TYPESCRIPT_DOC, 'ts.md')
      expect(expert.documentCount).toBe(1)

      const id2 = expert.loadDocument(API_DOC, 'api.md')
      expect(expert.documentCount).toBe(2)

      expert.removeDocument(id1)
      expect(expert.documentCount).toBe(1)

      // Should only find answers in remaining doc
      const result = expert.ask('What error codes are returned?')
      expect(result.found).toBe(true)
      expect(result.citations.every(c => c.documentId === id2)).toBe(true)
    })

    it('answer cites correct document for TypeScript questions', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript-guide.md')
      expert.loadDocument(PYTHON_DOC, 'python-handbook.md')

      const result = expert.ask('How do I define interfaces?')
      expect(result.found).toBe(true)
      // Should cite TypeScript doc, not Python doc
      expect(result.citations.some(c => c.documentName === 'typescript-guide.md')).toBe(true)
    })

    it('answer cites correct document for Python questions', () => {
      expert.loadDocument(TYPESCRIPT_DOC, 'typescript-guide.md')
      expert.loadDocument(PYTHON_DOC, 'python-handbook.md')

      const result = expert.ask('How does Pandas DataFrame work?')
      expect(result.found).toBe(true)
      expect(result.citations.some(c => c.documentName === 'python-handbook.md')).toBe(true)
    })
  })

  // ── Relevance threshold ──

  describe('relevance threshold', () => {
    it('higher threshold filters out weaker matches', () => {
      const strictExpert = new PdfExpert({ relevanceThreshold: 0.8 })
      strictExpert.loadDocument(TYPESCRIPT_DOC, 'ts.md')

      // Vague question should return not covered with strict threshold
      const result = strictExpert.ask('What is code?')
      // With strict threshold, weak matches should be filtered
      if (result.found) {
        expect(result.citations.every(c => c.relevance >= 0.8)).toBe(true)
      }
    })

    it('lower threshold includes more matches', () => {
      const looseExpert = new PdfExpert({ relevanceThreshold: 0.01 })
      looseExpert.loadDocument(TYPESCRIPT_DOC, 'ts.md')

      const result = looseExpert.ask('What types exist?')
      expect(result.found).toBe(true)
      expect(result.citations.length).toBeGreaterThan(0)
    })
  })
})
