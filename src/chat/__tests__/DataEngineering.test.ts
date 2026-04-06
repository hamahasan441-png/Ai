import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Data Engineering / ETL Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about Apache Spark distributed processing', async () => {
    const r = await brain.chat('explain apache spark rdd dataframe sql catalyst structured streaming')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/spark|rdd|dataframe|distributed|catalyst/)
  })

  it('knows about Airflow DAG orchestration', async () => {
    const r = await brain.chat('explain airflow dag directed acyclic graph workflow orchestration scheduling')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/airflow|dag|orchestrat|workflow|schedul/)
  })

  it('knows about dbt and modern data stack', async () => {
    const r = await brain.chat('explain dbt data build tool transformation analytics engineering warehouse snowflake')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/dbt|warehouse|transform|snowflake|elt/)
  })

  it('knows about Kafka Streams and event streaming', async () => {
    const r = await brain.chat('explain kafka streams event streaming real time processing schema registry avro')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/kafka|stream|schema|avro|event/)
  })

  it('knows about data quality and governance', async () => {
    const r = await brain.chat('explain data quality testing great expectations validation lineage metadata catalog')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/quality|expectation|lineage|metadata|validation/)
  })

  it('knows about data architecture patterns', async () => {
    const r = await brain.chat('explain data pipeline design pattern medallion bronze silver gold dimensional modeling star schema')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/medallion|bronze|silver|gold|dimensional|star|data\s+mesh|pipeline/)
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has Data Engineering concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Data Engineering & ETL')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('data_engineering')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Data Engineering & ETL')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('Apache Spark & Distributed Processing')
    expect(names).toContain('Workflow Orchestration (Airflow/Dagster)')
  })
})
