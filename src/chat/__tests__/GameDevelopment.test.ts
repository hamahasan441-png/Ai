import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Game Development Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Unity ─────────────────────────────────────────────────────────────────

  describe('Unity Engine', () => {
    it('explains Unity MonoBehaviour lifecycle and C# scripting', async () => {
      const r = await brain.chat('How does the Unity MonoBehaviour lifecycle work with C# scripting?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/unity|monobehaviour|lifecycle|awake|start|update|c#|script/)
    })

    it('describes Unity physics with Rigidbody and Colliders', async () => {
      const r = await brain.chat('How do Unity physics Rigidbody and Collider components work?')
      expect(r.text.toLowerCase()).toMatch(/unity|rigidbody|collider|physics|trigger|force/)
    })

    it('covers Unity component-based architecture', async () => {
      const r = await brain.chat('How does Unity game engine component-based architecture work?')
      expect(r.text.toLowerCase()).toMatch(/unity|component|gameobject|script|prefab|asset/)
    })
  })

  // ── Unreal Engine ─────────────────────────────────────────────────────────

  describe('Unreal Engine', () => {
    it('explains Unreal Engine C++ and Blueprint system', async () => {
      const r = await brain.chat('How does the Unreal Engine UE5 work with C++ and Blueprint visual scripting for game actor components?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/unreal|engine|blueprint|c\+\+|actor|component|ue[45]|nanite|lumen|gameplay/)
    })

    it('describes UE5 Nanite and Lumen features', async () => {
      const r = await brain.chat('What are the Unreal Engine UE5 Nanite and Lumen rendering features?')
      expect(r.text.toLowerCase()).toMatch(/unreal|ue5|nanite|lumen|render|geometry|illumination/)
    })
  })

  // ── Godot ─────────────────────────────────────────────────────────────────

  describe('Godot Engine', () => {
    it('explains Godot GDScript and scene tree', async () => {
      const r = await brain.chat('How does the Godot game engine GDScript and scene tree system work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/godot|gdscript|scene|tree|node|signal/)
    })
  })

  // ── Game Physics ──────────────────────────────────────────────────────────

  describe('Game Physics', () => {
    it('explains game physics collision detection', async () => {
      const r = await brain.chat('How does game physics engine collision detection work with broad and narrow phase?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/collision|broad\s*phase|narrow\s*phase|physics|rigid\s*body|gjk|sat/)
    })
  })

  // ── Game Architecture ─────────────────────────────────────────────────────

  describe('Game Architecture', () => {
    it('explains Entity Component System ECS pattern', async () => {
      const r = await brain.chat('How does the Entity Component System ECS game architecture pattern work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/entity|component|system|ecs|data.oriented|cache/)
    })

    it('describes behavior trees for game AI', async () => {
      const r = await brain.chat('How do behavior tree game AI decision making systems work?')
      expect(r.text.toLowerCase()).toMatch(/behavior\s*tree|selector|sequence|state\s*machine|ai|game/)
    })
  })

  // ── Multiplayer Networking ────────────────────────────────────────────────

  describe('Multiplayer Networking', () => {
    it('explains game networking and rollback netcode', async () => {
      const r = await brain.chat('How does game networking multiplayer synchronization with rollback netcode work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/network|multiplayer|rollback|predict|server|client|synch/)
    })
  })

  // ── Shaders ───────────────────────────────────────────────────────────────

  describe('Game Shaders', () => {
    it('explains game shader programming HLSL/GLSL', async () => {
      const r = await brain.chat('How does game shader programming work with HLSL and GLSL vertex fragment shaders?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shader|hlsl|glsl|vertex|fragment|render|gpu|pbr/)
    })
  })

  // ── Game AI ───────────────────────────────────────────────────────────────

  describe('Game AI & Pathfinding', () => {
    it('explains A* pathfinding and NavMesh', async () => {
      const r = await brain.chat('How does A-star pathfinding with navigation mesh NavMesh work in game AI?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/a.?star|pathfind|navmesh|navigation|mesh|ai|heuristic/)
    })

    it('describes steering behaviors for game AI', async () => {
      const r = await brain.chat('What are game AI steering behaviors like seek flee and flocking?')
      expect(r.text.toLowerCase()).toMatch(/steer|seek|flee|flock|game|ai|behavior|arrive|wander/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Game Development concepts', () => {
    it('has Game Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Game Development')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('game-dev')
    })

    it('has Unity Engine concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Unity Engine')
      expect(concept).toBeDefined()
    })

    it('has Unreal Engine concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Unreal Engine')
      expect(concept).toBeDefined()
    })

    it('has Game Physics concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Game Physics')
      expect(concept).toBeDefined()
    })

    it('has Game AI & Pathfinding concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Game AI & Pathfinding')
      expect(concept).toBeDefined()
    })

    it('Game Development has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Game Development')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(7)
    })

    it('Unity is related to Unreal', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Unity Engine')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Unreal Engine')
    })
  })
})
