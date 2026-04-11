/**
 * ConnectorText block type — used for connector/context injection into messages.
 * This is an internal type used by the Claude Code connector text feature.
 */

export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
  source?: string
}

export function isConnectorTextBlock(block: unknown): block is ConnectorTextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as ConnectorTextBlock).type === 'connector_text'
  )
}
