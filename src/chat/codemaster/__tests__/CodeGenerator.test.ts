import { describe, it, expect } from 'vitest'
import { CodeGenerator } from '../CodeGenerator.js'
import type { GenerateRequest, GenerateResult, GenerationKind } from '../CodeGenerator.js'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function req(overrides: Partial<GenerateRequest> & Pick<GenerateRequest, 'description' | 'kind' | 'language'>): GenerateRequest {
  return overrides
}

function lines(result: GenerateResult): string[] {
  return result.code.split('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CodeGenerator', () => {
  const gen = new CodeGenerator()

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. generate() — dispatch
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generate()', () => {
    it('should dispatch to generateFunction for kind "function"', () => {
      const result = gen.generate(req({ description: 'add two numbers', kind: 'function', language: 'typescript' }))
      expect(result.kind).toBe('function')
      expect(result.code).toContain('export function')
    })

    it('should dispatch to generateClass for kind "class"', () => {
      const result = gen.generate(req({ description: 'user manager', kind: 'class', language: 'typescript' }))
      expect(result.kind).toBe('class')
      expect(result.code).toContain('export class')
    })

    it('should dispatch to generateInterface for kind "interface"', () => {
      const result = gen.generate(req({ description: 'user profile', kind: 'interface', language: 'typescript' }))
      expect(result.kind).toBe('interface')
      expect(result.code).toContain('export interface')
    })

    it('should dispatch to generateTest for kind "test"', () => {
      const result = gen.generate(req({ description: 'test add', kind: 'test', language: 'typescript' }))
      expect(result.kind).toBe('test')
      expect(result.code).toContain('describe')
    })

    it('should dispatch to generateErrorHandler for kind "error-handler"', () => {
      const result = gen.generate(req({ description: 'handle errors', kind: 'error-handler', language: 'typescript' }))
      expect(result.kind).toBe('error-handler')
      expect(result.code).toContain('AppError')
    })

    it('should dispatch to generateApiEndpoint for kind "api-endpoint"', () => {
      const result = gen.generate(req({ description: 'get users', kind: 'api-endpoint', language: 'typescript' }))
      expect(result.kind).toBe('api-endpoint')
      expect(result.code).toContain('IncomingMessage')
    })

    it('should dispatch to generateDataModel for kind "data-model"', () => {
      const result = gen.generate(req({ description: 'user model', kind: 'data-model', language: 'typescript' }))
      expect(result.kind).toBe('data-model')
      expect(result.code).toContain('interface')
    })

    it('should dispatch to generateUtility for kind "utility"', () => {
      const result = gen.generate(req({ description: 'format date', kind: 'utility', language: 'typescript' }))
      // utility delegates to generateFunction
      expect(result.kind).toBe('function')
      expect(result.code).toContain('export function')
    })

    it('should fall back to generateFunction for an unknown kind', () => {
      const result = gen.generate(req({ description: 'do stuff', kind: 'unknown-thing' as GenerationKind, language: 'typescript' }))
      expect(result.kind).toBe('function')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. generateFunction()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateFunction()', () => {
    // --- TypeScript ---
    it('should generate a TypeScript function with docs by default', () => {
      const r = gen.generateFunction(req({ description: 'validate email', kind: 'function', language: 'typescript' }))
      expect(r.code).toContain('/**')
      expect(r.code).toContain('export function validateEmail')
      expect(r.language).toBe('typescript')
      expect(r.kind).toBe('function')
    })

    it('should include error handling by default', () => {
      const r = gen.generateFunction(req({ description: 'parse json', kind: 'function', language: 'typescript' }))
      expect(r.code).toContain('try {')
      expect(r.code).toContain('catch (error)')
    })

    it('should omit docs when includeDocs is false', () => {
      const r = gen.generateFunction(req({ description: 'parse json', kind: 'function', language: 'typescript', includeDocs: false }))
      expect(r.code).not.toContain('/**')
    })

    it('should omit error handling when includeErrorHandling is false', () => {
      const r = gen.generateFunction(req({
        description: 'parse json', kind: 'function', language: 'typescript', includeErrorHandling: false,
      }))
      expect(r.code).not.toContain('try {')
    })

    it('should extract param hints from description', () => {
      const r = gen.generateFunction(req({
        description: 'accepts a string', kind: 'function', language: 'typescript',
      }))
      expect(r.code).toContain('string: string')
    })

    it('should extract return type from description', () => {
      const r = gen.generateFunction(req({
        description: 'returns a number', kind: 'function', language: 'typescript',
      }))
      expect(r.code).toContain(': number')
    })

    it('should use custom name when provided', () => {
      const r = gen.generateFunction(req({
        description: 'does something', kind: 'function', language: 'typescript', name: 'customFunc',
      }))
      expect(r.code).toContain('export function customFunc')
    })

    it('should include lineCount in the result', () => {
      const r = gen.generateFunction(req({ description: 'simple', kind: 'function', language: 'typescript' }))
      expect(r.lineCount).toBe(r.code.split('\n').length)
    })

    it('should include suggestions', () => {
      const r = gen.generateFunction(req({ description: 'my func', kind: 'function', language: 'typescript' }))
      expect(r.suggestions.length).toBeGreaterThan(0)
      expect(r.suggestions.some(s => s.includes('tests'))).toBe(true)
    })

    it('should generate description with function name', () => {
      const r = gen.generateFunction(req({ description: 'format date', kind: 'function', language: 'typescript' }))
      expect(r.description).toContain('formatDate')
    })

    // --- JavaScript ---
    it('should generate a JavaScript function without type annotations', () => {
      const r = gen.generateFunction(req({
        description: 'accepts a count', kind: 'function', language: 'javascript',
      }))
      expect(r.code).toContain('export function')
      // JS params should not have TS type annotations
      expect(r.code).toMatch(/function \w+\(count\)/)
    })

    it('should not add return type annotation for JavaScript', () => {
      const r = gen.generateFunction(req({
        description: 'returns a number', kind: 'function', language: 'javascript',
      }))
      // Should not have `: number` after the closing paren of params
      expect(r.code).not.toMatch(/\)\s*:\s*number/)
    })

    // --- Python ---
    it('should generate a Python function', () => {
      const r = gen.generateFunction(req({ description: 'validate email', kind: 'function', language: 'python' }))
      expect(r.code).toContain('def validateEmail')
      expect(r.language).toBe('python')
    })

    it('should generate a Python function with docstring', () => {
      const r = gen.generateFunction(req({ description: 'validate email', kind: 'function', language: 'python' }))
      expect(r.code).toContain('"""validate email"""')
    })

    it('should generate Python error handling', () => {
      const r = gen.generateFunction(req({ description: 'do work', kind: 'function', language: 'python' }))
      expect(r.code).toContain('try:')
      expect(r.code).toContain('except Exception as e:')
    })

    // --- Go ---
    it('should generate a Go function with capitalized name', () => {
      const r = gen.generateFunction(req({ description: 'fetch data', kind: 'function', language: 'go' }))
      expect(r.code).toContain('func FetchData')
      expect(r.language).toBe('go')
    })

    it('should include Go doc comment', () => {
      const r = gen.generateFunction(req({ description: 'fetch data', kind: 'function', language: 'go' }))
      expect(r.code).toContain('// FetchData')
    })

    it('should include Go error return when error handling enabled', () => {
      const r = gen.generateFunction(req({ description: 'fetch data', kind: 'function', language: 'go' }))
      expect(r.code).toContain('error)')
      expect(r.code).toContain('fmt.Errorf')
    })

    it('should use panic in Go when error handling is disabled', () => {
      const r = gen.generateFunction(req({ description: 'fetch data', kind: 'function', language: 'go', includeErrorHandling: false }))
      expect(r.code).toContain('panic("not implemented")')
    })

    // --- Rust ---
    it('should generate a Rust function', () => {
      const r = gen.generateFunction(req({ description: 'process data', kind: 'function', language: 'rust' }))
      expect(r.code).toContain('pub fn')
      expect(r.language).toBe('rust')
    })

    it('should generate Rust doc comment', () => {
      const r = gen.generateFunction(req({ description: 'process data', kind: 'function', language: 'rust' }))
      expect(r.code).toContain('/// process data')
    })

    it('should generate Rust Result return type with error handling', () => {
      const r = gen.generateFunction(req({ description: 'process data', kind: 'function', language: 'rust' }))
      expect(r.code).toContain('Result<String, Box<dyn std::error::Error>>')
    })

    it('should use todo!() in Rust without error handling', () => {
      const r = gen.generateFunction(req({ description: 'process data', kind: 'function', language: 'rust', includeErrorHandling: false }))
      expect(r.code).toContain('todo!()')
    })

    it('should generate Rust params as &str', () => {
      const r = gen.generateFunction(req({ description: 'takes a name', kind: 'function', language: 'rust' }))
      expect(r.code).toContain('name: &str')
    })

    // --- Defaults / edge cases ---
    it('should default to TypeScript for unsupported language', () => {
      const r = gen.generateFunction(req({ description: 'do something', kind: 'function', language: 'java' }))
      expect(r.code).toContain('export function')
    })

    it('should derive a camelCase name from description', () => {
      const r = gen.generateFunction(req({ description: 'calculate total price', kind: 'function', language: 'typescript' }))
      expect(r.code).toContain('calculateTotalPrice')
    })

    it('should fallback to myFunction for empty-ish descriptions', () => {
      const r = gen.generateFunction(req({ description: '!!!', kind: 'function', language: 'typescript' }))
      expect(r.code).toContain('myFunction')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. generateClass()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateClass()', () => {
    it('should generate a TypeScript class with docs', () => {
      const r = gen.generateClass(req({ description: 'user manager', kind: 'class', language: 'typescript' }))
      expect(r.code).toContain('export class UserManager')
      expect(r.code).toContain('/**')
    })

    it('should include constructor, init, getStatus, reset methods', () => {
      const r = gen.generateClass(req({ description: 'task runner', kind: 'class', language: 'typescript' }))
      expect(r.code).toContain('constructor()')
      expect(r.code).toContain('init(): void')
      expect(r.code).toContain('getStatus()')
      expect(r.code).toContain('reset(): void')
    })

    it('should use custom name', () => {
      const r = gen.generateClass(req({ description: 'a thing', kind: 'class', language: 'typescript', name: 'MyCustomClass' }))
      expect(r.code).toContain('export class MyCustomClass')
    })

    it('should include suggestions for tests and interface', () => {
      const r = gen.generateClass(req({ description: 'worker', kind: 'class', language: 'typescript' }))
      expect(r.suggestions.some(s => s.includes('tests'))).toBe(true)
      expect(r.suggestions.some(s => s.includes('interface'))).toBe(true)
    })

    it('should generate a Python class', () => {
      const r = gen.generateClass(req({ description: 'data processor', kind: 'class', language: 'python' }))
      expect(r.code).toContain('class DataProcessor:')
      expect(r.language).toBe('python')
    })

    it('should include Python __init__, init, get_status, reset', () => {
      const r = gen.generateClass(req({ description: 'data processor', kind: 'class', language: 'python' }))
      expect(r.code).toContain('def __init__(self)')
      expect(r.code).toContain('def init(self)')
      expect(r.code).toContain('def get_status(self)')
      expect(r.code).toContain('def reset(self)')
    })

    it('should include Python docstring when docs enabled', () => {
      const r = gen.generateClass(req({ description: 'data processor', kind: 'class', language: 'python', includeDocs: true }))
      expect(r.code).toContain('"""data processor"""')
    })

    it('should default to TypeScript for unsupported language', () => {
      const r = gen.generateClass(req({ description: 'helper', kind: 'class', language: 'go' }))
      expect(r.code).toContain('export class')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. generateInterface()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateInterface()', () => {
    // --- from description ---
    it('should generate user-related fields when description mentions "user"', () => {
      const r = gen.generateInterface(req({ description: 'user profile', kind: 'interface', language: 'typescript' }))
      expect(r.code).toContain('id: string')
      expect(r.code).toContain('name: string')
      expect(r.code).toContain('email: string')
    })

    it('should generate timestamp fields when description mentions "timestamp"', () => {
      const r = gen.generateInterface(req({ description: 'event with timestamp', kind: 'interface', language: 'typescript' }))
      expect(r.code).toContain('createdAt: string')
      expect(r.code).toContain('updatedAt: string | undefined')
    })

    it('should generate a status field when description mentions "status"', () => {
      const r = gen.generateInterface(req({ description: 'task status tracker', kind: 'interface', language: 'typescript' }))
      expect(r.code).toContain('status: string')
    })

    it('should fallback to id field when no keywords match', () => {
      const r = gen.generateInterface(req({ description: 'some random thing', kind: 'interface', language: 'typescript' }))
      expect(r.code).toContain('id: string')
    })

    it('should generate Python TypedDict from description', () => {
      const r = gen.generateInterface(req({ description: 'user data', kind: 'interface', language: 'python' }))
      expect(r.code).toContain('class UserData(TypedDict)')
      expect(r.code).toContain('id: str')
    })

    // --- from context ---
    it('should extract properties from an object literal context', () => {
      const context = '{ name: "Alice", age: 30, active: true }'
      const r = gen.generateInterface(req({
        description: 'user', kind: 'interface', language: 'typescript', context,
      }))
      expect(r.code).toContain('name: string')
      expect(r.code).toContain('age: number')
      expect(r.code).toContain('active: boolean')
    })

    it('should generate Python TypedDict from context', () => {
      const context = '{ name: "Alice", count: 5 }'
      const r = gen.generateInterface(req({
        description: 'user', kind: 'interface', language: 'python', context,
      }))
      expect(r.code).toContain('(TypedDict)')
      expect(r.code).toContain('name: str')
      expect(r.code).toContain('count: int')
    })

    it('should generate empty interface with TODO when context has no extractable props', () => {
      const r = gen.generateInterface(req({
        description: 'empty', kind: 'interface', language: 'typescript', context: '()',
      }))
      expect(r.code).toContain('TODO: Add properties')
    })

    it('should produce correct result metadata', () => {
      const r = gen.generateInterface(req({ description: 'widget config', kind: 'interface', language: 'typescript' }))
      expect(r.kind).toBe('interface')
      expect(r.description).toContain('WidgetConfig')
      expect(r.suggestions.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. generateTest()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateTest()', () => {
    it('should generate TypeScript test with vitest imports', () => {
      const r = gen.generateTest(req({ description: 'test utils', kind: 'test', language: 'typescript' }))
      expect(r.code).toContain("import { describe, it, expect } from 'vitest'")
      expect(r.requiredImports).toContain("import { describe, it, expect } from 'vitest'")
    })

    it('should extract function names from context and create describe blocks', () => {
      const context = 'export function add(a: number, b: number) { return a + b }\nexport function subtract(a: number, b: number) { return a - b }'
      const r = gen.generateTest(req({ description: 'test math', kind: 'test', language: 'typescript', context }))
      expect(r.code).toContain("describe('add'")
      expect(r.code).toContain("describe('subtract'")
    })

    it('should extract class names from context', () => {
      const context = 'export class Calculator { compute() {} }'
      const r = gen.generateTest(req({ description: 'test calc', kind: 'test', language: 'typescript', context }))
      expect(r.code).toContain("describe('Calculator'")
    })

    it('should generate generic tests when no context is provided', () => {
      const r = gen.generateTest(req({ description: 'test something', kind: 'test', language: 'typescript' }))
      expect(r.code).toContain('should work correctly')
      expect(r.code).toContain('should handle errors')
    })

    it('should use the name from context as top-level describe', () => {
      const context = 'function myHelper() {}'
      const r = gen.generateTest(req({ description: 'test helper', kind: 'test', language: 'typescript', context }))
      // Top-level describe uses first extracted name
      expect(lines(r)[2]).toContain("describe('myHelper'")
    })

    it('should fall back to provided name when no context given', () => {
      const r = gen.generateTest(req({ description: 'test it', kind: 'test', language: 'typescript', name: 'utils' }))
      expect(r.description).toContain('utils')
    })

    it('should generate Python test with pytest import', () => {
      const r = gen.generateTest(req({ description: 'test validation', kind: 'test', language: 'python' }))
      expect(r.code).toContain('import pytest')
      expect(r.code).toContain('class Test')
      expect(r.requiredImports).toContain('import pytest')
    })

    it('should include suggestions for edge and error cases', () => {
      const r = gen.generateTest(req({ description: 'test', kind: 'test', language: 'typescript' }))
      expect(r.suggestions).toContain('Add edge case tests')
      expect(r.suggestions).toContain('Add error case tests')
    })

    it('should capitalize Python test class name', () => {
      const r = gen.generateTest(req({ description: 'test things', kind: 'test', language: 'python', name: 'parser' }))
      expect(r.code).toContain('class TestParser:')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. generateErrorHandler()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateErrorHandler()', () => {
    it('should generate TypeScript AppError class', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors gracefully', kind: 'error-handler', language: 'typescript' }))
      expect(r.code).toContain('export class AppError extends Error')
      expect(r.code).toContain("this.name = 'AppError'")
    })

    it('should generate TypeScript handler function with correct name', () => {
      const r = gen.generateErrorHandler(req({
        description: 'handle errors', kind: 'error-handler', language: 'typescript', name: 'onError',
      }))
      expect(r.code).toContain('export function onError')
    })

    it('should handle AppError, Error, and unknown in TypeScript', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors', kind: 'error-handler', language: 'typescript' }))
      expect(r.code).toContain('error instanceof AppError')
      expect(r.code).toContain('error instanceof Error')
      expect(r.code).toContain('String(error)')
    })

    it('should default handler name to handleError', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors', kind: 'error-handler', language: 'typescript' }))
      expect(r.code).toContain('export function handleError')
    })

    it('should generate Python error handler', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors', kind: 'error-handler', language: 'python' }))
      expect(r.code).toContain('class AppError(Exception):')
      expect(r.code).toContain('isinstance(error, AppError)')
    })

    it('should use custom name for Python handler', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors', kind: 'error-handler', language: 'python', name: 'on_error' }))
      expect(r.code).toContain('def on_error(')
    })

    it('should return correct result metadata', () => {
      const r = gen.generateErrorHandler(req({ description: 'handle errors', kind: 'error-handler', language: 'typescript' }))
      expect(r.kind).toBe('error-handler')
      expect(r.description).toContain('handleError')
      expect(r.suggestions.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. generateApiEndpoint()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateApiEndpoint()', () => {
    it('should generate TypeScript HTTP endpoint with IncomingMessage/ServerResponse', () => {
      const r = gen.generateApiEndpoint(req({ description: 'create user', kind: 'api-endpoint', language: 'typescript' }))
      expect(r.code).toContain("import type { IncomingMessage, ServerResponse } from 'http'")
      expect(r.code).toContain('async function')
    })

    it('should include parseBody helper in TypeScript', () => {
      const r = gen.generateApiEndpoint(req({ description: 'fetch items', kind: 'api-endpoint', language: 'typescript' }))
      expect(r.code).toContain('function parseBody')
    })

    it('should use custom endpoint name', () => {
      const r = gen.generateApiEndpoint(req({
        description: 'get users', kind: 'api-endpoint', language: 'typescript', name: 'listUsers',
      }))
      expect(r.code).toContain('async function listUsers')
    })

    it('should generate Python FastAPI endpoint', () => {
      const r = gen.generateApiEndpoint(req({ description: 'create user', kind: 'api-endpoint', language: 'python' }))
      expect(r.code).toContain('from fastapi import APIRouter, HTTPException')
      expect(r.code).toContain('router = APIRouter()')
      expect(r.code).toContain('@router.post')
    })

    it('should generate Python Request/Response models from description', () => {
      const r = gen.generateApiEndpoint(req({ description: 'create user', kind: 'api-endpoint', language: 'python' }))
      expect(r.code).toContain('Request(BaseModel)')
      expect(r.code).toContain('Response(BaseModel)')
    })

    it('should include error handling in TypeScript endpoint', () => {
      const r = gen.generateApiEndpoint(req({ description: 'do stuff', kind: 'api-endpoint', language: 'typescript' }))
      expect(r.code).toContain('catch (error)')
      expect(r.code).toContain('res.writeHead(500')
    })

    it('should include error handling in Python endpoint', () => {
      const r = gen.generateApiEndpoint(req({ description: 'do stuff', kind: 'api-endpoint', language: 'python' }))
      expect(r.code).toContain('except Exception as e:')
      expect(r.code).toContain('HTTPException')
    })

    it('should return correct result metadata', () => {
      const r = gen.generateApiEndpoint(req({ description: 'get stuff', kind: 'api-endpoint', language: 'typescript' }))
      expect(r.kind).toBe('api-endpoint')
      expect(r.suggestions).toContain('Add input validation')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. generateDataModel()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateDataModel()', () => {
    it('should generate TypeScript interface with id, createdAt, updatedAt', () => {
      const r = gen.generateDataModel(req({ description: 'product model', kind: 'data-model', language: 'typescript' }))
      expect(r.code).toContain('export interface ProductModel')
      expect(r.code).toContain('id: string')
      expect(r.code).toContain('createdAt: string')
      expect(r.code).toContain('updatedAt?: string')
    })

    it('should include createModel factory function', () => {
      const r = gen.generateDataModel(req({ description: 'order', kind: 'data-model', language: 'typescript', name: 'Order' }))
      expect(r.code).toContain('export function createOrder')
      expect(r.code).toContain('crypto.randomUUID()')
    })

    it('should include validateModel function', () => {
      const r = gen.generateDataModel(req({ description: 'order', kind: 'data-model', language: 'typescript', name: 'Order' }))
      expect(r.code).toContain('export function validateOrder')
      expect(r.code).toContain('data is Order')
    })

    it('should generate Python dataclass', () => {
      const r = gen.generateDataModel(req({ description: 'product model', kind: 'data-model', language: 'python' }))
      expect(r.code).toContain('from dataclasses import dataclass')
      expect(r.code).toContain('@dataclass')
      expect(r.code).toContain('class ProductModel:')
    })

    it('should include Python to_dict and from_dict methods', () => {
      const r = gen.generateDataModel(req({ description: 'item', kind: 'data-model', language: 'python', name: 'Item' }))
      expect(r.code).toContain('def to_dict(self)')
      expect(r.code).toContain('def from_dict(cls')
    })

    it('should use custom name for the model', () => {
      const r = gen.generateDataModel(req({ description: 'custom', kind: 'data-model', language: 'typescript', name: 'Widget' }))
      expect(r.code).toContain('interface Widget')
      expect(r.code).toContain('createWidget')
      expect(r.code).toContain('validateWidget')
    })

    it('should return correct metadata', () => {
      const r = gen.generateDataModel(req({ description: 'order', kind: 'data-model', language: 'typescript', name: 'Order' }))
      expect(r.kind).toBe('data-model')
      expect(r.description).toContain('Order')
      expect(r.suggestions).toContain('Add domain-specific fields')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. generateUtility()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateUtility()', () => {
    it('should delegate to generateFunction', () => {
      const r = gen.generateUtility(req({ description: 'format date', kind: 'utility', language: 'typescript' }))
      expect(r.kind).toBe('function')
      expect(r.code).toContain('export function')
    })

    it('should force docs to true', () => {
      const r = gen.generateUtility(req({ description: 'format date', kind: 'utility', language: 'typescript', includeDocs: false }))
      expect(r.code).toContain('/**')
    })

    it('should force error handling to true', () => {
      const r = gen.generateUtility(req({ description: 'format date', kind: 'utility', language: 'typescript', includeErrorHandling: false }))
      expect(r.code).toContain('try {')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. getAvailableKinds()
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAvailableKinds()', () => {
    it('should return all 8 generation kinds', () => {
      const kinds = gen.getAvailableKinds()
      expect(kinds).toHaveLength(8)
    })

    it('should include every expected kind', () => {
      const kinds = gen.getAvailableKinds()
      const expected: GenerationKind[] = [
        'function', 'class', 'interface', 'test',
        'error-handler', 'api-endpoint', 'data-model', 'utility',
      ]
      for (const k of expected) {
        expect(kinds).toContain(k)
      }
    })

    it('should return the kinds in the documented order', () => {
      const kinds = gen.getAvailableKinds()
      expect(kinds).toEqual([
        'function', 'class', 'interface', 'test',
        'error-handler', 'api-endpoint', 'data-model', 'utility',
      ])
    })
  })
})
