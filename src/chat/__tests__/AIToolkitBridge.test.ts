import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'
import {
  AIToolkitBridge,
  SUPPORTED_MODELS,
  quickImageConfig,
  quickLoRAConfig,
  listModels,
  recommendModel,
} from '../AIToolkitBridge'

describe('AI Toolkit Image Generation Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about diffusion model image generation', async () => {
      const r = await brain.chat('explain ai toolkit image generation diffusion model text to image flux stable diffusion')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/diffusion|image|generation|flux|stable\s*diffusion|model/)
    })

    it('answers about LoRA training and fine-tuning', async () => {
      const r = await brain.chat('explain lora training fine tuning diffusion model custom rank adapter')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/lora|training|fine.tun|rank|adapter|model/)
    })

    it('answers about video generation and image editing', async () => {
      const r = await brain.chat('explain video generation text to video image editing ai model wan ltx kontext')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/video|generation|editing|model|wan|ltx|kontext/)
    })
  })

  describe('Semantic concepts', () => {
    it('has AI Toolkit & Diffusion Models concept in ai domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('AI Toolkit & Diffusion Models')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ai')
    })

    it('has Text-to-Image Generation concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Text-to-Image Generation')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ai')
    })

    it('has FLUX Models concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('FLUX Models (Black Forest Labs)')
      expect(concept).toBeDefined()
    })

    it('has LoRA Training concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('LoRA Training & Fine-Tuning')
      expect(concept).toBeDefined()
    })

    it('has >=8 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('AI Toolkit & Diffusion Models')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})

describe('AIToolkitBridge', () => {
  let bridge: AIToolkitBridge

  beforeAll(() => {
    bridge = new AIToolkitBridge({
      toolkitPath: '/tmp/ai-toolkit-test',
      pythonPath: 'python3',
    })
  })

  describe('Model registry', () => {
    it('has supported models', () => {
      expect(SUPPORTED_MODELS.length).toBeGreaterThan(15)
    })

    it('has image models', () => {
      const imageModels = bridge.getModelsByType('image')
      expect(imageModels.length).toBeGreaterThan(5)
      expect(imageModels.some(m => m.id.includes('FLUX'))).toBe(true)
    })

    it('has video models', () => {
      const videoModels = bridge.getModelsByType('video')
      expect(videoModels.length).toBeGreaterThan(3)
      expect(videoModels.some(m => m.id.includes('Wan'))).toBe(true)
    })

    it('has edit models', () => {
      const editModels = bridge.getModelsByType('edit')
      expect(editModels.length).toBeGreaterThanOrEqual(2)
      expect(editModels.some(m => m.id.includes('Kontext'))).toBe(true)
    })

    it('finds model by ID', () => {
      const model = bridge.findModel('black-forest-labs/FLUX.1-dev')
      expect(model).toBeDefined()
      expect(model!.name).toBe('FLUX.1')
      expect(model!.type).toBe('image')
    })

    it('gets models with feature', () => {
      const loraModels = bridge.getModelsWithFeature('lora-training')
      expect(loraModels.length).toBeGreaterThan(5)
    })
  })

  describe('Config generation', () => {
    it('builds valid generate config', () => {
      const config = bridge.buildGenerateConfig({
        prompts: ['a photo of a sunset', 'a painting of mountains'],
        model: 'black-forest-labs/FLUX.1-dev',
        width: 1024,
        height: 1024,
        guidanceScale: 7,
        steps: 20,
      })
      expect(config).toContain('job: generate')
      expect(config).toContain('FLUX.1-dev')
      expect(config).toContain('a photo of a sunset')
      expect(config).toContain('a painting of mountains')
      expect(config).toContain('width: 1024')
      expect(config).toContain('height: 1024')
      expect(config).toContain('guidance_scale: 7')
      expect(config).toContain('sample_steps: 20')
    })

    it('builds valid LoRA training config', () => {
      const config = bridge.buildTrainLoRAConfig({
        name: 'my-character',
        model: 'black-forest-labs/FLUX.1-dev',
        datasetPath: '/data/images',
        steps: 4000,
        lr: 1e-4,
        loraRank: 16,
        resolution: 1024,
      })
      expect(config).toContain('job: train')
      expect(config).toContain('my-character')
      expect(config).toContain('FLUX.1-dev')
      expect(config).toContain('lora')
      expect(config).toContain('steps: 4000')
      expect(config).toContain('/data/images')
      expect(config).toContain('linear: 16')
    })

    it('builds valid extract config', () => {
      const config = bridge.buildExtractConfig({
        baseModel: '/models/base.safetensors',
        extractModel: '/models/trained.safetensors',
        extractionType: 'lora',
        rank: 32,
      })
      expect(config).toContain('job: extract')
      expect(config).toContain('lora')
      expect(config).toContain('rank: 32')
      expect(config).toContain('base_model')
      expect(config).toContain('extract_model')
    })

    it('uses defaults for missing optional params', () => {
      const config = bridge.buildGenerateConfig({
        prompts: ['test prompt'],
        model: 'test-model',
      })
      expect(config).toContain('width: 1024')
      expect(config).toContain('height: 1024')
      expect(config).toContain('guidance_scale: 7')
      expect(config).toContain('sample_steps: 20')
      expect(config).toContain('seed: -1')
    })
  })

  describe('Prompt enhancement', () => {
    it('enhances prompts with quality boosters', () => {
      const enhanced = bridge.enhancePrompt('a cat sitting on a couch')
      expect(enhanced).toContain('a cat sitting on a couch')
      expect(enhanced).toContain('high quality')
      expect(enhanced).toContain('detailed')
    })

    it('adds photo style hints', () => {
      const enhanced = bridge.enhancePrompt('portrait of a woman', 'photo')
      expect(enhanced).toContain('portrait of a woman')
      expect(enhanced).toContain('photograph')
    })

    it('adds cinematic style hints', () => {
      const enhanced = bridge.enhancePrompt('city at night', 'cinematic')
      expect(enhanced).toContain('city at night')
      expect(enhanced).toContain('cinematic')
    })

    it('builds negative prompts', () => {
      const neg = bridge.getRecommendedNegativePrompt('photo')
      expect(neg).toContain('low quality')
      expect(neg).toContain('blurry')
      expect(neg).toContain('cartoon')
    })
  })

  describe('Helper functions', () => {
    it('quickImageConfig generates valid YAML', () => {
      const config = quickImageConfig('a beautiful landscape')
      expect(config).toContain('job: generate')
      expect(config).toContain('a beautiful landscape')
      expect(config).toContain('FLUX.1-dev')
    })

    it('quickLoRAConfig generates valid YAML', () => {
      const config = quickLoRAConfig('my-style', '/data/images')
      expect(config).toContain('job: train')
      expect(config).toContain('my-style')
      expect(config).toContain('/data/images')
    })

    it('listModels returns formatted list', () => {
      const list = listModels('image')
      expect(list).toContain('FLUX')
      expect(list).toContain('text-to-image')
    })

    it('recommendModel returns correct model for use case', () => {
      const quality = recommendModel('quality-image')
      expect(quality.id).toContain('FLUX')

      const fast = recommendModel('fast-image')
      expect(fast.id).toContain('stable-diffusion')

      const video = recommendModel('video')
      expect(video.id).toContain('Wan')

      const edit = recommendModel('editing')
      expect(edit.id).toContain('Kontext')
    })
  })

  describe('Bridge properties', () => {
    it('has toolkit path', () => {
      expect(bridge.getToolkitPath()).toBe('/tmp/ai-toolkit-test')
    })

    it('returns summary string', () => {
      const summary = bridge.getSummary()
      expect(summary).toContain('AI Toolkit Bridge')
      expect(summary).toContain('image generation')
      expect(summary).toContain('video generation')
      expect(summary).toContain('LoRA training')
    })

    it('lists all jobs initially empty', () => {
      const jobs = bridge.getAllJobs()
      expect(jobs).toEqual([])
    })
  })
})
