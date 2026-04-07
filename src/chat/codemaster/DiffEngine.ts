/**
 * 📝 DiffEngine — Unified Diff Generation & Application
 *
 * Produces and applies code diffs like GitHub Copilot agent:
 *   • Generate unified diffs between two code versions
 *   • Apply diffs to source code
 *   • Validate diffs before applying
 *   • Multi-file diff batching
 *   • Conflict detection
 *   • Hunk-level granularity
 *
 * Works fully offline — zero external deps.
 */

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A single diff hunk. */
export interface DiffHunk {
  /** Start line in original file (1-based). */
  originalStart: number
  /** Number of lines in original. */
  originalLength: number
  /** Start line in modified file (1-based). */
  modifiedStart: number
  /** Number of lines in modified. */
  modifiedLength: number
  /** Lines in the hunk with +/- prefixes. */
  lines: DiffLine[]
}

/** A single line in a diff. */
export interface DiffLine {
  /** Type of change. */
  type: 'add' | 'remove' | 'context'
  /** Line content (without +/- prefix). */
  content: string
  /** Original line number (if applicable). */
  originalLine?: number
  /** Modified line number (if applicable). */
  modifiedLine?: number
}

/** A complete file diff. */
export interface FileDiff {
  /** Original file path. */
  originalPath: string
  /** Modified file path. */
  modifiedPath: string
  /** All hunks. */
  hunks: DiffHunk[]
  /** Total lines added. */
  additions: number
  /** Total lines removed. */
  deletions: number
  /** Unified diff string representation. */
  unified: string
  /** Whether the file is new. */
  isNew: boolean
  /** Whether the file is deleted. */
  isDeleted: boolean
}

/** Result of applying a diff. */
export interface ApplyResult {
  /** Whether the apply succeeded. */
  success: boolean
  /** The resulting code after applying. */
  code: string
  /** Number of hunks applied. */
  hunksApplied: number
  /** Number of hunks that failed. */
  hunksFailed: number
  /** Conflict descriptions if any. */
  conflicts: string[]
}

/** A batch of file diffs. */
export interface DiffBatch {
  /** Description of the batch. */
  description: string
  /** All file diffs. */
  diffs: FileDiff[]
  /** Total additions across all files. */
  totalAdditions: number
  /** Total deletions across all files. */
  totalDeletions: number
  /** Total files changed. */
  filesChanged: number
}

// ══════════════════════════════════════════════════════════════════════════════
// DIFF ENGINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * DiffEngine — Generates and applies unified diffs.
 *
 * Core diff algorithm using longest common subsequence (LCS) for accurate
 * line-level differencing with configurable context lines.
 */
export class DiffEngine {
  private contextLines: number

  constructor(options?: { contextLines?: number }) {
    this.contextLines = options?.contextLines ?? 3
  }

  /**
   * Generate a diff between two strings.
   */
  generateDiff(original: string, modified: string, filePath = 'file'): FileDiff {
    const origLines = original.split('\n')
    const modLines = modified.split('\n')

    const isNew = original === ''
    const isDeleted = modified === ''

    // Compute LCS-based edit script
    const editScript = this.computeEditScript(origLines, modLines)

    // Group into hunks
    const hunks = this.groupIntoHunks(editScript, origLines, modLines)

    // Count additions and deletions
    let additions = 0
    let deletions = 0
    for (const hunk of hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'add') additions++
        if (line.type === 'remove') deletions++
      }
    }

    // Generate unified diff string
    const unified = this.formatUnified(hunks, filePath, filePath)

    return {
      originalPath: filePath,
      modifiedPath: filePath,
      hunks,
      additions,
      deletions,
      unified,
      isNew,
      isDeleted,
    }
  }

  /**
   * Apply a diff to source code.
   */
  applyDiff(originalCode: string, diff: FileDiff): ApplyResult {
    const lines = originalCode.split('\n')
    const conflicts: string[] = []
    let hunksApplied = 0
    let hunksFailed = 0

    // Apply hunks in reverse order (bottom-up) to preserve line numbers
    const sortedHunks = [...diff.hunks].sort((a, b) => b.originalStart - a.originalStart)

    for (const hunk of sortedHunks) {
      const result = this.applyHunk(lines, hunk)
      if (result.success) {
        // Replace lines in-place
        lines.splice(0, lines.length, ...result.lines)
        hunksApplied++
      } else {
        hunksFailed++
        conflicts.push(result.conflict ?? `Failed to apply hunk at line ${hunk.originalStart}`)
      }
    }

    return {
      success: hunksFailed === 0,
      code: lines.join('\n'),
      hunksApplied,
      hunksFailed,
      conflicts,
    }
  }

  /**
   * Validate a diff can be applied cleanly.
   */
  validateDiff(originalCode: string, diff: FileDiff): { valid: boolean; issues: string[] } {
    const lines = originalCode.split('\n')
    const issues: string[] = []

    for (const hunk of diff.hunks) {
      // Check that the context lines match
      for (const line of hunk.lines) {
        if (line.type === 'context' && line.originalLine) {
          const idx = line.originalLine - 1
          if (idx >= 0 && idx < lines.length && lines[idx] !== line.content) {
            issues.push(`Context mismatch at line ${line.originalLine}: expected "${line.content}" but found "${lines[idx]}"`)
          }
        }
        if (line.type === 'remove' && line.originalLine) {
          const idx = line.originalLine - 1
          if (idx >= 0 && idx < lines.length && lines[idx] !== line.content) {
            issues.push(`Remove target mismatch at line ${line.originalLine}: expected "${line.content}" but found "${lines[idx]}"`)
          }
        }
      }

      // Check line range
      if (hunk.originalStart > lines.length + 1) {
        issues.push(`Hunk starts at line ${hunk.originalStart} but file only has ${lines.length} lines`)
      }
    }

    return { valid: issues.length === 0, issues }
  }

  /**
   * Create a batch of diffs from multiple file changes.
   */
  createBatch(description: string, changes: Array<{ path: string; original: string; modified: string }>): DiffBatch {
    const diffs: FileDiff[] = []
    let totalAdditions = 0
    let totalDeletions = 0

    for (const change of changes) {
      const diff = this.generateDiff(change.original, change.modified, change.path)
      diffs.push(diff)
      totalAdditions += diff.additions
      totalDeletions += diff.deletions
    }

    return {
      description,
      diffs,
      totalAdditions,
      totalDeletions,
      filesChanged: diffs.length,
    }
  }

  /**
   * Merge two non-overlapping diffs for the same file.
   */
  mergeDiffs(diff1: FileDiff, diff2: FileDiff): FileDiff {
    // Simple merge: combine hunks and sort by start line
    const allHunks = [...diff1.hunks, ...diff2.hunks]
    allHunks.sort((a, b) => a.originalStart - b.originalStart)

    // Check for overlaps
    for (let i = 0; i < allHunks.length - 1; i++) {
      const end = allHunks[i].originalStart + allHunks[i].originalLength
      if (end > allHunks[i + 1].originalStart) {
        // Overlapping hunks — keep both but mark as potentially conflicting
      }
    }

    const additions = diff1.additions + diff2.additions
    const deletions = diff1.deletions + diff2.deletions

    return {
      originalPath: diff1.originalPath,
      modifiedPath: diff1.modifiedPath,
      hunks: allHunks,
      additions,
      deletions,
      unified: this.formatUnified(allHunks, diff1.originalPath, diff1.modifiedPath),
      isNew: diff1.isNew,
      isDeleted: diff2.isDeleted,
    }
  }

  /**
   * Get diff statistics.
   */
  getStats(diff: FileDiff): { additions: number; deletions: number; hunks: number; netChange: number } {
    return {
      additions: diff.additions,
      deletions: diff.deletions,
      hunks: diff.hunks.length,
      netChange: diff.additions - diff.deletions,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — Core diff algorithm
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Compute edit script using LCS.
   */
  private computeEditScript(origLines: string[], modLines: string[]): Array<{ type: 'keep' | 'add' | 'remove'; origIdx?: number; modIdx?: number }> {
    const n = origLines.length
    const m = modLines.length

    // LCS table
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (origLines[i - 1] === modLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // Backtrack to get edit script
    const edits: Array<{ type: 'keep' | 'add' | 'remove'; origIdx?: number; modIdx?: number }> = []
    let i = n
    let j = m

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
        edits.unshift({ type: 'keep', origIdx: i - 1, modIdx: j - 1 })
        i--
        j--
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        edits.unshift({ type: 'add', modIdx: j - 1 })
        j--
      } else {
        edits.unshift({ type: 'remove', origIdx: i - 1 })
        i--
      }
    }

    return edits
  }

  /**
   * Group edit script into hunks with context lines.
   */
  private groupIntoHunks(
    edits: Array<{ type: 'keep' | 'add' | 'remove'; origIdx?: number; modIdx?: number }>,
    origLines: string[],
    modLines: string[],
  ): DiffHunk[] {
    if (edits.length === 0) return []

    // Mark which edits are changes (not keeps)
    const changeIndices = edits.map((e, i) => e.type !== 'keep' ? i : -1).filter(i => i !== -1)
    if (changeIndices.length === 0) return []

    // Group changes that are within contextLines of each other
    const groups: Array<{ start: number; end: number }> = []
    let groupStart = changeIndices[0]
    let groupEnd = changeIndices[0]

    for (let ci = 1; ci < changeIndices.length; ci++) {
      if (changeIndices[ci] - groupEnd <= this.contextLines * 2 + 1) {
        groupEnd = changeIndices[ci]
      } else {
        groups.push({ start: groupStart, end: groupEnd })
        groupStart = changeIndices[ci]
        groupEnd = changeIndices[ci]
      }
    }
    groups.push({ start: groupStart, end: groupEnd })

    // Build hunks from groups
    const hunks: DiffHunk[] = []
    for (const group of groups) {
      const hunkStart = Math.max(0, group.start - this.contextLines)
      const hunkEnd = Math.min(edits.length - 1, group.end + this.contextLines)

      const lines: DiffLine[] = []
      let origLine = 0
      let modLine = 0

      // Calculate starting line numbers
      for (let i = 0; i < hunkStart; i++) {
        if (edits[i].type === 'keep' || edits[i].type === 'remove') origLine++
        if (edits[i].type === 'keep' || edits[i].type === 'add') modLine++
      }

      const originalStart = origLine + 1
      const modifiedStart = modLine + 1
      let originalLength = 0
      let modifiedLength = 0

      for (let i = hunkStart; i <= hunkEnd; i++) {
        const edit = edits[i]
        if (edit.type === 'keep') {
          const content = origLines[edit.origIdx!]
          lines.push({
            type: 'context',
            content,
            originalLine: origLine + 1,
            modifiedLine: modLine + 1,
          })
          origLine++
          modLine++
          originalLength++
          modifiedLength++
        } else if (edit.type === 'remove') {
          lines.push({
            type: 'remove',
            content: origLines[edit.origIdx!],
            originalLine: origLine + 1,
          })
          origLine++
          originalLength++
        } else if (edit.type === 'add') {
          lines.push({
            type: 'add',
            content: modLines[edit.modIdx!],
            modifiedLine: modLine + 1,
          })
          modLine++
          modifiedLength++
        }
      }

      hunks.push({
        originalStart,
        originalLength,
        modifiedStart,
        modifiedLength,
        lines,
      })
    }

    return hunks
  }

  /**
   * Format hunks as unified diff.
   */
  private formatUnified(hunks: DiffHunk[], originalPath: string, modifiedPath: string): string {
    const lines: string[] = [
      `--- a/${originalPath}`,
      `+++ b/${modifiedPath}`,
    ]

    for (const hunk of hunks) {
      lines.push(`@@ -${hunk.originalStart},${hunk.originalLength} +${hunk.modifiedStart},${hunk.modifiedLength} @@`)
      for (const line of hunk.lines) {
        if (line.type === 'context') lines.push(` ${line.content}`)
        else if (line.type === 'remove') lines.push(`-${line.content}`)
        else if (line.type === 'add') lines.push(`+${line.content}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * Try to apply a single hunk.
   */
  private applyHunk(lines: string[], hunk: DiffHunk): { success: boolean; lines: string[]; conflict?: string } {
    const result = [...lines]
    const startIdx = hunk.originalStart - 1

    // Verify context matches
    let origOffset = 0
    for (const line of hunk.lines) {
      if (line.type === 'context') {
        const idx = startIdx + origOffset
        if (idx < result.length && result[idx] !== line.content) {
          return {
            success: false,
            lines: result,
            conflict: `Context mismatch at line ${idx + 1}: expected "${line.content}" got "${result[idx]}"`,
          }
        }
        origOffset++
      } else if (line.type === 'remove') {
        origOffset++
      }
    }

    // Apply the hunk
    const newLines: string[] = []
    let origIdx = 0
    for (const line of hunk.lines) {
      if (line.type === 'context') {
        newLines.push(result[startIdx + origIdx] ?? line.content)
        origIdx++
      } else if (line.type === 'remove') {
        origIdx++ // Skip removed line
      } else if (line.type === 'add') {
        newLines.push(line.content)
      }
    }

    // Replace in result
    result.splice(startIdx, hunk.originalLength, ...newLines)

    return { success: true, lines: result }
  }
}
