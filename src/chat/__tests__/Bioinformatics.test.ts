import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Bioinformatics & Computational Biology Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about DNA/RNA sequence alignment', async () => {
      const r = await brain.chat('Explain dna rna sequence alignment bioinformatics and blast sequence search')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dna|rna|sequence|alignment|blast|genome/)
    })

    it('answers about protein structure and AlphaFold', async () => {
      const r = await brain.chat('How does protein structure folding prediction alphafold and molecular dynamics work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/protein|structure|alphafold|fold|molecular/)
    })

    it('answers about RNA-seq and gene expression', async () => {
      const r = await brain.chat('Explain genomics transcriptomics rna seq gene expression and single cell sequencing analysis')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/rna.?seq|gene|expression|single\s*cell|transcriptom/)
    })

    it('answers about bioinformatics tools and phylogenetics', async () => {
      const r = await brain.chat('What are biopython bioconductor bioinformatics library and phylogenetic tree analysis?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/biopython|bioconductor|phylogene|metagenom/)
    })

    it('answers about ML in biology', async () => {
      const r = await brain.chat('How does machine learning genomics deep learning biology and protein language model work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/machine\s*learn|deep\s*learn|protein|genomic|language\s*model/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Bioinformatics root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Bioinformatics')
      expect(node).toBeDefined()
      expect(node!.domain).toBe('biology')
    })

    it('has Sequence Analysis concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Sequence Analysis')
      expect(node).toBeDefined()
    })

    it('has Structural Bioinformatics concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Structural Bioinformatics')
      expect(node).toBeDefined()
    })

    it('has Omics Data Analysis concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Omics Data Analysis')
      expect(node).toBeDefined()
    })

    it('has ML in Biology concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('ML in Biology')
      expect(node).toBeDefined()
    })

    it('Bioinformatics has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Bioinformatics')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(4)
    })

    it('Sequence Analysis is related to Structural Bio', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Sequence Analysis')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Structural Bioinformatics')
    })
  })
})
