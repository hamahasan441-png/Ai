/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PromptRegistry — Versioned prompt templates & model configurations          ║
 * ║  Enables reproducible behavior and prompt lifecycle management               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A versioned prompt template with {{variable}} placeholders. */
export interface PromptTemplate {
  readonly id: string
  readonly version: string
  readonly name: string
  readonly template: string
  readonly requiredVars: readonly string[]
  readonly optionalVars: Record<string, string>
  readonly category: string
  readonly createdAt: number
  readonly description: string
}

/** Model configuration snapshot. */
export interface ModelConfig {
  readonly id: string
  readonly version: string
  readonly model: string
  readonly temperature: number
  readonly maxTokens: number
  readonly topP: number
  readonly systemPromptId: string | null
  readonly parameters: Record<string, unknown>
  readonly createdAt: number
}

/** Result of rendering a prompt template. */
export interface RenderedPrompt {
  readonly text: string
  readonly templateId: string
  readonly templateVersion: string
  readonly variables: Record<string, string>
  readonly renderedAt: number
}

// ─── Registry ──────────────────────────────────────────────────────────────────

/**
 * Manages versioned prompt templates and model configs.
 * Tracks which version is active, supports rollback and serialization.
 */
export class PromptRegistry {
  private readonly templates: Map<string, PromptTemplate[]> = new Map()
  private readonly modelConfigs: Map<string, ModelConfig[]> = new Map()
  private readonly activeTemplates: Map<string, string> = new Map()
  private readonly activeConfigs: Map<string, string> = new Map()

  /** Register a new template version. First version auto-activates. */
  registerTemplate(template: PromptTemplate): void {
    const versions = this.templates.get(template.id) ?? []
    if (versions.some(v => v.version === template.version)) {
      throw new Error(`Template '${template.id}' version '${template.version}' already registered`)
    }
    versions.push(template)
    this.templates.set(template.id, versions)

    if (!this.activeTemplates.has(template.id)) {
      this.activeTemplates.set(template.id, template.version)
    }
  }

  /** Register a new model config version. First version auto-activates. */
  registerModelConfig(config: ModelConfig): void {
    const versions = this.modelConfigs.get(config.id) ?? []
    if (versions.some(v => v.version === config.version)) {
      throw new Error(`ModelConfig '${config.id}' version '${config.version}' already registered`)
    }
    versions.push(config)
    this.modelConfigs.set(config.id, versions)

    if (!this.activeConfigs.has(config.id)) {
      this.activeConfigs.set(config.id, config.version)
    }
  }

  /** Switch the active template version. */
  activateTemplate(id: string, version: string): void {
    const versions = this.templates.get(id)
    if (!versions?.some(v => v.version === version)) {
      throw new Error(`Template '${id}' version '${version}' not found`)
    }
    this.activeTemplates.set(id, version)
  }

  /** Switch the active model config version. */
  activateModelConfig(id: string, version: string): void {
    const versions = this.modelConfigs.get(id)
    if (!versions?.some(v => v.version === version)) {
      throw new Error(`ModelConfig '${id}' version '${version}' not found`)
    }
    this.activeConfigs.set(id, version)
  }

  getActiveTemplate(id: string): PromptTemplate | undefined {
    const ver = this.activeTemplates.get(id)
    if (!ver) return undefined
    return this.templates.get(id)?.find(v => v.version === ver)
  }

  getTemplate(id: string, version: string): PromptTemplate | undefined {
    return this.templates.get(id)?.find(v => v.version === version)
  }

  getTemplateVersions(id: string): readonly PromptTemplate[] {
    return this.templates.get(id) ?? []
  }

  getActiveModelConfig(id: string): ModelConfig | undefined {
    const ver = this.activeConfigs.get(id)
    if (!ver) return undefined
    return this.modelConfigs.get(id)?.find(v => v.version === ver)
  }

  getModelConfig(id: string, version: string): ModelConfig | undefined {
    return this.modelConfigs.get(id)?.find(v => v.version === version)
  }

  /** Render the active version of a template with the given variables. */
  render(templateId: string, variables: Record<string, string> = {}): RenderedPrompt {
    const template = this.getActiveTemplate(templateId)
    if (!template) throw new Error(`No active template for '${templateId}'`)

    for (const reqVar of template.requiredVars) {
      if (!(reqVar in variables)) {
        throw new Error(`Missing required variable '${reqVar}' for template '${templateId}'`)
      }
    }

    const allVars = { ...template.optionalVars, ...variables }

    let text = template.template
    for (const [key, value] of Object.entries(allVars)) {
      text = text.replaceAll(`{{${key}}}`, value)
    }

    return {
      text,
      templateId: template.id,
      templateVersion: template.version,
      variables: allVars,
      renderedAt: Date.now(),
    }
  }

  getTemplateIds(): string[] {
    return [...this.templates.keys()]
  }

  getModelConfigIds(): string[] {
    return [...this.modelConfigs.keys()]
  }

  /** Serialize for persistence / reproducibility. */
  serialize(): Record<string, unknown> {
    const templates: Record<string, PromptTemplate[]> = {}
    for (const [id, versions] of this.templates) {
      templates[id] = [...versions]
    }
    const configs: Record<string, ModelConfig[]> = {}
    for (const [id, versions] of this.modelConfigs) {
      configs[id] = [...versions]
    }
    return {
      templates,
      configs,
      activeTemplates: Object.fromEntries(this.activeTemplates),
      activeConfigs: Object.fromEntries(this.activeConfigs),
    }
  }

  /** Restore from serialized state. */
  deserialize(data: Record<string, unknown>): void {
    this.templates.clear()
    this.modelConfigs.clear()
    this.activeTemplates.clear()
    this.activeConfigs.clear()

    const templates = data.templates as Record<string, PromptTemplate[]> | undefined
    const configs = data.configs as Record<string, ModelConfig[]> | undefined
    const activeTemplates = data.activeTemplates as Record<string, string> | undefined
    const activeConfigs = data.activeConfigs as Record<string, string> | undefined

    if (templates) {
      for (const [id, versions] of Object.entries(templates)) {
        this.templates.set(id, [...versions])
      }
    }
    if (configs) {
      for (const [id, versions] of Object.entries(configs)) {
        this.modelConfigs.set(id, [...versions])
      }
    }
    if (activeTemplates) {
      for (const [id, version] of Object.entries(activeTemplates)) {
        this.activeTemplates.set(id, version)
      }
    }
    if (activeConfigs) {
      for (const [id, version] of Object.entries(activeConfigs)) {
        this.activeConfigs.set(id, version)
      }
    }
  }

  clear(): void {
    this.templates.clear()
    this.modelConfigs.clear()
    this.activeTemplates.clear()
    this.activeConfigs.clear()
  }
}
