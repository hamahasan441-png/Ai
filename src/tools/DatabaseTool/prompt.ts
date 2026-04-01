/**
 * System prompt fragment for the DatabaseTool.
 * Describes capabilities and safety constraints for Claude.
 */

export const DATABASE_TOOL_NAME = 'database'

export function getDatabasePrompt(): string {
  return `The database tool allows you to query, inspect, and manage databases.

Supported databases:
- **SQLite**: Local file-based databases (zero setup)
- **PostgreSQL**: Remote or local PostgreSQL servers
- **MySQL**: Remote or local MySQL servers

Available commands:
- \`query\`: Execute a SQL query and return results
- \`schema\`: Show database schema (tables, columns, types)
- \`tables\`: List all tables in the database
- \`describe\`: Describe a specific table's structure
- \`explain\`: Show the query execution plan

Safety rules:
- By default, only READ operations are allowed (SELECT, DESCRIBE, EXPLAIN)
- Write operations (INSERT, UPDATE, DELETE, DROP) require explicit \`read_only: false\`
- Always use parameterized queries to prevent SQL injection
- Results are limited by \`max_rows\` (default: 100) to prevent memory issues

Connection string formats:
- SQLite: \`sqlite:///path/to/database.db\` or just a file path ending in .db/.sqlite
- PostgreSQL: \`postgresql://user:pass@host:5432/dbname\`
- MySQL: \`mysql://user:pass@host:3306/dbname\`
`
}
