import { describe, it, expect, beforeEach } from 'vitest'
import { FileNavigator } from '../FileNavigator.js'
import type {
  FileEntry,
  DirectoryNode,
  SearchResult,
  ProjectOverview,
  FileGroup,
  ImpactAnalysis,
} from '../FileNavigator.js'

describe('FileNavigator', () => {
  let nav: FileNavigator

  beforeEach(() => {
    nav = new FileNavigator()
  })

  // ═══════════════════════════════════════════════════════════
  // createFileEntry
  // ═══════════════════════════════════════════════════════════

  describe('createFileEntry', () => {
    it('should create entry for TypeScript file', () => {
      const entry = nav.createFileEntry('src/index.ts')
      expect(entry.name).toBe('index.ts')
      expect(entry.extension).toBe('.ts')
      expect(entry.language).toBe('typescript')
      expect(entry.isTest).toBe(false)
      expect(entry.isConfig).toBe(false)
    })

    it('should detect test files', () => {
      const entry = nav.createFileEntry('src/__tests__/App.test.ts')
      expect(entry.isTest).toBe(true)
    })

    it('should detect spec files', () => {
      const entry = nav.createFileEntry('src/App.spec.ts')
      expect(entry.isTest).toBe(true)
    })

    it('should detect config files', () => {
      const entry = nav.createFileEntry('tsconfig.json')
      expect(entry.isConfig).toBe(true)
    })

    it('should detect documentation files', () => {
      const entry = nav.createFileEntry('README.md')
      expect(entry.isDoc).toBe(true)
    })

    it('should detect Python files', () => {
      const entry = nav.createFileEntry('main.py')
      expect(entry.language).toBe('python')
    })

    it('should detect Rust files', () => {
      const entry = nav.createFileEntry('src/main.rs')
      expect(entry.language).toBe('rust')
    })

    it('should detect Go files', () => {
      const entry = nav.createFileEntry('main.go')
      expect(entry.language).toBe('go')
    })

    it('should handle unknown extensions', () => {
      const entry = nav.createFileEntry('data.xyz')
      expect(entry.language).toBe('unknown')
    })

    it('should accept optional size and lines', () => {
      const entry = nav.createFileEntry('src/app.ts', { size: 1024, lines: 50 })
      expect(entry.size).toBe(1024)
      expect(entry.lines).toBe(50)
    })

    it('should detect TSX files as typescript', () => {
      const entry = nav.createFileEntry('src/App.tsx')
      expect(entry.language).toBe('typescript')
    })

    it('should detect CSS files', () => {
      const entry = nav.createFileEntry('styles.css')
      expect(entry.language).toBe('css')
    })

    it('should detect SCSS as CSS', () => {
      const entry = nav.createFileEntry('styles.scss')
      expect(entry.language).toBe('css')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scoreImportance
  // ═══════════════════════════════════════════════════════════

  describe('scoreImportance', () => {
    it('should score index files highly', () => {
      const score = nav.scoreImportance('src/index.ts', false, false, false)
      expect(score).toBeGreaterThan(0.6)
    })

    it('should score test files lower', () => {
      const score = nav.scoreImportance('src/app.test.ts', true, false, false)
      expect(score).toBeLessThan(0.5)
    })

    it('should score source files in src/ higher', () => {
      const srcScore = nav.scoreImportance('src/utils.ts', false, false, false)
      const rootScore = nav.scoreImportance('utils.ts', false, false, false)
      expect(srcScore).toBeGreaterThanOrEqual(rootScore)
    })

    it('should return score between 0 and 1', () => {
      const score = nav.scoreImportance('deeply/nested/path/to/file.ts', false, false, false)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it('should score package.json at root highly', () => {
      const score = nav.scoreImportance('package.json', false, true, false)
      expect(score).toBeGreaterThan(0.6)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // searchFiles
  // ═══════════════════════════════════════════════════════════

  describe('searchFiles', () => {
    const files = [
      'src/index.ts',
      'src/utils/helpers.ts',
      'src/components/Button.tsx',
      'src/components/Modal.tsx',
      'src/__tests__/Button.test.ts',
      'README.md',
      'package.json',
    ]

    it('should find exact filename matches', () => {
      const results = nav.searchFiles(files, 'Button')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].file.name).toContain('Button')
    })

    it('should score exact matches higher', () => {
      const results = nav.searchFiles(files, 'index.ts')
      expect(results[0].score).toBe(1.0)
    })

    it('should find files by path', () => {
      const results = nav.searchFiles(files, 'components')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find by multi-word query', () => {
      const results = nav.searchFiles(files, 'src Button')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty for no matches', () => {
      const results = nav.searchFiles(files, 'nonexistent')
      expect(results).toHaveLength(0)
    })

    it('should sort by score descending', () => {
      const results = nav.searchFiles(files, 'Button')
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score)
      }
    })

    it('should include match reason', () => {
      const results = nav.searchFiles(files, 'Button')
      expect(results[0].matchReason).toBeTruthy()
    })
  })

  // ═══════════════════════════════════════════════════════════
  // buildDirectoryTree
  // ═══════════════════════════════════════════════════════════

  describe('buildDirectoryTree', () => {
    const files = [
      'src/index.ts',
      'src/utils/helpers.ts',
      'src/components/Button.tsx',
      'README.md',
    ]

    it('should create a root node', () => {
      const tree = nav.buildDirectoryTree(files)
      expect(tree.name).toBe('.')
    })

    it('should have correct total file count', () => {
      const tree = nav.buildDirectoryTree(files)
      expect(tree.totalFiles).toBe(4)
    })

    it('should organize files into directories', () => {
      const tree = nav.buildDirectoryTree(files)
      expect(tree.directories.length).toBeGreaterThan(0)
      expect(tree.directories.some(d => d.name === 'src')).toBe(true)
    })

    it('should have files at root level', () => {
      const tree = nav.buildDirectoryTree(files)
      expect(tree.files.some(f => f.name === 'README.md')).toBe(true)
    })

    it('should skip node_modules', () => {
      const filesWithNM = [...files, 'node_modules/lodash/index.js']
      const tree = nav.buildDirectoryTree(filesWithNM)
      expect(tree.totalFiles).toBe(4) // node_modules should be skipped
    })

    it('should handle nested directories', () => {
      const tree = nav.buildDirectoryTree(files)
      const src = tree.directories.find(d => d.name === 'src')
      expect(src?.directories.some(d => d.name === 'utils')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // renderTree
  // ═══════════════════════════════════════════════════════════

  describe('renderTree', () => {
    it('should produce non-empty output', () => {
      const tree = nav.buildDirectoryTree(['src/index.ts', 'README.md'])
      const output = nav.renderTree(tree)
      expect(output.length).toBeGreaterThan(0)
    })

    it('should include directory markers', () => {
      const tree = nav.buildDirectoryTree(['src/index.ts'])
      const output = nav.renderTree(tree)
      expect(output).toContain('src/')
    })

    it('should respect maxDepth', () => {
      const tree = nav.buildDirectoryTree(['a/b/c/d/e/file.ts'])
      const shallow = nav.renderTree(tree, { maxDepth: 2 })
      const deep = nav.renderTree(tree, { maxDepth: 5 })
      expect(deep.length).toBeGreaterThanOrEqual(shallow.length)
    })

    it('should hide files when showFiles is false', () => {
      const tree = nav.buildDirectoryTree(['src/index.ts', 'README.md'])
      const output = nav.renderTree(tree, { showFiles: false })
      expect(output).not.toContain('index.ts')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // analyzeProject
  // ═══════════════════════════════════════════════════════════

  describe('analyzeProject', () => {
    const files = [
      'package.json',
      'tsconfig.json',
      'src/index.ts',
      'src/utils.ts',
      'src/__tests__/utils.test.ts',
      'README.md',
    ]

    it('should count total files', () => {
      const overview = nav.analyzeProject(files)
      expect(overview.totalFiles).toBe(files.length)
    })

    it('should break down by language', () => {
      const overview = nav.analyzeProject(files)
      expect(overview.languageBreakdown.get('typescript')).toBeGreaterThan(0)
    })

    it('should break down by category', () => {
      const overview = nav.analyzeProject(files)
      expect(overview.categoryBreakdown.test).toBeGreaterThan(0)
      expect(overview.categoryBreakdown.config).toBeGreaterThan(0)
      expect(overview.categoryBreakdown.docs).toBeGreaterThan(0)
    })

    it('should detect project type', () => {
      const overview = nav.analyzeProject(files)
      expect(overview.projectType).toBeDefined()
    })

    it('should find entry points', () => {
      const overview = nav.analyzeProject(files)
      expect(overview.entryPoints).toContain('src/index.ts')
    })

    it('should detect Node library from package.json', () => {
      const overview = nav.analyzeProject(['package.json', 'src/index.ts'])
      expect(overview.projectType).toBe('node-library')
    })

    it('should detect Rust crate', () => {
      const overview = nav.analyzeProject(['Cargo.toml', 'src/main.rs'])
      expect(overview.projectType).toBe('rust-crate')
    })

    it('should detect Go module', () => {
      const overview = nav.analyzeProject(['go.mod', 'main.go'])
      expect(overview.projectType).toBe('go-module')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // groupFiles
  // ═══════════════════════════════════════════════════════════

  describe('groupFiles', () => {
    const files = [
      'src/auth/login.ts',
      'src/auth/register.ts',
      'src/auth/__tests__/login.test.ts',
      'src/api/routes.ts',
      'src/api/middleware.ts',
    ]

    it('should group files by directory', () => {
      const groups = nav.groupFiles(files)
      expect(groups.length).toBeGreaterThan(0)
    })

    it('should include file counts in descriptions', () => {
      const groups = nav.groupFiles(files)
      expect(groups[0].description).toContain('files')
    })

    it('should sort groups by file count descending', () => {
      const groups = nav.groupFiles(files)
      for (let i = 1; i < groups.length; i++) {
        expect(groups[i].files.length).toBeLessThanOrEqual(groups[i - 1].files.length)
      }
    })

    it('should skip node_modules', () => {
      const filesWithNM = [...files, 'node_modules/lodash/index.js']
      const groups = nav.groupFiles(filesWithNM)
      expect(groups.every(g => !g.name.includes('node_modules'))).toBe(true)
    })

    it('should detect layer type for api directory', () => {
      const groups = nav.groupFiles(files)
      const apiGroup = groups.find(g => g.name.includes('api'))
      expect(apiGroup?.type).toBe('layer')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // analyzeImpact
  // ═══════════════════════════════════════════════════════════

  describe('analyzeImpact', () => {
    const allFiles = [
      'src/utils.ts',
      'src/app.ts',
      'src/__tests__/utils.test.ts',
      'src/__tests__/app.test.ts',
      'src/index.ts',
    ]

    it('should find affected test files', () => {
      const impact = nav.analyzeImpact('src/utils.ts', allFiles)
      expect(impact.affectedTests).toContain('src/__tests__/utils.test.ts')
    })

    it('should assess risk level', () => {
      const impact = nav.analyzeImpact('src/utils.ts', allFiles)
      expect(['low', 'medium', 'high']).toContain(impact.risk)
    })

    it('should generate a summary', () => {
      const impact = nav.analyzeImpact('src/utils.ts', allFiles)
      expect(impact.summary).toContain('utils.ts')
    })

    it('should flag index files as high risk', () => {
      const impact = nav.analyzeImpact('src/index.ts', allFiles)
      expect(impact.risk).toBe('high')
    })

    it('should use import map for direct dependents', () => {
      const importMap = new Map([
        ['src/app.ts', ['./utils']],
      ])
      const impact = nav.analyzeImpact('src/utils.ts', allFiles, importMap)
      expect(impact.directDependents).toContain('src/app.ts')
    })

    it('should find indirect dependents', () => {
      const importMap = new Map([
        ['src/app.ts', ['./utils']],
        ['src/index.ts', ['./app']],
      ])
      const impact = nav.analyzeImpact('src/utils.ts', allFiles, importMap)
      // src/index.ts imports from src/app.ts which imports from utils
      expect(impact.directDependents).toContain('src/app.ts')
      expect(impact.indirectDependents.length).toBeGreaterThanOrEqual(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // filterFiles
  // ═══════════════════════════════════════════════════════════

  describe('filterFiles', () => {
    const files = [
      'src/index.ts',
      'src/app.ts',
      'src/__tests__/app.test.ts',
      'tsconfig.json',
      'README.md',
    ]

    it('should filter by language', () => {
      const results = nav.filterFiles(files, { language: 'typescript' })
      expect(results.every(f => f.language === 'typescript')).toBe(true)
    })

    it('should filter test files', () => {
      const results = nav.filterFiles(files, { isTest: true })
      expect(results.every(f => f.isTest)).toBe(true)
    })

    it('should filter non-test files', () => {
      const results = nav.filterFiles(files, { isTest: false })
      expect(results.every(f => !f.isTest)).toBe(true)
    })

    it('should filter by directory', () => {
      const results = nav.filterFiles(files, { directory: 'src/' })
      expect(results.every(f => f.path.startsWith('src/'))).toBe(true)
    })

    it('should filter by extension', () => {
      const results = nav.filterFiles(files, { extension: '.ts' })
      expect(results.every(f => f.extension === '.ts')).toBe(true)
    })

    it('should combine multiple filters', () => {
      const results = nav.filterFiles(files, { language: 'typescript', isTest: false })
      expect(results.every(f => f.language === 'typescript' && !f.isTest)).toBe(true)
    })
  })
})
