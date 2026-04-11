import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('LLM & Prompt Engineering Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about large language models', async () => {
    const r = await brain.chat(
      'explain large language model gpt claude llama gemini transformer attention mechanism',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/transformer|language\s+model|attention|gpt|token/)
  })

  it('knows about prompt engineering techniques', async () => {
    const r = await brain.chat(
      'explain prompt engineering chain of thought few shot zero shot system prompt',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/prompt|chain.*thought|few.shot|zero.shot|technique/)
  })

  it('knows about RAG and vector databases', async () => {
    const r = await brain.chat(
      'explain rag retrieval augmented generation vector database embedding similarity search',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/rag|retrieval|vector|embedding|pinecone|chroma/)
  })

  it('knows about fine-tuning LoRA QLoRA', async () => {
    const r = await brain.chat('explain fine tuning lora qlora peft parameter efficient rlhf dpo')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/lora|fine.tun|peft|rlhf|dpo|parameter/)
  })

  it('knows about AI agents and evaluation', async () => {
    const r = await brain.chat(
      'explain ai agent tool use function calling multi agent system llm evaluation',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/agent|function\s+call|tool|evaluation|hallucination/)
  })

  it('knows about local LLM inference and deployment', async () => {
    const r = await brain.chat(
      'local llm inference ollama llama cpp gguf model quantization int4 gptq awq vllm serving deployment',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /ollama|llama|gguf|quantiz|vllm|local|inference|model|deploy/,
    )
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has LLM & Prompt Engineering concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('LLM & Prompt Engineering')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('ai')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('LLM & Prompt Engineering')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('Large Language Models')
    expect(names).toContain('RAG & Vector Databases')
  })

  it('Prompt Techniques is related to LLM Models', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Prompt Engineering Techniques')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Large Language Models')
  })

  it('RAG is related to Prompt Techniques', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('RAG & Vector Databases')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Prompt Engineering Techniques')
  })
})
