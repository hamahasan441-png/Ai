import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Audio & Signal Processing Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about digital audio and FFT', async () => {
      const r = await brain.chat('Explain digital audio processing dsp sample rate and fourier transform fft spectral analysis')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/audio|sample|fft|fourier|frequency|spectrum/)
    })

    it('answers about audio synthesis and MIDI', async () => {
      const r = await brain.chat('How does audio synthesis oscillator filter envelope and midi music programming work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/synthesis|oscillator|midi|filter|envelope/)
    })

    it('answers about Web Audio API', async () => {
      const r = await brain.chat('How does web audio api javascript sound browser and tone js audio worklet real time processing node work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/web\s*audio|audiocontext|worklet|tone\.?js|node|audio/)
    })

    it('answers about audio effects', async () => {
      const r = await brain.chat('How do audio effect reverb delay distortion eq and compression limiter dynamics work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reverb|delay|distortion|compressor|eq|effect/)
    })

    it('answers about speech processing and features', async () => {
      const r = await brain.chat('Explain speech processing recognition voice analysis and audio feature extraction mfcc mel spectrogram noise reduction')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/speech|mfcc|mel|feature|voice|recognition|audio|noise/)
    })

    it('answers about music information retrieval', async () => {
      const r = await brain.chat('How does music information retrieval mir audio analysis and beat detection tempo work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/music|mir|beat|tempo|retrieval|fingerprint/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Audio & Signal Processing root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Audio & Signal Processing')
      expect(node).toBeDefined()
      expect(node!.domain).toBe('audio')
    })

    it('has Digital Audio Fundamentals concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Digital Audio Fundamentals')
      expect(node).toBeDefined()
    })

    it('has Audio Synthesis concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Audio Synthesis')
      expect(node).toBeDefined()
    })

    it('has Web Audio concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Web Audio')
      expect(node).toBeDefined()
    })

    it('has Audio Effects & DSP concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Audio Effects & DSP')
      expect(node).toBeDefined()
    })

    it('has Music Information Retrieval concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Music Information Retrieval')
      expect(node).toBeDefined()
    })

    it('Audio & Signal Processing has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Audio & Signal Processing')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Digital Audio is related to Audio Synthesis', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Digital Audio Fundamentals')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Audio Synthesis')
    })
  })
})
