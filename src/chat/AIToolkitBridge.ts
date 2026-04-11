/**
 * 🎨 AIToolkitBridge — TypeScript bridge to the Ostris AI Toolkit
 *
 * Integrates with the Python-based ai-toolkit (https://github.com/ostris/ai-toolkit)
 * to provide image generation, video generation, LoRA training, model management,
 * and more from within the Ai system.
 *
 * Capabilities:
 *   • Text-to-image generation (FLUX, Stable Diffusion, SDXL, Chroma, Lumina2, etc.)
 *   • Image editing (FLUX Kontext, Qwen-Image-Edit)
 *   • Video generation (Wan 2.1/2.2, LTX-2)
 *   • LoRA fine-tuning and training
 *   • Model extraction, modification, and merging
 *   • YAML config generation for ai-toolkit jobs
 *
 * @example
 * ```ts
 * import { AIToolkitBridge } from './chat/AIToolkitBridge.js'
 *
 * const bridge = new AIToolkitBridge({ toolkitPath: '/path/to/ai-toolkit' })
 * const status = bridge.getStatus()
 *
 * // Generate an image
 * const config = bridge.buildGenerateConfig({
 *   prompts: ['a photo of a sunset over mountains'],
 *   model: 'black-forest-labs/FLUX.1-dev',
 *   width: 1024,
 *   height: 1024,
 * })
 *
 * // Create a LoRA training config
 * const trainConfig = bridge.buildTrainLoRAConfig({
 *   name: 'my-character',
 *   model: 'black-forest-labs/FLUX.1-dev',
 *   datasetPath: '/path/to/images',
 *   steps: 4000,
 *   lr: 1e-4,
 * })
 * ```
 */

import { execFileSync, spawn, type ChildProcess } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES & INTERFACES                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Supported image generation models */
export type ImageModel =
  | 'black-forest-labs/FLUX.1-dev'
  | 'black-forest-labs/FLUX.2-dev'
  | 'black-forest-labs/FLUX.2-klein-base-4B'
  | 'black-forest-labs/FLUX.2-klein-base-9B'
  | 'ostris/Flex.1-alpha'
  | 'ostris/Flex.2-preview'
  | 'lodestones/Chroma1-Base'
  | 'Alpha-VLLM/Lumina-Image-2.0'
  | 'Qwen/Qwen-Image'
  | 'HiDream-ai/HiDream-I1-Full'
  | 'OmniGen2/OmniGen2'
  | 'stabilityai/stable-diffusion-xl-base-1.0'
  | 'stable-diffusion-v1-5/stable-diffusion-v1-5'
  | string // Allow custom model paths

/** Supported image editing models */
export type ImageEditModel =
  | 'black-forest-labs/FLUX.1-Kontext-dev'
  | 'Qwen/Qwen-Image-Edit'
  | 'Qwen/Qwen-Image-Edit-2509'
  | 'HiDream-ai/HiDream-E1-1'
  | string

/** Supported video generation models */
export type VideoModel =
  | 'Wan-AI/Wan2.1-T2V-1.3B-Diffusers'
  | 'Wan-AI/Wan2.1-T2V-14B-Diffusers'
  | 'Wan-AI/Wan2.1-I2V-14B-480P-Diffusers'
  | 'Wan-AI/Wan2.1-I2V-14B-720P-Diffusers'
  | 'Wan-AI/Wan2.2-T2V-A14B-Diffusers'
  | 'Wan-AI/Wan2.2-I2V-A14B-Diffusers'
  | 'Lightricks/LTX-2'
  | 'Lightricks/LTX-2.3'
  | string

/** Data type for model precision */
export type ModelDtype = 'bf16' | 'fp16' | 'fp32'

/** Supported job types in ai-toolkit */
export type JobType = 'generate' | 'train' | 'extract' | 'mod' | 'extension'

/** Supported training process types */
export type TrainProcessType = 'lora' | 'vae' | 'slider' | 'esrgan' | 'reference' | 'full_fine_tune'

/** LoRA training configuration */
export interface LoRATrainConfig {
  /** Job name identifier */
  name: string
  /** Model name or HuggingFace path */
  model: string
  /** Path to training dataset folder */
  datasetPath: string
  /** Number of training steps */
  steps?: number
  /** Learning rate */
  lr?: number
  /** Batch size */
  batchSize?: number
  /** LoRA rank (dimensionality) */
  loraRank?: number
  /** Training resolution (width) */
  resolution?: number
  /** Save checkpoint every N steps */
  saveEveryNSteps?: number
  /** Output folder for checkpoints */
  outputFolder?: string
  /** Data type (bf16/fp16/fp32) */
  dtype?: ModelDtype
  /** Sample prompts for evaluation during training */
  samplePrompts?: string[]
  /** Max step saves to keep on disk */
  maxStepSavesToKeep?: number
  /** Gradient accumulation steps */
  gradientAccumulationSteps?: number
  /** Gradient checkpointing */
  gradientCheckpointing?: boolean
  /** Optimizer (adamw8bit, prodigy, etc.) */
  optimizer?: string
  /** Caption extension for training images */
  captionExt?: string
  /** Whether to use random crop */
  randomCrop?: boolean
}

/** Image generation configuration */
export interface GenerateConfig {
  /** Text prompts to generate images from */
  prompts: string[]
  /** Model name or HuggingFace path */
  model: string
  /** Output width */
  width?: number
  /** Output height */
  height?: number
  /** Negative prompt */
  negativePrompt?: string
  /** Random seed (-1 for random) */
  seed?: number
  /** Guidance scale (CFG) */
  guidanceScale?: number
  /** Number of sampling steps */
  steps?: number
  /** Output image format */
  outputFormat?: '.png' | '.jpg' | '.webp'
  /** Output folder */
  outputFolder?: string
  /** Device (cuda:0, cpu, etc.) */
  device?: string
  /** Data type */
  dtype?: ModelDtype
}

/** Video generation configuration */
export interface VideoGenerateConfig {
  /** Text prompt for video */
  prompt: string
  /** Model name or HuggingFace path */
  model: VideoModel
  /** Output width */
  width?: number
  /** Output height */
  height?: number
  /** Number of frames */
  numFrames?: number
  /** Frames per second */
  fps?: number
  /** Guidance scale */
  guidanceScale?: number
  /** Number of sampling steps */
  steps?: number
  /** Output folder */
  outputFolder?: string
  /** Device */
  device?: string
}

/** Model extraction configuration */
export interface ExtractConfig {
  /** Base model path */
  baseModel: string
  /** Trained model to extract from */
  extractModel: string
  /** Extraction type */
  extractionType: 'lora' | 'locon'
  /** LoRA rank for extraction */
  rank?: number
  /** Output path for extracted model */
  outputPath?: string
  /** Device */
  device?: string
}

/** Bridge configuration */
export interface AIToolkitBridgeConfig {
  /** Path to ai-toolkit installation */
  toolkitPath?: string
  /** Python executable path */
  pythonPath?: string
  /** Default output directory */
  defaultOutputDir?: string
  /** Default device */
  defaultDevice?: string
  /** Auto-detect toolkit path */
  autoDetect?: boolean
}

/** Status of the bridge */
export interface AIToolkitStatus {
  /** Whether ai-toolkit is installed */
  installed: boolean
  /** Path to ai-toolkit */
  toolkitPath: string | null
  /** Python version available */
  pythonVersion: string | null
  /** Whether CUDA/GPU is available */
  gpuAvailable: boolean
  /** Installed Python packages */
  packages: string[]
  /** Available model architectures */
  availableModels: string[]
  /** Error message if any */
  error?: string
}

/** Result of a job execution */
export interface JobResult {
  /** Whether the job succeeded */
  success: boolean
  /** Output path(s) */
  outputPaths: string[]
  /** Job duration in seconds */
  durationSec: number
  /** Any error message */
  error?: string
  /** Stdout from the job */
  stdout: string
  /** Stderr from the job */
  stderr: string
}

/** Active job tracking */
export interface ActiveJob {
  /** Unique job ID */
  id: string
  /** Job type */
  type: JobType
  /** Job name from config */
  name: string
  /** Config file path */
  configPath: string
  /** Start time */
  startTime: Date
  /** Child process reference */
  process: ChildProcess | null
  /** Current status */
  status: 'running' | 'completed' | 'failed' | 'stopped'
}

/** Model information */
export interface ModelInfo {
  /** Model identifier */
  id: string
  /** Display name */
  name: string
  /** Model type */
  type: 'image' | 'video' | 'edit' | 'experimental'
  /** HuggingFace URL */
  huggingFaceUrl: string
  /** Minimum VRAM in GB */
  minVRAMGB: number
  /** Supported features */
  features: string[]
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  SUPPORTED MODELS REGISTRY                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Registry of all supported models */
export const SUPPORTED_MODELS: ModelInfo[] = [
  // Image models
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'black-forest-labs/FLUX.2-dev',
    name: 'FLUX.2',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/black-forest-labs/FLUX.2-dev',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'black-forest-labs/FLUX.2-klein-base-4B',
    name: 'FLUX.2 Klein 4B',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B',
    minVRAMGB: 8,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'black-forest-labs/FLUX.2-klein-base-9B',
    name: 'FLUX.2 Klein 9B',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B',
    minVRAMGB: 16,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'ostris/Flex.1-alpha',
    name: 'Flex.1',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/ostris/Flex.1-alpha',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training', 'redux'],
  },
  {
    id: 'ostris/Flex.2-preview',
    name: 'Flex.2',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/ostris/Flex.2-preview',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'lodestones/Chroma1-Base',
    name: 'Chroma',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/lodestones/Chroma1-Base',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'Alpha-VLLM/Lumina-Image-2.0',
    name: 'Lumina2',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/Alpha-VLLM/Lumina-Image-2.0',
    minVRAMGB: 16,
    features: ['text-to-image', 'lora-training', 'full-fine-tune'],
  },
  {
    id: 'Qwen/Qwen-Image',
    name: 'Qwen-Image',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/Qwen/Qwen-Image',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'HiDream-ai/HiDream-I1-Full',
    name: 'HiDream',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/HiDream-ai/HiDream-I1-Full',
    minVRAMGB: 48,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'OmniGen2/OmniGen2',
    name: 'OmniGen2',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/OmniGen2/OmniGen2',
    minVRAMGB: 12,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'SDXL',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
    minVRAMGB: 8,
    features: ['text-to-image', 'lora-training'],
  },
  {
    id: 'stable-diffusion-v1-5/stable-diffusion-v1-5',
    name: 'SD 1.5',
    type: 'image',
    huggingFaceUrl: 'https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5',
    minVRAMGB: 4,
    features: ['text-to-image', 'lora-training'],
  },
  // Edit models
  {
    id: 'black-forest-labs/FLUX.1-Kontext-dev',
    name: 'FLUX Kontext',
    type: 'edit',
    huggingFaceUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev',
    minVRAMGB: 16,
    features: ['image-editing', 'instruction-edit', 'lora-training'],
  },
  {
    id: 'Qwen/Qwen-Image-Edit',
    name: 'Qwen Image Edit',
    type: 'edit',
    huggingFaceUrl: 'https://huggingface.co/Qwen/Qwen-Image-Edit',
    minVRAMGB: 16,
    features: ['image-editing', 'instruction-edit'],
  },
  {
    id: 'HiDream-ai/HiDream-E1-1',
    name: 'HiDream E1',
    type: 'edit',
    huggingFaceUrl: 'https://huggingface.co/HiDream-ai/HiDream-E1-1',
    minVRAMGB: 24,
    features: ['image-editing'],
  },
  // Video models
  {
    id: 'Wan-AI/Wan2.1-T2V-1.3B-Diffusers',
    name: 'Wan 2.1 1.3B',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers',
    minVRAMGB: 8,
    features: ['text-to-video', 'lora-training'],
  },
  {
    id: 'Wan-AI/Wan2.1-T2V-14B-Diffusers',
    name: 'Wan 2.1 14B',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Wan-AI/Wan2.1-T2V-14B-Diffusers',
    minVRAMGB: 24,
    features: ['text-to-video', 'lora-training'],
  },
  {
    id: 'Wan-AI/Wan2.1-I2V-14B-480P-Diffusers',
    name: 'Wan 2.1 I2V 480P',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P-Diffusers',
    minVRAMGB: 24,
    features: ['image-to-video'],
  },
  {
    id: 'Wan-AI/Wan2.2-T2V-A14B-Diffusers',
    name: 'Wan 2.2 14B',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers',
    minVRAMGB: 24,
    features: ['text-to-video', 'lora-training'],
  },
  {
    id: 'Lightricks/LTX-2',
    name: 'LTX-2',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Lightricks/LTX-2',
    minVRAMGB: 12,
    features: ['text-to-video'],
  },
  {
    id: 'Lightricks/LTX-2.3',
    name: 'LTX-2.3',
    type: 'video',
    huggingFaceUrl: 'https://huggingface.co/Lightricks/LTX-2.3',
    minVRAMGB: 12,
    features: ['text-to-video'],
  },
  // Experimental
  {
    id: 'lodestones/Zeta-Chroma',
    name: 'Zeta Chroma',
    type: 'experimental',
    huggingFaceUrl: 'https://huggingface.co/lodestones/Zeta-Chroma',
    minVRAMGB: 16,
    features: ['text-to-image'],
  },
]

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  AI TOOLKIT BRIDGE CLASS                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export class AIToolkitBridge {
  private config: Required<AIToolkitBridgeConfig>
  private activeJobs: Map<string, ActiveJob> = new Map()
  private jobCounter = 0

  constructor(config: AIToolkitBridgeConfig = {}) {
    this.config = {
      toolkitPath: config.toolkitPath ?? this.detectToolkitPath(),
      pythonPath: config.pythonPath ?? 'python3',
      defaultOutputDir: config.defaultOutputDir ?? join(process.cwd(), 'output'),
      defaultDevice: config.defaultDevice ?? 'cuda:0',
      autoDetect: config.autoDetect ?? true,
    }
  }

  // ── Status & Detection ──────────────────────────────────────────────────────

  /** Get the current status of the ai-toolkit installation */
  getStatus(): AIToolkitStatus {
    const status: AIToolkitStatus = {
      installed: false,
      toolkitPath: this.config.toolkitPath,
      pythonVersion: null,
      gpuAvailable: false,
      packages: [],
      availableModels: SUPPORTED_MODELS.map(m => m.id),
    }

    try {
      // Check Python
      const pyVersion = this.execPython(
        'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")',
      )
      status.pythonVersion = pyVersion.trim()

      // Check if toolkit path exists
      if (this.config.toolkitPath && existsSync(join(this.config.toolkitPath, 'run.py'))) {
        status.installed = true
      }

      // Check GPU
      try {
        const gpuCheck = this.execPython('import torch; print(torch.cuda.is_available())')
        status.gpuAvailable = gpuCheck.trim().toLowerCase() === 'true'
      } catch {
        status.gpuAvailable = false
      }
    } catch (e) {
      status.error = e instanceof Error ? e.message : String(e)
    }

    return status
  }

  /** Detect ai-toolkit installation path */
  private detectToolkitPath(): string {
    const candidates = [
      join(process.cwd(), 'ai-toolkit'),
      join(process.cwd(), '..', 'ai-toolkit'),
      join(process.env.HOME ?? '~', 'ai-toolkit'),
    ]
    for (const p of candidates) {
      if (existsSync(join(p, 'run.py'))) return p
    }
    return join(process.cwd(), 'ai-toolkit')
  }

  // ── Configuration Builders ──────────────────────────────────────────────────

  /**
   * Build a YAML config for image generation.
   * Returns the YAML string that can be saved and run with ai-toolkit.
   */
  buildGenerateConfig(opts: GenerateConfig): string {
    const width = opts.width ?? 1024
    const height = opts.height ?? 1024
    const seed = opts.seed ?? -1
    const guidanceScale = opts.guidanceScale ?? 7
    const steps = opts.steps ?? 20
    const ext = opts.outputFormat ?? '.png'
    const outputFolder = opts.outputFolder ?? join(this.config.defaultOutputDir, 'gen')
    const device = opts.device ?? this.config.defaultDevice
    const neg = opts.negativePrompt ?? ''
    const dtype = opts.dtype ?? 'bf16'

    const promptsYaml = opts.prompts.map(p => `          - "${this.escapeYaml(p)}"`).join('\n')

    return `---
job: generate
config:
  name: "generate_images"
  process:
    - type: to_folder
      output_folder: "${this.escapeYaml(outputFolder)}"
      device: ${device}
      generate:
        width: ${width}
        height: ${height}
        neg: "${this.escapeYaml(neg)}"
        seed: ${seed}
        guidance_scale: ${guidanceScale}
        sample_steps: ${steps}
        ext: "${ext}"
        prompts:
${promptsYaml}
      model:
        name_or_path: "${this.escapeYaml(opts.model)}"
        dtype: ${dtype}
`
  }

  /**
   * Build a YAML config for LoRA training.
   * Returns the YAML string for ai-toolkit.
   */
  buildTrainLoRAConfig(opts: LoRATrainConfig): string {
    const steps = opts.steps ?? 4000
    const lr = opts.lr ?? 1e-4
    const batchSize = opts.batchSize ?? 1
    const loraRank = opts.loraRank ?? 16
    const resolution = opts.resolution ?? 512
    const saveEvery = opts.saveEveryNSteps ?? 250
    const outputFolder = opts.outputFolder ?? join(this.config.defaultOutputDir, opts.name)
    const dtype = opts.dtype ?? 'bf16'
    const maxSaves = opts.maxStepSavesToKeep ?? 4
    const gradAccum = opts.gradientAccumulationSteps ?? 1
    const gradCheckpoint = opts.gradientCheckpointing ?? true
    const optimizer = opts.optimizer ?? 'adamw8bit'
    const captionExt = opts.captionExt ?? 'txt'
    const randomCrop = opts.randomCrop ?? false

    const samplesYaml = (opts.samplePrompts ?? [`a photo of ${opts.name}`])
      .map(p => `          - "${this.escapeYaml(p)}"`)
      .join('\n')

    return `---
job: train
config:
  name: "${this.escapeYaml(opts.name)}"
  process:
    - type: sd_trainer
      training_folder: "${this.escapeYaml(outputFolder)}"
      device: ${this.config.defaultDevice}
      trigger_word: "${this.escapeYaml(opts.name)}"
      network:
        type: "lora"
        linear: ${loraRank}
        linear_alpha: ${loraRank}
      save:
        dtype: ${dtype}
        save_every: ${saveEvery}
        max_step_saves_to_keep: ${maxSaves}
      datasets:
        - folder_path: "${this.escapeYaml(opts.datasetPath)}"
          caption_ext: "${captionExt}"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [${resolution}, ${resolution}]
          random_crop: ${randomCrop}
      train:
        batch_size: ${batchSize}
        steps: ${steps}
        gradient_accumulation_steps: ${gradAccum}
        train_unet: true
        train_text_encoder: false
        gradient_checkpointing: ${gradCheckpoint}
        noise_scheduler: "flowmatch"
        optimizer: "${optimizer}"
        lr: ${lr}
      model:
        name_or_path: "${this.escapeYaml(opts.model)}"
        dtype: ${dtype}
      sample:
        sampler: "flowmatch"
        sample_every: ${saveEvery}
        width: ${resolution}
        height: ${resolution}
        prompts:
${samplesYaml}
        neg: ""
        seed: 42
        walk_seed: true
        guidance_scale: 4
        sample_steps: 20
`
  }

  /**
   * Build a YAML config for model extraction (LoRA/LoCoN).
   */
  buildExtractConfig(opts: ExtractConfig): string {
    const device = opts.device ?? this.config.defaultDevice
    const rank = opts.rank ?? 16
    const outputPath = opts.outputPath ?? join(this.config.defaultOutputDir, 'extracted')

    return `---
job: extract
config:
  name: "extract_${opts.extractionType}"
  process:
    - type: "${opts.extractionType}"
      device: ${device}
      rank: ${rank}
      base_model: "${this.escapeYaml(opts.baseModel)}"
      extract_model: "${this.escapeYaml(opts.extractModel)}"
      output_folder: "${this.escapeYaml(outputPath)}"
`
  }

  // ── Job Execution ──────────────────────────────────────────────────────────

  /**
   * Save a config to disk and return the file path.
   */
  saveConfig(yamlContent: string, filename: string): string {
    const configDir = join(this.config.toolkitPath, 'config')
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }
    const configPath = join(configDir, filename)
    writeFileSync(configPath, yamlContent, 'utf-8')
    return configPath
  }

  /**
   * Run an ai-toolkit job asynchronously.
   * Returns a job ID that can be used to check status.
   */
  runJob(configPath: string): string {
    const jobId = `job-${++this.jobCounter}-${Date.now()}`

    // Parse the config to determine job type and name
    let jobType: JobType = 'generate'
    let jobName = 'unnamed'
    try {
      const content = readFileSync(configPath, 'utf-8')
      const typeMatch = content.match(/^job:\s*(\w+)/m)
      const nameMatch = content.match(/name:\s*"?([^"\n]+)"?/m)
      if (typeMatch) jobType = typeMatch[1] as JobType
      if (nameMatch) jobName = nameMatch[1]!.trim()
    } catch {
      // Ignore parse errors
    }

    const pythonCmd = this.config.pythonPath
    const runScript = join(this.config.toolkitPath, 'run.py')

    const child = spawn(pythonCmd, [runScript, configPath], {
      cwd: this.config.toolkitPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HF_HUB_ENABLE_HF_TRANSFER: '1',
        DISABLE_TELEMETRY: 'YES',
      },
    })

    const job: ActiveJob = {
      id: jobId,
      type: jobType,
      name: jobName,
      configPath,
      startTime: new Date(),
      process: child,
      status: 'running',
    }

    this.activeJobs.set(jobId, job)

    child.on('exit', code => {
      job.status = code === 0 ? 'completed' : 'failed'
      job.process = null
    })

    child.on('error', () => {
      job.status = 'failed'
      job.process = null
    })

    return jobId
  }

  /**
   * Run an ai-toolkit job synchronously (blocking).
   * Useful for quick generation tasks.
   */
  runJobSync(configPath: string, timeoutMs = 600_000): JobResult {
    const startTime = Date.now()
    const pythonCmd = this.config.pythonPath
    const runScript = join(this.config.toolkitPath, 'run.py')

    try {
      const stdout = execFileSync(pythonCmd, [runScript, configPath], {
        cwd: this.config.toolkitPath,
        timeout: timeoutMs,
        env: {
          ...process.env,
          HF_HUB_ENABLE_HF_TRANSFER: '1',
          DISABLE_TELEMETRY: 'YES',
        },
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024, // 50MB
      })

      return {
        success: true,
        outputPaths: this.parseOutputPaths(stdout),
        durationSec: (Date.now() - startTime) / 1000,
        stdout,
        stderr: '',
      }
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string; message?: string }
      return {
        success: false,
        outputPaths: [],
        durationSec: (Date.now() - startTime) / 1000,
        error: err.message ?? String(e),
        stdout: err.stdout ?? '',
        stderr: err.stderr ?? '',
      }
    }
  }

  /**
   * Stop a running job.
   */
  stopJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId)
    if (!job || !job.process) return false

    job.process.kill('SIGTERM')
    job.status = 'stopped'
    job.process = null
    return true
  }

  /**
   * Get the status of a specific job.
   */
  getJobStatus(jobId: string): ActiveJob | undefined {
    return this.activeJobs.get(jobId)
  }

  /**
   * Get all active/completed jobs.
   */
  getAllJobs(): ActiveJob[] {
    return Array.from(this.activeJobs.values())
  }

  // ── Model Registry ──────────────────────────────────────────────────────────

  /** Get all supported models */
  getSupportedModels(): ModelInfo[] {
    return [...SUPPORTED_MODELS]
  }

  /** Get models by type */
  getModelsByType(type: 'image' | 'video' | 'edit' | 'experimental'): ModelInfo[] {
    return SUPPORTED_MODELS.filter(m => m.type === type)
  }

  /** Find a model by ID */
  findModel(id: string): ModelInfo | undefined {
    return SUPPORTED_MODELS.find(m => m.id === id || m.name.toLowerCase() === id.toLowerCase())
  }

  /** Get models that support a specific feature */
  getModelsWithFeature(feature: string): ModelInfo[] {
    return SUPPORTED_MODELS.filter(m => m.features.includes(feature))
  }

  // ── Quick Generation Helpers ────────────────────────────────────────────────

  /**
   * Generate a complete image generation command string.
   * Returns the shell command to run directly.
   */
  getGenerateCommand(opts: GenerateConfig): string {
    const config = this.buildGenerateConfig(opts)
    const configPath = join('/tmp', `aitoolkit-gen-${Date.now()}.yaml`)
    return `cat > "${configPath}" << 'EOF'\n${config}\nEOF\ncd "${this.config.toolkitPath}" && "${this.config.pythonPath}" run.py "${configPath}"`
  }

  /**
   * Generate a complete training command string.
   */
  getTrainCommand(opts: LoRATrainConfig): string {
    const config = this.buildTrainLoRAConfig(opts)
    const configPath = join('/tmp', `aitoolkit-train-${Date.now()}.yaml`)
    return `cat > "${configPath}" << 'EOF'\n${config}\nEOF\ncd "${this.config.toolkitPath}" && "${this.config.pythonPath}" run.py "${configPath}"`
  }

  // ── Prompt Enhancement ──────────────────────────────────────────────────────

  /**
   * Enhance a simple prompt for better image generation results.
   * Adds quality boosters and style hints.
   */
  enhancePrompt(prompt: string, style?: 'photo' | 'art' | 'anime' | 'cinematic' | '3d'): string {
    const qualityBoosters = 'high quality, detailed, sharp focus'
    const styleMap: Record<string, string> = {
      photo: 'professional photograph, natural lighting, DSLR quality',
      art: 'digital art, concept art, artstation trending, masterpiece',
      anime: 'anime style, vibrant colors, detailed illustration',
      cinematic: 'cinematic lighting, dramatic atmosphere, film grain, wide angle',
      '3d': '3D render, octane render, unreal engine, volumetric lighting',
    }

    const styleHint = style ? (styleMap[style] ?? '') : ''
    return [prompt, qualityBoosters, styleHint].filter(Boolean).join(', ')
  }

  /**
   * Build a recommended negative prompt for a given style.
   */
  getRecommendedNegativePrompt(style?: 'photo' | 'art' | 'anime' | 'general'): string {
    const baseNeg = 'low quality, blurry, distorted, deformed, disfigured, bad anatomy'
    const styleNeg: Record<string, string> = {
      photo: 'cartoon, anime, illustration, painting, drawing, cgi, render',
      art: 'photo, photograph, realistic, blurry, noisy',
      anime: 'realistic, photo, photograph, 3d, western',
      general: 'watermark, text, signature, logo',
    }
    const extra = style ? (styleNeg[style] ?? '') : (styleNeg.general ?? '')
    return [baseNeg, extra].filter(Boolean).join(', ')
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  /** Execute a Python command and return stdout */
  private execPython(code: string): string {
    return execFileSync(this.config.pythonPath, ['-c', code], {
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim()
  }

  /** Escape a string for YAML */
  private escapeYaml(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
  }

  /** Parse output file paths from job stdout */
  private parseOutputPaths(stdout: string): string[] {
    const paths: string[] = []
    const lines = stdout.split('\n')
    for (const line of lines) {
      // Look for saved file references
      const match = line.match(
        /(?:saved?|output|wrote?|generated?)\s*(?:to|:)\s*(.+\.(png|jpg|jpeg|webp|mp4|safetensors|ckpt))/i,
      )
      if (match?.[1]) {
        paths.push(match[1].trim())
      }
    }
    return paths
  }

  /** Get the toolkit path */
  getToolkitPath(): string {
    return this.config.toolkitPath
  }

  /** Get the output directory */
  getOutputDir(): string {
    return this.config.defaultOutputDir
  }

  /** Ensure the output directory exists */
  ensureOutputDir(): void {
    const dir = this.config.defaultOutputDir
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * Get a human-readable summary of the bridge capabilities.
   */
  getSummary(): string {
    const imageModels = SUPPORTED_MODELS.filter(m => m.type === 'image').length
    const videoModels = SUPPORTED_MODELS.filter(m => m.type === 'video').length
    const editModels = SUPPORTED_MODELS.filter(m => m.type === 'edit').length
    return [
      `AI Toolkit Bridge — Diffusion Model Integration`,
      `├─ ${imageModels} image generation models (FLUX, SD, SDXL, Chroma, Lumina2, etc.)`,
      `├─ ${editModels} image editing models (Kontext, Qwen-Edit, HiDream-E1)`,
      `├─ ${videoModels} video generation models (Wan 2.1/2.2, LTX-2)`,
      `├─ LoRA training & fine-tuning`,
      `├─ Model extraction (LoRA/LoCoN)`,
      `├─ YAML config builder`,
      `├─ Prompt enhancement`,
      `└─ Toolkit path: ${this.config.toolkitPath}`,
    ].join('\n')
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  HELPER FUNCTIONS                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Quick helper to generate an image config YAML.
 */
export function quickImageConfig(prompt: string, model?: string): string {
  const bridge = new AIToolkitBridge()
  return bridge.buildGenerateConfig({
    prompts: [prompt],
    model: model ?? 'black-forest-labs/FLUX.1-dev',
  })
}

/**
 * Quick helper to generate a LoRA training config YAML.
 */
export function quickLoRAConfig(name: string, datasetPath: string, model?: string): string {
  const bridge = new AIToolkitBridge()
  return bridge.buildTrainLoRAConfig({
    name,
    model: model ?? 'black-forest-labs/FLUX.1-dev',
    datasetPath,
  })
}

/**
 * List all supported models in a formatted string.
 */
export function listModels(type?: 'image' | 'video' | 'edit' | 'experimental'): string {
  const models = type ? SUPPORTED_MODELS.filter(m => m.type === type) : SUPPORTED_MODELS
  return models
    .map(
      m =>
        `${m.name} (${m.id}) — ${m.type}, ${m.minVRAMGB}GB VRAM, features: ${m.features.join(', ')}`,
    )
    .join('\n')
}

/**
 * Get recommended model for a use case.
 */
export function recommendModel(
  useCase: 'fast-image' | 'quality-image' | 'video' | 'editing' | 'low-vram',
): ModelInfo {
  const recommendations: Record<string, string> = {
    'fast-image': 'stable-diffusion-v1-5/stable-diffusion-v1-5',
    'quality-image': 'black-forest-labs/FLUX.1-dev',
    video: 'Wan-AI/Wan2.1-T2V-1.3B-Diffusers',
    editing: 'black-forest-labs/FLUX.1-Kontext-dev',
    'low-vram': 'stable-diffusion-v1-5/stable-diffusion-v1-5',
  }
  const modelId = recommendations[useCase]
  if (!modelId) {
    throw new Error(`Unknown use case: ${useCase}`)
  }
  const model = SUPPORTED_MODELS.find(m => m.id === modelId)
  if (!model) {
    throw new Error(`Model not found in registry: ${modelId}`)
  }
  return model
}
