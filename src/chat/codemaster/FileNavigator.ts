/**
 * 📂 FileNavigator — Intelligent File System Navigation
 *
 * Provides smart file exploration capabilities like GitHub Copilot agent:
 *   • Pattern-based file search (glob, regex, fuzzy)
 *   • Project structure analysis and visualization
 *   • Smart file grouping by module/feature/layer
 *   • File importance scoring for context prioritization
 *   • Change impact analysis (what files are affected by a change)
 *   • Directory tree generation with filtering
 *   • File type statistics and project overview
 *
 * Works fully offline — zero external deps.
 */

import type { AnalysisLanguage } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Represents a file in the project. */
export interface FileEntry {
  /** Full path relative to project root. */
  path: string
  /** File name only. */
  name: string
  /** File extension (with dot). */
  extension: string
  /** Detected language. */
  language: AnalysisLanguage
  /** File size in bytes (if known). */
  size?: number
  /** Number of lines (if known). */
  lines?: number
  /** Whether it's a test file. */
  isTest: boolean
  /** Whether it's a config file. */
  isConfig: boolean
  /** Whether it's a documentation file. */
  isDoc: boolean
  /** Importance score (0-1) for context prioritization. */
  importance: number
}

/** A directory node in the tree. */
export interface DirectoryNode {
  /** Directory name. */
  name: string
  /** Full path. */
  path: string
  /** Child directories. */
  directories: DirectoryNode[]
  /** Files in this directory. */
  files: FileEntry[]
  /** Total file count (recursive). */
  totalFiles: number
  /** Total size (recursive). */
  totalSize: number
}

/** File search result. */
export interface SearchResult {
  /** Matching file. */
  file: FileEntry
  /** Match score (0-1). */
  score: number
  /** Why it matched. */
  matchReason: string
}

/** Project structure overview. */
export interface ProjectOverview {
  /** Total files. */
  totalFiles: number
  /** Total directories. */
  totalDirectories: number
  /** Files by language. */
  languageBreakdown: Map<AnalysisLanguage, number>
  /** Files by category. */
  categoryBreakdown: { source: number; test: number; config: number; docs: number; other: number }
  /** Detected project type. */
  projectType: ProjectType
  /** Key entry points. */
  entryPoints: string[]
  /** Key directories. */
  keyDirectories: string[]
}

/** Detected project type. */
export type ProjectType =
  | 'node-library'
  | 'node-app'
  | 'react-app'
  | 'next-app'
  | 'express-api'
  | 'python-package'
  | 'python-app'
  | 'rust-crate'
  | 'go-module'
  | 'java-maven'
  | 'monorepo'
  | 'unknown'

/** File grouping result. */
export interface FileGroup {
  /** Group name (feature/module name). */
  name: string
  /** Files in this group. */
  files: FileEntry[]
  /** Group type. */
  type: 'feature' | 'module' | 'layer' | 'type'
  /** Description. */
  description: string
}

/** Change impact analysis result. */
export interface ImpactAnalysis {
  /** File that was changed. */
  changedFile: string
  /** Files directly importing the changed file. */
  directDependents: string[]
  /** Files indirectly affected. */
  indirectDependents: string[]
  /** Test files that should be run. */
  affectedTests: string[]
  /** Risk level of the change. */
  risk: 'low' | 'medium' | 'high'
  /** Summary. */
  summary: string
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const EXTENSION_LANGUAGE: Record<string, AnalysisLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.pyw': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.rb': 'ruby',
  '.php': 'php',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',
  '.sass': 'css',
  '.sql': 'sql',
  '.sh': 'bash',
  '.bash': 'bash',
  '.ps1': 'powershell',
  '.r': 'r',
  '.R': 'r',
  '.dart': 'dart',
  '.scala': 'scala',
  '.lua': 'lua',
  '.hs': 'haskell',
  '.ex': 'elixir',
  '.exs': 'elixir',
}

const TEST_PATTERNS = [
  /\.test\.\w+$/,
  /\.spec\.\w+$/,
  /__tests__\//,
  /\/test\//,
  /\/tests\//,
  /\.test$/,
  /_test\.\w+$/,
  /_test\.go$/,
]

const CONFIG_PATTERNS = [
  /\.config\.\w+$/,
  /\.rc$/,
  /\.json$/,
  /\.ya?ml$/,
  /\.toml$/,
  /\.ini$/,
  /\.env/,
  /tsconfig/,
  /eslint/,
  /prettier/,
  /webpack/,
  /vite\.config/,
  /jest\.config/,
  /vitest\.config/,
  /package\.json$/,
  /Dockerfile$/i,
  /docker-compose/i,
  /Makefile$/i,
  /\.gitignore$/,
]

const DOC_PATTERNS = [
  /\.md$/i,
  /\.mdx$/i,
  /\.txt$/i,
  /\.rst$/i,
  /\.adoc$/i,
  /readme/i,
  /changelog/i,
  /license/i,
  /contributing/i,
  /docs\//i,
]

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  'target',
  'vendor',
  '.idea',
  '.vscode',
])

// ══════════════════════════════════════════════════════════════════════════════
// FILE NAVIGATOR CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * FileNavigator — Intelligent file system exploration engine.
 *
 * Understands project structures and helps navigate large codebases
 * like GitHub Copilot agent does when exploring repositories.
 */
export class FileNavigator {
  /**
   * Create a FileEntry from a file path.
   */
  createFileEntry(path: string, options?: { size?: number; lines?: number }): FileEntry {
    const name = path.split('/').pop() ?? path
    const dotIdx = name.lastIndexOf('.')
    const extension = dotIdx > 0 ? name.substring(dotIdx) : ''
    const language = EXTENSION_LANGUAGE[extension] ?? 'unknown'

    const isTest = TEST_PATTERNS.some(p => p.test(path))
    const isConfig = CONFIG_PATTERNS.some(p => p.test(path))
    const isDoc = DOC_PATTERNS.some(p => p.test(path))

    return {
      path,
      name,
      extension,
      language,
      size: options?.size,
      lines: options?.lines,
      isTest,
      isConfig,
      isDoc,
      importance: this.scoreImportance(path, isTest, isConfig, isDoc),
    }
  }

  /**
   * Score how important a file is (0-1) for context prioritization.
   */
  scoreImportance(path: string, isTest: boolean, isConfig: boolean, isDoc: boolean): number {
    let score = 0.5 // base

    // Entry points are very important
    const name = path.split('/').pop()?.toLowerCase() ?? ''
    if (name === 'index.ts' || name === 'index.js' || name === 'main.ts' || name === 'main.js')
      score += 0.3
    if (name === 'app.ts' || name === 'app.js' || name === 'server.ts' || name === 'server.js')
      score += 0.25

    // Package.json / config at root
    if (name === 'package.json' && !path.includes('/')) score += 0.3
    if (name === 'tsconfig.json') score += 0.1

    // Test files less important for context
    if (isTest) score -= 0.2

    // Config files moderate
    if (isConfig && !name.includes('package')) score -= 0.1

    // Doc files less important for code context
    if (isDoc) score -= 0.15

    // Source files in src/ are important
    if (path.startsWith('src/') && !isTest) score += 0.1

    // Deep nesting reduces importance
    const depth = path.split('/').length
    if (depth > 5) score -= 0.1

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Search files by pattern (glob-like, fuzzy, or exact).
   */
  searchFiles(files: string[], query: string): SearchResult[] {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()
    const queryParts = lowerQuery.split(/[\s/\\]+/).filter(Boolean)

    for (const filePath of files) {
      const lowerPath = filePath.toLowerCase()
      const fileName = filePath.split('/').pop()?.toLowerCase() ?? ''
      let score = 0
      let reason = ''

      // Exact filename match
      if (
        fileName === lowerQuery ||
        fileName === lowerQuery + '.ts' ||
        fileName === lowerQuery + '.js'
      ) {
        score = 1.0
        reason = 'exact filename match'
      }
      // Filename contains query
      else if (fileName.includes(lowerQuery)) {
        score = 0.8
        reason = 'filename contains query'
      }
      // Path contains query
      else if (lowerPath.includes(lowerQuery)) {
        score = 0.6
        reason = 'path contains query'
      }
      // All query parts match somewhere in path
      else if (queryParts.every(part => lowerPath.includes(part))) {
        score = 0.5
        reason = 'all query parts found in path'
      }
      // Fuzzy match — at least some parts match
      else {
        const matchedParts = queryParts.filter(part => lowerPath.includes(part))
        if (matchedParts.length > 0) {
          score = 0.3 * (matchedParts.length / queryParts.length)
          reason = `partial match (${matchedParts.length}/${queryParts.length} terms)`
        }
      }

      if (score > 0) {
        const entry = this.createFileEntry(filePath)
        results.push({ file: entry, score, matchReason: reason })
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score)
    return results
  }

  /**
   * Build a directory tree from a flat list of file paths.
   */
  buildDirectoryTree(files: string[], rootName = '.'): DirectoryNode {
    const root: DirectoryNode = {
      name: rootName,
      path: '',
      directories: [],
      files: [],
      totalFiles: 0,
      totalSize: 0,
    }

    const dirMap = new Map<string, DirectoryNode>()
    dirMap.set('', root)

    for (const filePath of files) {
      const parts = filePath.split('/')
      const fileName = parts.pop()!

      // Skip ignored directories
      if (parts.some(p => IGNORE_DIRS.has(p))) continue

      // Ensure all parent directories exist
      let currentPath = ''
      let currentNode = root

      for (const part of parts) {
        const nextPath = currentPath ? `${currentPath}/${part}` : part
        let dirNode = dirMap.get(nextPath)

        if (!dirNode) {
          dirNode = {
            name: part,
            path: nextPath,
            directories: [],
            files: [],
            totalFiles: 0,
            totalSize: 0,
          }
          dirMap.set(nextPath, dirNode)
          currentNode.directories.push(dirNode)
        }

        currentPath = nextPath
        currentNode = dirNode
      }

      // Add file to leaf directory
      const entry = this.createFileEntry(filePath)
      currentNode.files.push(entry)
    }

    // Calculate totals recursively
    this.calculateTotals(root)

    return root
  }

  /**
   * Generate a text-based directory tree (like `tree` command).
   */
  renderTree(node: DirectoryNode, options?: { maxDepth?: number; showFiles?: boolean }): string {
    const maxDepth = options?.maxDepth ?? 4
    const showFiles = options?.showFiles ?? true
    const lines: string[] = [node.name + '/']

    this.renderNode(node, '', lines, 0, maxDepth, showFiles)

    return lines.join('\n')
  }

  /**
   * Analyze project structure and generate an overview.
   */
  analyzeProject(files: string[]): ProjectOverview {
    const entries = files.map(f => this.createFileEntry(f))
    const languageBreakdown = new Map<AnalysisLanguage, number>()

    let source = 0,
      test = 0,
      config = 0,
      docs = 0,
      other = 0

    for (const entry of entries) {
      // Language counting
      const count = languageBreakdown.get(entry.language) ?? 0
      languageBreakdown.set(entry.language, count + 1)

      // Category counting
      if (entry.isTest) test++
      else if (entry.isConfig) config++
      else if (entry.isDoc) docs++
      else if (entry.language !== 'unknown') source++
      else other++
    }

    // Detect project type
    const projectType = this.detectProjectType(files)

    // Find entry points
    const entryPoints = entries
      .filter(e => /^(src\/)?(index|main|app|server)\.(ts|js|py|go|rs)$/.test(e.path))
      .map(e => e.path)

    // Find key directories
    const dirs = new Set<string>()
    for (const f of files) {
      const parts = f.split('/')
      if (parts.length > 1 && !IGNORE_DIRS.has(parts[0])) {
        dirs.add(parts[0])
      }
    }

    return {
      totalFiles: files.length,
      totalDirectories: dirs.size,
      languageBreakdown,
      categoryBreakdown: { source, test, config, docs, other },
      projectType,
      entryPoints,
      keyDirectories: [...dirs].sort(),
    }
  }

  /**
   * Group files by feature/module/layer.
   */
  groupFiles(files: string[]): FileGroup[] {
    const groups: FileGroup[] = []
    const filesByDir = new Map<string, FileEntry[]>()

    for (const filePath of files) {
      const parts = filePath.split('/')
      if (parts.some(p => IGNORE_DIRS.has(p))) continue

      // Group by top-level or second-level directory
      const groupKey = parts.length > 2 ? `${parts[0]}/${parts[1]}` : parts[0]
      const entry = this.createFileEntry(filePath)

      if (!filesByDir.has(groupKey)) {
        filesByDir.set(groupKey, [])
      }
      filesByDir.get(groupKey)!.push(entry)
    }

    for (const [dir, dirFiles] of filesByDir) {
      const hasTests = dirFiles.some(f => f.isTest)
      const hasSource = dirFiles.some(f => !f.isTest && !f.isConfig && !f.isDoc)

      let type: FileGroup['type'] = 'module'
      if (dir.includes('test') || dir.includes('spec')) type = 'type'
      else if (dir.includes('api') || dir.includes('routes') || dir.includes('controllers'))
        type = 'layer'
      else if (hasSource && hasTests) type = 'feature'

      groups.push({
        name: dir,
        files: dirFiles,
        type,
        description: `${dirFiles.length} files in ${dir}`,
      })
    }

    return groups.sort((a, b) => b.files.length - a.files.length)
  }

  /**
   * Analyze impact of changing a file.
   */
  analyzeImpact(
    changedFile: string,
    allFiles: string[],
    importMap?: Map<string, string[]>,
  ): ImpactAnalysis {
    const directDependents: string[] = []
    const affectedTests: string[] = []

    // If we have an import map, use it
    if (importMap) {
      for (const [file, imports] of importMap) {
        const normalizedChanged = changedFile.replace(/\.\w+$/, '')
        const changedBaseName = normalizedChanged.split('/').pop() ?? ''
        if (
          imports.some(imp => {
            const normalizedImp = imp.replace(/^\.\//, '').replace(/\.\w+$/, '')
            return (
              normalizedImp === normalizedChanged ||
              normalizedImp === changedBaseName ||
              normalizedChanged.endsWith(normalizedImp)
            )
          })
        ) {
          directDependents.push(file)
        }
      }
    }

    // Find related test files by naming convention
    const baseName =
      changedFile
        .replace(/\.\w+$/, '')
        .split('/')
        .pop() ?? ''
    for (const file of allFiles) {
      if (file.includes(baseName) && TEST_PATTERNS.some(p => p.test(file))) {
        affectedTests.push(file)
      }
    }

    // Find co-located tests
    const dir = changedFile.substring(0, changedFile.lastIndexOf('/'))
    for (const file of allFiles) {
      if (
        file.startsWith(dir) &&
        TEST_PATTERNS.some(p => p.test(file)) &&
        !affectedTests.includes(file)
      ) {
        affectedTests.push(file)
      }
    }

    // Indirect dependents (dependents of dependents)
    const indirectDependents: string[] = []
    if (importMap) {
      for (const dep of directDependents) {
        const depBaseName = dep.replace(/\.\w+$/, '')
        for (const [file, imports] of importMap) {
          if (
            imports.some(imp => imp.includes(depBaseName)) &&
            !directDependents.includes(file) &&
            file !== changedFile
          ) {
            indirectDependents.push(file)
          }
        }
      }
    }

    // Risk assessment
    let risk: ImpactAnalysis['risk'] = 'low'
    if (directDependents.length > 10 || indirectDependents.length > 20) risk = 'high'
    else if (directDependents.length > 3 || indirectDependents.length > 5) risk = 'medium'

    // If it's an index/barrel file, higher risk
    if (changedFile.includes('index.') || changedFile.includes('types.')) risk = 'high'

    const summary = `Changing ${changedFile}: ${directDependents.length} direct dependents, ${indirectDependents.length} indirect, ${affectedTests.length} tests to run. Risk: ${risk}.`

    return {
      changedFile,
      directDependents,
      indirectDependents,
      affectedTests,
      risk,
      summary,
    }
  }

  /**
   * Filter files by various criteria.
   */
  filterFiles(
    files: string[],
    criteria: {
      language?: AnalysisLanguage
      isTest?: boolean
      isConfig?: boolean
      isDoc?: boolean
      directory?: string
      extension?: string
      minImportance?: number
    },
  ): FileEntry[] {
    return files
      .map(f => this.createFileEntry(f))
      .filter(entry => {
        if (criteria.language && entry.language !== criteria.language) return false
        if (criteria.isTest !== undefined && entry.isTest !== criteria.isTest) return false
        if (criteria.isConfig !== undefined && entry.isConfig !== criteria.isConfig) return false
        if (criteria.isDoc !== undefined && entry.isDoc !== criteria.isDoc) return false
        if (criteria.directory && !entry.path.startsWith(criteria.directory)) return false
        if (criteria.extension && entry.extension !== criteria.extension) return false
        if (criteria.minImportance && entry.importance < criteria.minImportance) return false
        return true
      })
  }

  // ── Private helpers ──

  private calculateTotals(node: DirectoryNode): void {
    node.totalFiles = node.files.length
    node.totalSize = node.files.reduce((sum, f) => sum + (f.size ?? 0), 0)

    for (const dir of node.directories) {
      this.calculateTotals(dir)
      node.totalFiles += dir.totalFiles
      node.totalSize += dir.totalSize
    }
  }

  private renderNode(
    node: DirectoryNode,
    prefix: string,
    lines: string[],
    depth: number,
    maxDepth: number,
    showFiles: boolean,
  ): void {
    if (depth >= maxDepth) return

    const items = [
      ...node.directories.map(d => ({ name: d.name + '/', isDir: true, node: d })),
      ...(showFiles
        ? node.files.map(f => ({ name: f.name, isDir: false, node: null as DirectoryNode | null }))
        : []),
    ].sort((a, b) => {
      // Directories first
      if (a.isDir && !b.isDir) return -1
      if (!a.isDir && b.isDir) return 1
      return a.name.localeCompare(b.name)
    })

    for (let i = 0; i < items.length; i++) {
      const isLast = i === items.length - 1
      const connector = isLast ? '└── ' : '├── '
      const childPrefix = isLast ? '    ' : '│   '

      lines.push(prefix + connector + items[i].name)

      if (items[i].isDir && items[i].node) {
        this.renderNode(items[i].node!, prefix + childPrefix, lines, depth + 1, maxDepth, showFiles)
      }
    }
  }

  private detectProjectType(files: string[]): ProjectType {
    const fileSet = new Set(files.map(f => f.toLowerCase()))
    const hasFile = (name: string) =>
      fileSet.has(name) || files.some(f => f.toLowerCase().endsWith('/' + name))

    // Monorepo detection
    if (
      hasFile('lerna.json') ||
      hasFile('pnpm-workspace.yaml') ||
      files.some(f => f.startsWith('packages/'))
    ) {
      return 'monorepo'
    }

    // Next.js
    if (hasFile('next.config.js') || hasFile('next.config.mjs') || hasFile('next.config.ts')) {
      return 'next-app'
    }

    // React
    if (files.some(f => f.endsWith('.tsx') || f.endsWith('.jsx')) && hasFile('package.json')) {
      if (files.some(f => f.includes('express') || f.includes('fastify'))) return 'express-api'
      return 'react-app'
    }

    // Express/Fastify API
    if (
      files.some(f => f.includes('routes') || f.includes('controllers')) &&
      hasFile('package.json')
    ) {
      return 'express-api'
    }

    // Python
    if (hasFile('setup.py') || hasFile('pyproject.toml')) {
      return hasFile('manage.py') ? 'python-app' : 'python-package'
    }

    // Rust
    if (hasFile('cargo.toml')) return 'rust-crate'

    // Go
    if (hasFile('go.mod')) return 'go-module'

    // Java
    if (hasFile('pom.xml')) return 'java-maven'

    // Node.js
    if (hasFile('package.json')) {
      if (files.some(f => f.includes('bin/') || f.includes('cli'))) return 'node-app'
      return 'node-library'
    }

    return 'unknown'
  }
}
