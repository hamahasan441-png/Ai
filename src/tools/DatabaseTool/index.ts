/**
 * DatabaseTool — Query, inspect, and manage databases.
 *
 * @example
 * ```ts
 * import { DatabaseTool } from './tools/DatabaseTool/index.js'
 * ```
 */

export { DatabaseTool } from './DatabaseTool.js'
export { DATABASE_TOOL_NAME, getDatabasePrompt } from './prompt.js'
export { formatQueryResults, getToolUseSummary, DatabaseResultView } from './UI.js'
