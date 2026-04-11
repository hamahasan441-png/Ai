import type { ModelName } from './model.js'
import type { APIProvider } from './providers.js'

export type ModelConfig = Record<APIProvider, ModelName>

// Local AI model configurations — all models run offline via Ollama / llama.cpp

export const QWEN_2_5_CODER_7B_CONFIG = {
  firstParty: 'qwen2.5-coder:7b',
  bedrock: 'qwen2.5-coder:7b',
  vertex: 'qwen2.5-coder:7b',
  foundry: 'qwen2.5-coder:7b',
} as const satisfies ModelConfig

export const QWEN_2_5_CODER_1_5B_CONFIG = {
  firstParty: 'qwen2.5-coder:1.5b',
  bedrock: 'qwen2.5-coder:1.5b',
  vertex: 'qwen2.5-coder:1.5b',
  foundry: 'qwen2.5-coder:1.5b',
} as const satisfies ModelConfig

export const LLAMA_3_8B_CONFIG = {
  firstParty: 'llama3:8b',
  bedrock: 'llama3:8b',
  vertex: 'llama3:8b',
  foundry: 'llama3:8b',
} as const satisfies ModelConfig

export const LLAMA_3_1_8B_CONFIG = {
  firstParty: 'llama3.1:8b',
  bedrock: 'llama3.1:8b',
  vertex: 'llama3.1:8b',
  foundry: 'llama3.1:8b',
} as const satisfies ModelConfig

export const MISTRAL_7B_CONFIG = {
  firstParty: 'mistral:7b',
  bedrock: 'mistral:7b',
  vertex: 'mistral:7b',
  foundry: 'mistral:7b',
} as const satisfies ModelConfig

export const CODELLAMA_7B_CONFIG = {
  firstParty: 'codellama:7b',
  bedrock: 'codellama:7b',
  vertex: 'codellama:7b',
  foundry: 'codellama:7b',
} as const satisfies ModelConfig

export const DEEPSEEK_CODER_6_7B_CONFIG = {
  firstParty: 'deepseek-coder:6.7b',
  bedrock: 'deepseek-coder:6.7b',
  vertex: 'deepseek-coder:6.7b',
  foundry: 'deepseek-coder:6.7b',
} as const satisfies ModelConfig

export const PHI_3_MINI_CONFIG = {
  firstParty: 'phi3:mini',
  bedrock: 'phi3:mini',
  vertex: 'phi3:mini',
  foundry: 'phi3:mini',
} as const satisfies ModelConfig

export const GEMMA_2_9B_CONFIG = {
  firstParty: 'gemma2:9b',
  bedrock: 'gemma2:9b',
  vertex: 'gemma2:9b',
  foundry: 'gemma2:9b',
} as const satisfies ModelConfig

export const STARCODER2_7B_CONFIG = {
  firstParty: 'starcoder2:7b',
  bedrock: 'starcoder2:7b',
  vertex: 'starcoder2:7b',
  foundry: 'starcoder2:7b',
} as const satisfies ModelConfig

export const QWEN_2_5_72B_CONFIG = {
  firstParty: 'qwen2.5:72b',
  bedrock: 'qwen2.5:72b',
  vertex: 'qwen2.5:72b',
  foundry: 'qwen2.5:72b',
} as const satisfies ModelConfig

// Legacy aliases — keep exports so downstream code still compiles
export const CLAUDE_3_7_SONNET_CONFIG = QWEN_2_5_CODER_7B_CONFIG
export const CLAUDE_3_5_V2_SONNET_CONFIG = QWEN_2_5_CODER_7B_CONFIG
export const CLAUDE_3_5_HAIKU_CONFIG = QWEN_2_5_CODER_1_5B_CONFIG
export const CLAUDE_HAIKU_4_5_CONFIG = QWEN_2_5_CODER_1_5B_CONFIG
export const CLAUDE_SONNET_4_CONFIG = QWEN_2_5_CODER_7B_CONFIG
export const CLAUDE_SONNET_4_5_CONFIG = LLAMA_3_1_8B_CONFIG
export const CLAUDE_OPUS_4_CONFIG = LLAMA_3_8B_CONFIG
export const CLAUDE_OPUS_4_1_CONFIG = LLAMA_3_1_8B_CONFIG
export const CLAUDE_OPUS_4_5_CONFIG = QWEN_2_5_72B_CONFIG
export const CLAUDE_OPUS_4_6_CONFIG = QWEN_2_5_72B_CONFIG
export const CLAUDE_SONNET_4_6_CONFIG = LLAMA_3_1_8B_CONFIG

// Register all local models
export const ALL_MODEL_CONFIGS = {
  haiku35: QWEN_2_5_CODER_1_5B_CONFIG,
  haiku45: QWEN_2_5_CODER_1_5B_CONFIG,
  sonnet35: QWEN_2_5_CODER_7B_CONFIG,
  sonnet37: QWEN_2_5_CODER_7B_CONFIG,
  sonnet40: LLAMA_3_8B_CONFIG,
  sonnet45: LLAMA_3_1_8B_CONFIG,
  sonnet46: LLAMA_3_1_8B_CONFIG,
  opus40: MISTRAL_7B_CONFIG,
  opus41: CODELLAMA_7B_CONFIG,
  opus45: DEEPSEEK_CODER_6_7B_CONFIG,
  opus46: QWEN_2_5_72B_CONFIG,
  // Additional local models
  qwen7b: QWEN_2_5_CODER_7B_CONFIG,
  qwen1_5b: QWEN_2_5_CODER_1_5B_CONFIG,
  llama3: LLAMA_3_8B_CONFIG,
  llama3_1: LLAMA_3_1_8B_CONFIG,
  mistral: MISTRAL_7B_CONFIG,
  codellama: CODELLAMA_7B_CONFIG,
  deepseek: DEEPSEEK_CODER_6_7B_CONFIG,
  phi3: PHI_3_MINI_CONFIG,
  gemma2: GEMMA_2_9B_CONFIG,
  starcoder2: STARCODER2_7B_CONFIG,
  qwen72b: QWEN_2_5_72B_CONFIG,
} as const satisfies Record<string, ModelConfig>

export type ModelKey = keyof typeof ALL_MODEL_CONFIGS

/** Union of all canonical first-party model IDs */
export type CanonicalModelId = (typeof ALL_MODEL_CONFIGS)[ModelKey]['firstParty']

/** Runtime list of canonical model IDs — used by comprehensiveness tests. */
export const CANONICAL_MODEL_IDS = Object.values(ALL_MODEL_CONFIGS).map(c => c.firstParty) as [
  CanonicalModelId,
  ...CanonicalModelId[],
]

/** Map canonical ID → internal short key. Used to apply settings-based modelOverrides. */
export const CANONICAL_ID_TO_KEY: Record<CanonicalModelId, ModelKey> = Object.fromEntries(
  (Object.entries(ALL_MODEL_CONFIGS) as [ModelKey, ModelConfig][]).map(([key, cfg]) => [
    cfg.firstParty,
    key,
  ]),
) as Record<CanonicalModelId, ModelKey>
