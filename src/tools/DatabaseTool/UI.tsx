/**
 * DatabaseTool UI — Ink-based result rendering for terminal.
 */

import React from 'react'

/** Format database query results as a readable table. */
export function formatQueryResults(data: {
  columns?: string[]
  rows?: Record<string, unknown>[]
  row_count?: number
  tables?: string[]
  schema_info?: string
  message?: string
  execution_time_ms: number
  command: string
  database_type: string
}): string {
  const lines: string[] = []
  const { command, database_type, execution_time_ms } = data

  lines.push(`📊 Database: ${database_type} | Command: ${command} | ${execution_time_ms}ms`)
  lines.push('─'.repeat(60))

  if (data.message) {
    lines.push(data.message)
  }

  if (data.tables) {
    lines.push(`Tables (${data.tables.length}):`)
    for (const table of data.tables) {
      lines.push(`  • ${table}`)
    }
  }

  if (data.schema_info) {
    lines.push(data.schema_info)
  }

  if (data.columns && data.rows) {
    // Simple text table
    const colWidths = data.columns.map(col => {
      const values = data.rows!.map(r => String(r[col] ?? '').length)
      return Math.min(30, Math.max(col.length, ...values))
    })

    // Header
    const header = data.columns.map((col, i) => col.padEnd(colWidths[i]!)).join(' | ')
    lines.push(header)
    lines.push(colWidths.map(w => '─'.repeat(w)).join('─┼─'))

    // Rows
    for (const row of data.rows) {
      const cells = data.columns!.map((col, i) => {
        const val = String(row[col] ?? '')
        return val.length > colWidths[i]! ? val.slice(0, colWidths[i]! - 1) + '…' : val.padEnd(colWidths[i]!)
      })
      lines.push(cells.join(' | '))
    }

    if (data.row_count !== undefined) {
      lines.push(`\n${data.row_count} row(s)`)
    }
  }

  return lines.join('\n')
}

/** Render database tool use message summary. */
export function getToolUseSummary(input: {
  command: string
  connection_string: string
  sql?: string
  table?: string
}): string {
  switch (input.command) {
    case 'query': return `SQL: ${input.sql?.slice(0, 80) ?? '(no query)'}`
    case 'tables': return 'List tables'
    case 'schema': return 'Show schema'
    case 'describe': return `Describe: ${input.table ?? '(no table)'}`
    case 'explain': return `Explain: ${input.sql?.slice(0, 60) ?? '(no query)'}`
    default: return input.command
  }
}

/** Simple React component for rendering results (Ink). */
export function DatabaseResultView({ data }: { data: any }): React.ReactElement {
  return React.createElement('text', null, formatQueryResults(data))
}
