import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Quantum Computing Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Fundamentals ──────────────────────────────────────────────────────────

  describe('Quantum Fundamentals', () => {
    it('explains quantum computing qubits and superposition', async () => {
      const r = await brain.chat(
        'How does quantum computing work with qubit superposition and entanglement?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/quantum|qubit|superposition|entangle|measurement|state/)
    })

    it('describes Bloch sphere and measurement', async () => {
      const r = await brain.chat(
        'How does qubit measurement and Bloch sphere representation work in quantum computing?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /qubit|bloch|measurement|state|probabilit|collapse|quantum/,
      )
    })

    it('covers decoherence and hardware types', async () => {
      const r = await brain.chat(
        'What are quantum computing hardware types and decoherence challenges?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /quantum|decoherence|superconducting|trapped\s*ion|photonic|noise|hardware/,
      )
    })
  })

  // ── Gates & Circuits ──────────────────────────────────────────────────────

  describe('Quantum Gates & Circuits', () => {
    it('explains quantum gates Hadamard and CNOT', async () => {
      const r = await brain.chat(
        'How do quantum gates like Hadamard and CNOT work in quantum circuits?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /quantum|gate|hadamard|cnot|circuit|superposition|entangle/,
      )
    })

    it('describes universal gate sets', async () => {
      const r = await brain.chat(
        'What is a universal quantum gate set for quantum circuit computation?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /quantum|gate|universal|circuit|pauli|rotation|cnot|hadamard/,
      )
    })
  })

  // ── Algorithms ────────────────────────────────────────────────────────────

  describe('Quantum Algorithms', () => {
    it('explains Shor algorithm for factoring', async () => {
      const r = await brain.chat(
        'How does Shor algorithm work for integer factoring in quantum computing?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shor|algorithm|factor|quantum|fourier|polynomial|rsa/)
    })

    it('describes Grover search algorithm', async () => {
      const r = await brain.chat(
        'How does Grover search algorithm provide quantum speedup advantage?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /grover|search|quantum|speedup|amplitude|quadratic|unstructured/,
      )
    })

    it('covers VQE and QAOA hybrid algorithms', async () => {
      const r = await brain.chat(
        'How do quantum computing algorithms VQE and QAOA work for optimization?',
      )
      expect(r.text.toLowerCase()).toMatch(/quantum|algorithm|vqe|qaoa|variational|optim|hybrid/)
    })
  })

  // ── Programming ───────────────────────────────────────────────────────────

  describe('Quantum Programming', () => {
    it('explains Qiskit quantum programming in Python', async () => {
      const r = await brain.chat(
        'How does Qiskit quantum programming with Python circuits and IBM hardware work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/qiskit|quantum|python|circuit|ibm|simulator|aer/)
    })

    it('describes Cirq and PennyLane frameworks', async () => {
      const r = await brain.chat(
        'What are the Cirq and PennyLane quantum SDK programming frameworks?',
      )
      expect(r.text.toLowerCase()).toMatch(/cirq|pennylane|quantum|framework|google|ml|sdk/)
    })
  })

  // ── Error Correction ──────────────────────────────────────────────────────

  describe('Quantum Error Correction', () => {
    it('explains quantum error correction and surface code', async () => {
      const r = await brain.chat(
        'How does quantum error correction with surface code and fault tolerant computing work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /quantum|error\s*correct|surface\s*code|fault.?tolerant|logical\s*qubit|physical/,
      )
    })

    it('covers NISQ noise mitigation', async () => {
      const r = await brain.chat('How does quantum noise mitigation work in the NISQ era?')
      expect(r.text.toLowerCase()).toMatch(/quantum|noise|mitigation|nisq|error|extrapolat|decoupl/)
    })
  })

  // ── Post-Quantum Cryptography ─────────────────────────────────────────────

  describe('Post-Quantum Cryptography', () => {
    it('explains post-quantum cryptography standards', async () => {
      const r = await brain.chat(
        'What are the post-quantum cryptography NIST standards like Kyber and Dilithium?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/post.?quantum|pqc|nist|kyber|dilithium|lattice|resist/)
    })

    it('covers quantum resistant encryption migration', async () => {
      const r = await brain.chat(
        'How should organizations migrate to quantum resistant encryption algorithms?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /quantum\s*resistant|migration|algorithm|pqc|lattice|hybrid|agil/,
      )
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Quantum Computing concepts', () => {
    it('has Quantum Computing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Computing')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('quantum')
    })

    it('has Quantum Fundamentals concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Fundamentals')
      expect(concept).toBeDefined()
    })

    it('has Quantum Gates & Circuits concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Gates & Circuits')
      expect(concept).toBeDefined()
    })

    it('has Quantum Algorithms concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Algorithms')
      expect(concept).toBeDefined()
    })

    it('has Quantum Error Correction concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Error Correction')
      expect(concept).toBeDefined()
    })

    it('has Post-Quantum Cryptography concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Post-Quantum Cryptography')
      expect(concept).toBeDefined()
    })

    it('Quantum Computing has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Computing')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Quantum Fundamentals is related to Gates', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Fundamentals')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Quantum Gates & Circuits')
    })

    it('Quantum Algorithms is related to Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Quantum Algorithms')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Quantum Programming')
    })
  })
})
