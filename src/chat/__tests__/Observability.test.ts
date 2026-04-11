import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Observability / Monitoring Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows about Prometheus and Grafana', async () => {
    const r = await brain.chat(
      'explain prometheus metrics scraping alertmanager grafana dashboard time series promql',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /prometheus|grafana|metric|alertmanager|promql|time.series/,
    )
  })

  it('knows about distributed tracing', async () => {
    const r = await brain.chat(
      'explain opentelemetry otlp traces spans distributed tracing jaeger zipkin instrumentation',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/opentelemetry|trace|span|jaeger|zipkin|instrumentation/)
  })

  it('knows about log aggregation', async () => {
    const r = await brain.chat(
      'explain log aggregation elk elasticsearch loki fluentd structured logging datadog apm',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/log|elk|elasticsearch|loki|structured|datadog|apm/)
  })

  it('knows about monitoring patterns', async () => {
    const r = await brain.chat(
      'explain synthetic monitoring uptime health check real user monitoring rum pagerduty alert',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/synthetic|monitoring|health|rum|pagerduty|alert|uptime/)
  })

  it('has Observability concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Observability Tools & Practices')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('observability')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Observability Tools & Practices')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('Prometheus & Grafana')
  })
})
