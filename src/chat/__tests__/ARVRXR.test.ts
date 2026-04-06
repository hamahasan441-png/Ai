import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('AR/VR/XR Development Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about WebXR and Three.js', async () => {
    const r = await brain.chat('explain webxr virtual reality augmented reality browser threejs 3d scene renderer')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/webxr|three\.?js|a.frame|virtual\s+reality|3d/)
  })

  it('knows about Unity and Unreal VR development', async () => {
    const r = await brain.chat('explain unity vr development xr interaction toolkit unreal engine openxr standard')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/unity|unreal|openxr|vr|xr/)
  })

  it('knows about spatial computing and Vision Pro', async () => {
    const r = await brain.chat('explain spatial computing apple vision pro visionos mixed reality hololens hand tracking')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/spatial|vision|hololens|mixed\s+reality|hand\s+track/)
  })

  it('knows about ARKit and ARCore', async () => {
    const r = await brain.chat('explain augmented reality arkit arcore surface detection marker tracking slam')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/arkit|arcore|augmented|slam|surface|marker/)
  })

  it('knows about VR performance and motion sickness', async () => {
    const r = await brain.chat('explain vr performance optimization foveated rendering motion sickness comfort')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/foveated|motion\s+sickness|performance|framerate|comfort/)
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has AR/VR/XR Development concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('AR/VR/XR Development')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('xr')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('AR/VR/XR Development')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('Native XR (Unity/Unreal)')
    expect(names).toContain('Spatial Computing')
  })

  it('AR Technology is related to Spatial Computing', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('AR Technology')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Spatial Computing')
  })
})
