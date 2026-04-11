import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Geospatial & GIS Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about web mapping libraries', async () => {
    const r = await brain.chat(
      'explain leaflet mapbox openlayers interactive web map tiles cesium deck gl',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/leaflet|mapbox|openlayers|tiles|cesium|map/)
  })

  it('knows about PostGIS spatial databases', async () => {
    const r = await brain.chat(
      'explain postgis spatial database geography geometry geojson topojson shapefile',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/postgis|spatial|geojson|geometry|shapefile/)
  })

  it('knows about geocoding and routing', async () => {
    const r = await brain.chat(
      'explain geocoding reverse geocoding address coordinates routing directions geofencing',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/geocod|routing|direction|geofenc|address|coordinates/)
  })

  it('knows about QGIS and remote sensing', async () => {
    const r = await brain.chat(
      'explain gis qgis arcgis desktop analysis remote sensing satellite imagery raster dem',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/qgis|arcgis|raster|remote\s+sens|dem|satellite/)
  })

  it('knows about Turf.js and H3', async () => {
    const r = await brain.chat(
      'explain turf js geospatial analysis javascript h3 uber hexagonal grid openstreetmap',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/turf|h3|hexagonal|openstreetmap|geospatial/)
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has Geospatial & GIS concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Geospatial & GIS')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('geospatial')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Geospatial & GIS')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('Web Mapping Libraries')
    expect(names).toContain('Spatial Databases & Formats')
  })

  it('Geospatial Services is related to Web Mapping', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Geospatial Services')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Web Mapping Libraries')
  })
})
