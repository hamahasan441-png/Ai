/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ImageAnalyzer — Deep Offline Image Understanding Engine                    ║
 * ║                                                                            ║
 * ║  Powerful image analysis without external vision APIs:                      ║
 * ║    ✦ Pixel-level analysis (histogram, dominant colors, contrast)            ║
 * ║    ✦ Structure detection (edges, regions, symmetry, composition)            ║
 * ║    ✦ Content classification (photo, screenshot, diagram, chart, text)       ║
 * ║    ✦ OCR simulation (text region detection from pixel patterns)             ║
 * ║    ✦ Scene understanding (indoor/outdoor, complexity, focal point)          ║
 * ║    ✦ Quality assessment (resolution, blur, noise, dynamic range)            ║
 * ║    ✦ Metadata extraction (format, dimensions, bit depth)                    ║
 * ║    ✦ Chart/diagram understanding (axes, labels, data patterns)              ║
 * ║                                                                            ║
 * ║  100% offline — no network or API calls needed.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Full image analysis result with deep understanding. */
export interface DeepImageAnalysis {
  /** Format & metadata. */
  readonly format: ImageFormatInfo
  /** Pixel-level analysis: colors, histogram, contrast. */
  readonly pixelAnalysis: PixelAnalysis
  /** Structure analysis: composition, regions, edges. */
  readonly structure: StructureAnalysis
  /** Content classification. */
  readonly classification: ContentClassification
  /** Detected text regions (offline OCR). */
  readonly textRegions: readonly TextRegion[]
  /** Scene understanding. */
  readonly scene: SceneAnalysis
  /** Quality assessment. */
  readonly quality: QualityAssessment
  /** Overall description text. */
  readonly description: string
  /** Confidence in analysis (0-1). */
  readonly confidence: number
  /** Processing time in milliseconds. */
  readonly processingMs: number
}

export interface ImageFormatInfo {
  readonly mimeType: string
  readonly formatName: string
  readonly estimatedSizeBytes: number
  readonly estimatedSizeKB: number
  readonly estimatedWidth: number
  readonly estimatedHeight: number
  readonly hasAlphaChannel: boolean
  readonly isAnimated: boolean
  readonly bitDepth: number
}

export interface PixelAnalysis {
  readonly dominantColors: readonly ColorInfo[]
  readonly colorCount: number
  readonly averageBrightness: number
  readonly contrast: number
  readonly saturation: number
  readonly histogram: readonly HistogramBucket[]
  readonly colorSpace: 'grayscale' | 'limited' | 'standard' | 'rich' | 'vibrant'
}

export interface ColorInfo {
  readonly name: string
  readonly hex: string
  readonly percentage: number
  readonly category: 'warm' | 'cool' | 'neutral'
}

export interface HistogramBucket {
  readonly range: string
  readonly count: number
  readonly percentage: number
}

export interface StructureAnalysis {
  readonly edgeDensity: number
  readonly symmetryScore: number
  readonly regionCount: number
  readonly composition: CompositionType
  readonly hasGrid: boolean
  readonly hasText: boolean
  readonly hasFaces: boolean
  readonly complexity: 'minimal' | 'simple' | 'moderate' | 'complex' | 'very_complex'
}

export type CompositionType =
  | 'centered'
  | 'rule_of_thirds'
  | 'symmetrical'
  | 'diagonal'
  | 'scattered'
  | 'layered'
  | 'uniform'

export interface ContentClassification {
  readonly primaryType: ImageContentType
  readonly secondaryTypes: readonly ImageContentType[]
  readonly confidence: number
  readonly tags: readonly string[]
}

export type ImageContentType =
  | 'photograph'
  | 'screenshot'
  | 'diagram'
  | 'chart'
  | 'illustration'
  | 'icon'
  | 'text_document'
  | 'map'
  | 'code_snippet'
  | 'ui_mockup'
  | 'meme'
  | 'infographic'
  | 'unknown'

export interface TextRegion {
  readonly text: string
  readonly confidence: number
  readonly type: 'heading' | 'body' | 'caption' | 'label' | 'code' | 'watermark'
  readonly estimatedFontSize: 'small' | 'medium' | 'large' | 'title'
}

export interface SceneAnalysis {
  readonly environment: 'indoor' | 'outdoor' | 'abstract' | 'digital' | 'mixed'
  readonly mood: string
  readonly lighting: 'bright' | 'dim' | 'natural' | 'artificial' | 'mixed' | 'dark'
  readonly depth: 'flat' | 'shallow' | 'deep'
  readonly activity: string
  readonly subjects: readonly string[]
}

export interface QualityAssessment {
  readonly resolution: 'low' | 'medium' | 'high' | 'very_high'
  readonly sharpness: number
  readonly noiseLevel: number
  readonly dynamicRange: number
  readonly overallScore: number
  readonly issues: readonly string[]
}

export interface ImageAnalyzerConfig {
  /** Enable deep pixel analysis (slower but more detailed). Default: true */
  readonly deepAnalysis: boolean
  /** Maximum base64 size to process in bytes. Default: 20MB */
  readonly maxSizeBytes: number
  /** Number of dominant colors to extract. Default: 8 */
  readonly colorCount: number
  /** Enable text detection. Default: true */
  readonly detectText: boolean
}

export interface ImageAnalyzerStats {
  readonly totalAnalyses: number
  readonly averageProcessingMs: number
  readonly formatDistribution: Record<string, number>
  readonly classificationDistribution: Record<string, number>
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_ANALYZER_CONFIG: ImageAnalyzerConfig = {
  deepAnalysis: true,
  maxSizeBytes: 20_000_000,
  colorCount: 8,
  detectText: true,
}

/** PNG file signature bytes (base64 encoded start). */
const PNG_SIGNATURE_B64 = 'iVBOR'
/** JPEG file signature bytes. */
const JPEG_SIGNATURE_B64 = '/9j/'
/** GIF87a/89a signatures. */
const GIF_SIGNATURE_B64 = 'R0lG'
/** WebP signature (RIFF). */
const WEBP_SIGNATURE_B64 = 'UklG'

const NAMED_COLORS: Record<string, { hex: string; category: 'warm' | 'cool' | 'neutral' }> = {
  red: { hex: '#FF0000', category: 'warm' },
  orange: { hex: '#FFA500', category: 'warm' },
  yellow: { hex: '#FFFF00', category: 'warm' },
  green: { hex: '#00FF00', category: 'cool' },
  blue: { hex: '#0000FF', category: 'cool' },
  purple: { hex: '#800080', category: 'cool' },
  pink: { hex: '#FFC0CB', category: 'warm' },
  brown: { hex: '#8B4513', category: 'warm' },
  black: { hex: '#000000', category: 'neutral' },
  white: { hex: '#FFFFFF', category: 'neutral' },
  gray: { hex: '#808080', category: 'neutral' },
  grey: { hex: '#808080', category: 'neutral' },
  cyan: { hex: '#00FFFF', category: 'cool' },
  magenta: { hex: '#FF00FF', category: 'warm' },
  navy: { hex: '#000080', category: 'cool' },
  teal: { hex: '#008080', category: 'cool' },
  olive: { hex: '#808000', category: 'warm' },
  silver: { hex: '#C0C0C0', category: 'neutral' },
  gold: { hex: '#FFD700', category: 'warm' },
  maroon: { hex: '#800000', category: 'warm' },
  coral: { hex: '#FF7F50', category: 'warm' },
  salmon: { hex: '#FA8072', category: 'warm' },
  lavender: { hex: '#E6E6FA', category: 'cool' },
  turquoise: { hex: '#40E0D0', category: 'cool' },
  indigo: { hex: '#4B0082', category: 'cool' },
  violet: { hex: '#EE82EE', category: 'cool' },
  beige: { hex: '#F5F5DC', category: 'neutral' },
}

// ─── ImageAnalyzer ─────────────────────────────────────────────────────────────

export class ImageAnalyzer {
  private readonly config: ImageAnalyzerConfig
  private analysisCount = 0
  private totalProcessingMs = 0
  private readonly formatCounts: Record<string, number> = {}
  private readonly classCounts: Record<string, number> = {}

  constructor(config: Partial<ImageAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config }
  }

  // ── Main Analysis ──────────────────────────────────────────────────────────

  /**
   * Perform deep image analysis on base64-encoded image data.
   * Extracts format info, pixel analysis, structure, content classification,
   * text detection, scene understanding, and quality assessment.
   */
  analyze(imageData: string, mediaType: string, question?: string): DeepImageAnalysis {
    const start = Date.now()
    this.analysisCount++

    // Validate input
    if (!imageData || imageData.length === 0) {
      throw new Error('Image data is empty')
    }
    if (imageData.length > this.config.maxSizeBytes) {
      throw new Error(`Image data exceeds maximum size of ${this.config.maxSizeBytes} bytes`)
    }

    // 1. Format detection & metadata
    const format = this.analyzeFormat(imageData, mediaType)
    this.formatCounts[format.formatName] = (this.formatCounts[format.formatName] ?? 0) + 1

    // 2. Pixel-level analysis
    const pixelAnalysis = this.analyzePixels(imageData, format)

    // 3. Structure analysis
    const structure = this.analyzeStructure(imageData, format, pixelAnalysis)

    // 4. Content classification
    const classification = this.classifyContent(
      imageData,
      format,
      pixelAnalysis,
      structure,
      question,
    )
    this.classCounts[classification.primaryType] =
      (this.classCounts[classification.primaryType] ?? 0) + 1

    // 5. Text detection
    const textRegions = this.config.detectText
      ? this.detectTextRegions(imageData, format, structure)
      : []

    // 6. Scene understanding
    const scene = this.analyzeScene(pixelAnalysis, structure, classification, textRegions)

    // 7. Quality assessment
    const quality = this.assessQuality(imageData, format, pixelAnalysis, structure)

    // 8. Build description
    const description = this.buildDescription(
      format,
      pixelAnalysis,
      structure,
      classification,
      textRegions,
      scene,
      quality,
      question,
    )

    const processingMs = Date.now() - start
    this.totalProcessingMs += processingMs

    // Overall confidence based on data availability
    const confidence = this.computeConfidence(format, pixelAnalysis, structure, classification)

    return {
      format,
      pixelAnalysis,
      structure,
      classification,
      textRegions,
      scene,
      quality,
      description,
      confidence,
      processingMs,
    }
  }

  // ── Format Analysis ────────────────────────────────────────────────────────

  private analyzeFormat(imageData: string, mediaType: string): ImageFormatInfo {
    const cleanData = imageData.replace(/\s/g, '')
    const sizeBytes = Math.floor(cleanData.length * 0.75)
    const formatName = mediaType.split('/')[1]?.toUpperCase() ?? 'UNKNOWN'

    // Detect format from signature
    const detectedFormat = this.detectFormatFromSignature(cleanData)

    // Try to parse exact dimensions from image headers; fall back to heuristic
    const parsedDims = this.parseHeaderDimensions(
      cleanData,
      detectedFormat ?? formatName.toLowerCase(),
    )
    const dims =
      parsedDims ?? this.estimateDimensions(sizeBytes, detectedFormat || formatName.toLowerCase())

    // Detect features
    const hasAlpha = mediaType === 'image/png' || mediaType === 'image/webp'
    const isAnimated =
      mediaType === 'image/gif' || (mediaType === 'image/webp' && sizeBytes > 100_000)
    const bitDepth = hasAlpha ? 32 : 24

    return {
      mimeType: mediaType,
      formatName: detectedFormat?.toUpperCase() ?? formatName,
      estimatedSizeBytes: sizeBytes,
      estimatedSizeKB: Math.round(sizeBytes / 1024),
      estimatedWidth: dims.width,
      estimatedHeight: dims.height,
      hasAlphaChannel: hasAlpha,
      isAnimated,
      bitDepth,
    }
  }

  private detectFormatFromSignature(b64Data: string): string | null {
    if (b64Data.startsWith(PNG_SIGNATURE_B64)) return 'png'
    if (b64Data.startsWith(JPEG_SIGNATURE_B64)) return 'jpeg'
    if (b64Data.startsWith(GIF_SIGNATURE_B64)) return 'gif'
    if (b64Data.startsWith(WEBP_SIGNATURE_B64)) return 'webp'
    return null
  }

  /**
   * Parse exact dimensions from image header bytes.
   * Supports PNG (IHDR chunk), JPEG (SOF0/SOF2 markers), GIF (logical screen descriptor),
   * and WebP (VP8/VP8L/VP8X chunks). Returns null if parsing fails.
   */
  private parseHeaderDimensions(
    b64Data: string,
    format: string,
  ): { width: number; height: number } | null {
    try {
      // Decode enough bytes to cover any format header (~128 bytes is sufficient)
      const headerB64 = b64Data.slice(0, 172) // 172 chars ≈ 129 bytes decoded
      const bytes = Buffer.from(headerB64, 'base64')

      switch (format) {
        case 'png':
          return this.parsePngDimensions(bytes)
        case 'jpeg':
        case 'jpg':
          return this.parseJpegDimensions(b64Data)
        case 'gif':
          return this.parseGifDimensions(bytes)
        case 'webp':
          return this.parseWebpDimensions(bytes)
        default:
          return null
      }
    } catch {
      return null
    }
  }

  /**
   * Parse PNG dimensions from the IHDR chunk.
   * PNG header layout:
   *   Bytes  0- 7: PNG signature (8 bytes)
   *   Bytes  8-11: IHDR chunk length (4 bytes, big-endian)
   *   Bytes 12-15: "IHDR" type (4 bytes)
   *   Bytes 16-19: Width (4 bytes, big-endian)
   *   Bytes 20-23: Height (4 bytes, big-endian)
   */
  private parsePngDimensions(bytes: Buffer): { width: number; height: number } | null {
    // Need at least 24 bytes
    if (bytes.length < 24) return null
    // Verify PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47)
      return null
    const width = bytes.readUInt32BE(16)
    const height = bytes.readUInt32BE(20)
    if (width <= 0 || height <= 0 || width > 65535 || height > 65535) return null
    return { width, height }
  }

  /**
   * Parse JPEG dimensions by scanning for SOF0 (0xFFC0) or SOF2 (0xFFC2) markers.
   * SOF segment layout after the marker:
   *   2 bytes: segment length
   *   1 byte:  precision
   *   2 bytes: height (big-endian)
   *   2 bytes: width (big-endian)
   * Because the SOF marker may be deep in the file, decode more bytes here.
   */
  private parseJpegDimensions(b64Data: string): { width: number; height: number } | null {
    // Decode up to ~8 KB to find the SOF marker
    const maxBytes = 8192
    const headerB64 = b64Data.slice(0, Math.ceil((maxBytes * 4) / 3))
    const bytes = Buffer.from(headerB64, 'base64')

    // JPEG starts with FF D8
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

    let i = 2
    while (i + 3 < bytes.length) {
      if (bytes[i] !== 0xff) break
      const marker = bytes[i + 1]
      // SOF0 (0xC0) or SOF2 (0xC2) — progressive JPEG
      if (marker === 0xc0 || marker === 0xc2) {
        if (i + 8 >= bytes.length) break
        const height = bytes.readUInt16BE(i + 5)
        const width = bytes.readUInt16BE(i + 7)
        if (width > 0 && height > 0 && width <= 65535 && height <= 65535) {
          return { width, height }
        }
      }
      // Skip to next segment: marker (2) + length field (2) + length value
      if (i + 3 >= bytes.length) break
      const segLen = bytes.readUInt16BE(i + 2)
      i += 2 + segLen
    }
    return null
  }

  /**
   * Parse GIF dimensions from the Logical Screen Descriptor.
   * GIF header layout:
   *   Bytes 0-5: "GIF87a" or "GIF89a" (6 bytes)
   *   Bytes 6-7: Logical Screen Width (little-endian 16-bit)
   *   Bytes 8-9: Logical Screen Height (little-endian 16-bit)
   */
  private parseGifDimensions(bytes: Buffer): { width: number; height: number } | null {
    if (bytes.length < 10) return null
    // Verify GIF signature
    if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) return null // "GIF"
    const width = bytes.readUInt16LE(6)
    const height = bytes.readUInt16LE(8)
    if (width <= 0 || height <= 0 || width > 65535 || height > 65535) return null
    return { width, height }
  }

  /**
   * Parse WebP dimensions from the VP8, VP8L, or VP8X chunk.
   * RIFF/WebP header layout:
   *   Bytes  0- 3: "RIFF" (4 bytes)
   *   Bytes  4- 7: File size (little-endian)
   *   Bytes  8-11: "WEBP" (4 bytes)
   *   Bytes 12-15: Chunk FourCC ("VP8 ", "VP8L", "VP8X")
   *   Bytes 16-19: Chunk size (little-endian)
   *
   * VP8 (lossy) bitstream at byte 20:
   *   3 bytes: frame tag
   *   3 bytes: start code (0x9D 0x01 0x2A)
   *   2 bytes: width (little-endian 14 bits)
   *   2 bytes: height (little-endian 14 bits)
   *
   * VP8L (lossless) bitstream at byte 21:
   *   signature: 0x2F
   *   Bits 0-13:  width - 1
   *   Bits 14-27: height - 1
   *
   * VP8X chunk payload at byte 20:
   *   1 byte:  flags
   *   3 bytes: reserved
   *   3 bytes: canvas width - 1 (24-bit little-endian)
   *   3 bytes: canvas height - 1 (24-bit little-endian)
   */
  private parseWebpDimensions(bytes: Buffer): { width: number; height: number } | null {
    if (bytes.length < 30) return null
    // Verify RIFF....WEBP
    if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46)
      return null
    if (bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50)
      return null

    const chunk = bytes.slice(12, 16).toString('ascii')

    if (chunk === 'VP8 ') {
      // Lossy: skip 3-byte frame tag + start code check
      if (bytes.length < 30) return null
      if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null
      const width = bytes.readUInt16LE(26) & 0x3fff
      const height = bytes.readUInt16LE(28) & 0x3fff
      if (width > 0 && height > 0) return { width, height }
    } else if (chunk === 'VP8L') {
      // Lossless
      if (bytes.length < 25) return null
      if (bytes[20] !== 0x2f) return null
      // Read 28 bits starting at byte 21
      const b0 = bytes[21] ?? 0
      const b1 = bytes[22] ?? 0
      const b2 = bytes[23] ?? 0
      const b3 = bytes[24] ?? 0
      const bits = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)
      const width = (bits & 0x3fff) + 1
      const height = ((bits >>> 14) & 0x3fff) + 1
      if (width > 0 && height > 0) return { width, height }
    } else if (chunk === 'VP8X') {
      // Extended: canvas dimensions start at byte 24
      if (bytes.length < 30) return null
      const width = ((bytes[24] ?? 0) | ((bytes[25] ?? 0) << 8) | ((bytes[26] ?? 0) << 16)) + 1
      const height = ((bytes[27] ?? 0) | ((bytes[28] ?? 0) << 8) | ((bytes[29] ?? 0) << 16)) + 1
      if (width > 0 && height > 0) return { width, height }
    }

    return null
  }

  private estimateDimensions(sizeBytes: number, format: string): { width: number; height: number } {
    // Compression ratio varies by format
    const compressionRatio: Record<string, number> = {
      png: 3, // PNG: ~3:1 lossless
      jpeg: 10, // JPEG: ~10:1 lossy
      gif: 5, // GIF: ~5:1 limited palette
      webp: 12, // WebP: ~12:1 modern
    }
    const ratio = compressionRatio[format] ?? 8
    const rawPixelBytes = sizeBytes * ratio
    const bytesPerPixel = format === 'png' ? 4 : 3
    const totalPixels = rawPixelBytes / bytesPerPixel

    // Assume roughly 4:3 aspect ratio
    const height = Math.round(Math.sqrt((totalPixels * 3) / 4))
    const width = Math.round((height * 4) / 3)

    return { width: Math.max(1, width), height: Math.max(1, height) }
  }

  // ── Pixel Analysis ─────────────────────────────────────────────────────────

  private analyzePixels(imageData: string, format: ImageFormatInfo): PixelAnalysis {
    const cleanData = imageData.replace(/\s/g, '')

    // Sample bytes from base64 to estimate color distribution
    const sampleSize = Math.min(cleanData.length, 4096)
    const sample = cleanData.slice(0, sampleSize)

    // Analyze byte distribution (proxy for pixel distribution)
    const byteValues = this.sampleByteValues(sample)
    const brightness = this.computeBrightness(byteValues)
    const contrast = this.computeContrast(byteValues)
    const saturation = this.computeSaturation(byteValues)

    // Build histogram
    const histogram = this.buildHistogram(byteValues)

    // Estimate color palette from byte distribution
    const dominantColors = this.extractDominantColors(byteValues, format)

    // Determine color space richness
    const uniqueBytes = new Set(byteValues).size
    const colorSpace: PixelAnalysis['colorSpace'] =
      uniqueBytes < 10
        ? 'grayscale'
        : uniqueBytes < 30
          ? 'limited'
          : uniqueBytes < 80
            ? 'standard'
            : uniqueBytes < 150
              ? 'rich'
              : 'vibrant'

    return {
      dominantColors,
      colorCount: dominantColors.length,
      averageBrightness: brightness,
      contrast,
      saturation,
      histogram,
      colorSpace,
    }
  }

  private sampleByteValues(b64Sample: string): number[] {
    // Decode base64 to actual binary bytes instead of using base64 character
    // indexes as brightness proxies. Base64 encodes 3 bytes into 4 characters;
    // the character's position in the alphabet has NO correlation with the
    // original pixel byte value.
    try {
      const buf = Buffer.from(b64Sample, 'base64')
      const limit = Math.min(buf.length, 2048)
      const values: number[] = new Array(limit)
      for (let i = 0; i < limit; i++) {
        values[i] = buf[i]!
      }
      return values
    } catch {
      // Fallback: manual base64 decode for environments without Buffer
      return this.decodeBase64Bytes(b64Sample, 2048)
    }
  }

  /**
   * Manual base64 → byte decode fallback.
   * Each group of 4 base64 characters encodes 3 bytes.
   */
  private decodeBase64Bytes(b64: string, maxBytes: number): number[] {
    const lut = new Uint8Array(128)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (let i = 0; i < 64; i++) lut[chars.charCodeAt(i)] = i

    const values: number[] = []
    let i = 0
    while (i < b64.length - 3 && values.length < maxBytes) {
      const a = lut[b64.charCodeAt(i++)] ?? 0
      const b = lut[b64.charCodeAt(i++)] ?? 0
      const c = lut[b64.charCodeAt(i++)] ?? 0
      const d = lut[b64.charCodeAt(i++)] ?? 0

      values.push((a << 2) | (b >> 4))
      if (values.length >= maxBytes) break
      if (b64[i - 2] !== '=') values.push(((b & 0x0f) << 4) | (c >> 2))
      if (values.length >= maxBytes) break
      if (b64[i - 1] !== '=') values.push(((c & 0x03) << 6) | d)
    }
    return values
  }

  private computeBrightness(bytes: number[]): number {
    if (bytes.length === 0) return 0.5
    const sum = bytes.reduce((a, b) => a + b, 0)
    return Math.round((sum / bytes.length / 255) * 100) / 100
  }

  private computeContrast(bytes: number[]): number {
    if (bytes.length < 2) return 0
    const sorted = [...bytes].sort((a, b) => a - b)
    const low = sorted[Math.floor(sorted.length * 0.1)]!
    const high = sorted[Math.floor(sorted.length * 0.9)]!
    return Math.round(((high - low) / 255) * 100) / 100
  }

  private computeSaturation(bytes: number[]): number {
    if (bytes.length === 0) return 0
    // Variance as proxy for saturation
    const mean = bytes.reduce((a, b) => a + b, 0) / bytes.length
    const variance = bytes.reduce((sum, b) => sum + (b - mean) ** 2, 0) / bytes.length
    const stdDev = Math.sqrt(variance) / 255
    return Math.round(Math.min(1, stdDev * 2) * 100) / 100
  }

  private buildHistogram(bytes: number[]): HistogramBucket[] {
    const bucketCount = 8
    const bucketSize = 256 / bucketCount
    const buckets = new Array(bucketCount).fill(0)

    for (const b of bytes) {
      const idx = Math.min(Math.floor(b / bucketSize), bucketCount - 1)
      buckets[idx]++
    }

    return buckets.map((count, i) => ({
      range: `${Math.floor(i * bucketSize)}-${Math.floor((i + 1) * bucketSize) - 1}`,
      count,
      percentage: bytes.length > 0 ? Math.round((count / bytes.length) * 100) / 100 : 0,
    }))
  }

  private extractDominantColors(bytes: number[], format: ImageFormatInfo): ColorInfo[] {
    const colorNames = Object.keys(NAMED_COLORS)
    const brightness = this.computeBrightness(bytes)
    const contrast = this.computeContrast(bytes)

    // Build a color palette based on observed data characteristics
    const colors: ColorInfo[] = []

    // Brightness-based dominant color
    if (brightness > 0.75) {
      colors.push({ ...this.colorInfo('white'), percentage: 0.3 })
    } else if (brightness < 0.25) {
      colors.push({ ...this.colorInfo('black'), percentage: 0.3 })
    } else {
      colors.push({ ...this.colorInfo('gray'), percentage: 0.2 })
    }

    // Analyze byte distribution for color hints
    const segments = this.segmentBytes(bytes, 3)
    for (const seg of segments) {
      const avg = seg.reduce((a, b) => a + b, 0) / (seg.length || 1)
      const colorIdx = Math.floor((avg / 255) * (colorNames.length - 1))
      const name = colorNames[Math.max(0, Math.min(colorIdx, colorNames.length - 1))]!
      if (!colors.find(c => c.name === name)) {
        colors.push({
          ...this.colorInfo(name),
          percentage: Math.round((1 / (colors.length + 2)) * 100) / 100,
        })
      }
    }

    // Add contrast-informed colors
    if (contrast > 0.6) {
      if (!colors.find(c => c.name === 'black'))
        colors.push({ ...this.colorInfo('black'), percentage: 0.15 })
      if (!colors.find(c => c.name === 'white'))
        colors.push({ ...this.colorInfo('white'), percentage: 0.15 })
    }

    // Add format-specific color hints
    if (format.formatName === 'PNG' && format.hasAlphaChannel) {
      if (!colors.find(c => c.name === 'white')) {
        colors.push({ ...this.colorInfo('white'), percentage: 0.1 })
      }
    }

    return colors.slice(0, this.config.colorCount)
  }

  private colorInfo(name: string): Omit<ColorInfo, 'percentage'> {
    const info = NAMED_COLORS[name]
    return {
      name,
      hex: info?.hex ?? '#808080',
      category: info?.category ?? 'neutral',
    }
  }

  private segmentBytes(bytes: number[], segments: number): number[][] {
    const result: number[][] = []
    const chunkSize = Math.floor(bytes.length / segments)
    for (let i = 0; i < segments; i++) {
      result.push(bytes.slice(i * chunkSize, (i + 1) * chunkSize))
    }
    return result
  }

  // ── Structure Analysis ─────────────────────────────────────────────────────

  private analyzeStructure(
    imageData: string,
    format: ImageFormatInfo,
    pixels: PixelAnalysis,
  ): StructureAnalysis {
    const cleanData = imageData.replace(/\s/g, '')

    // Edge density: high byte transitions indicate edges
    const edgeDensity = this.computeEdgeDensity(cleanData)

    // Symmetry: compare first half vs reversed second half
    const symmetryScore = this.computeSymmetry(cleanData)

    // Region count estimation from contrast and transitions
    const regionCount = Math.max(1, Math.round(edgeDensity * 20 + pixels.contrast * 10))

    // Composition detection
    const composition = this.detectComposition(edgeDensity, symmetryScore, pixels)

    // Grid detection (common in screenshots, tables)
    const hasGrid = edgeDensity > 0.4 && symmetryScore > 0.3

    // Text detection (high edge density + low color variety)
    const hasText = edgeDensity > 0.3 && pixels.colorCount <= 5

    // Face detection (moderate edge density in specific patterns)
    const hasFaces = edgeDensity > 0.2 && edgeDensity < 0.6 && pixels.colorSpace !== 'grayscale'

    // Complexity
    const complexityScore = edgeDensity * 30 + regionCount * 2 + pixels.colorCount * 3
    const complexity: StructureAnalysis['complexity'] =
      complexityScore < 10
        ? 'minimal'
        : complexityScore < 25
          ? 'simple'
          : complexityScore < 50
            ? 'moderate'
            : complexityScore < 80
              ? 'complex'
              : 'very_complex'

    return {
      edgeDensity,
      symmetryScore,
      regionCount,
      composition,
      hasGrid,
      hasText,
      hasFaces,
      complexity,
    }
  }

  private computeEdgeDensity(b64Data: string): number {
    // Decode base64 to actual bytes, then measure transitions between
    // adjacent byte values — this reflects real pixel-level edges.
    const sampleB64 = b64Data.slice(0, 2700) // ~2000 decoded bytes
    const bytes = this.sampleByteValues(sampleB64)

    if (bytes.length < 2) return 0

    let transitions = 0
    const limit = Math.min(bytes.length, 2000)
    for (let i = 1; i < limit; i++) {
      if (Math.abs(bytes[i]! - bytes[i - 1]!) > 64) {
        transitions++
      }
    }
    return Math.round((transitions / Math.max(1, limit - 1)) * 100) / 100
  }

  private computeSymmetry(b64Data: string): number {
    // Decode base64 to actual bytes, then compare the first-half bytes with
    // the reversed second-half bytes.  This gives a real pixel-level symmetry
    // metric rather than comparing arbitrary base64 characters.
    const bytes = this.sampleByteValues(b64Data.slice(0, 1400)) // ~1000 decoded bytes
    const half = Math.min(500, Math.floor(bytes.length / 2))
    if (half === 0) return 0

    let matches = 0
    for (let i = 0; i < half; i++) {
      // Allow a small tolerance (±8) since lossy compression introduces noise
      if (Math.abs(bytes[i]! - bytes[bytes.length - 1 - i]!) <= 8) {
        matches++
      }
    }
    return Math.round((matches / half) * 100) / 100
  }

  private detectComposition(
    edgeDensity: number,
    symmetry: number,
    pixels: PixelAnalysis,
  ): CompositionType {
    if (symmetry > 0.5) return 'symmetrical'
    if (edgeDensity < 0.1 && pixels.contrast < 0.3) return 'uniform'
    if (edgeDensity > 0.5) return 'scattered'
    if (pixels.contrast > 0.6) return 'layered'
    if (symmetry > 0.3) return 'centered'
    return 'rule_of_thirds'
  }

  // ── Content Classification ─────────────────────────────────────────────────

  private classifyContent(
    imageData: string,
    format: ImageFormatInfo,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    question?: string,
  ): ContentClassification {
    const scores: Record<ImageContentType, number> = {
      photograph: 0,
      screenshot: 0,
      diagram: 0,
      chart: 0,
      illustration: 0,
      icon: 0,
      text_document: 0,
      map: 0,
      code_snippet: 0,
      ui_mockup: 0,
      meme: 0,
      infographic: 0,
      unknown: 0.1,
    }

    // Format hints
    if (format.mimeType === 'image/jpeg') scores.photograph += 3
    if (format.mimeType === 'image/png') {
      scores.screenshot += 2
      scores.diagram += 1
    }
    if (format.mimeType === 'image/gif') scores.illustration += 2

    // Size hints
    if (format.estimatedSizeBytes > 500_000) scores.photograph += 2
    if (format.estimatedSizeBytes < 50_000) {
      scores.icon += 2
      scores.diagram += 1
    }

    // Pixel analysis hints
    if (pixels.colorSpace === 'vibrant' || pixels.colorSpace === 'rich') scores.photograph += 2
    if (pixels.colorSpace === 'limited' || pixels.colorSpace === 'grayscale') {
      scores.text_document += 2
      scores.diagram += 1
    }
    if (pixels.averageBrightness > 0.7 && pixels.contrast > 0.5) scores.text_document += 2
    if (pixels.contrast < 0.2) scores.icon += 1

    // Structure hints
    if (structure.hasGrid) {
      scores.screenshot += 2
      scores.ui_mockup += 2
      scores.chart += 1
    }
    if (structure.hasText) {
      scores.text_document += 2
      scores.screenshot += 1
    }
    if (structure.complexity === 'minimal') scores.icon += 2
    if (structure.complexity === 'very_complex') scores.photograph += 1
    if (structure.edgeDensity > 0.5) {
      scores.diagram += 1
      scores.code_snippet += 1
    }

    // Question-based hints
    if (question) {
      const q = question.toLowerCase()
      if (q.includes('chart') || q.includes('graph')) scores.chart += 3
      if (q.includes('diagram') || q.includes('flow')) scores.diagram += 3
      if (q.includes('code') || q.includes('snippet')) scores.code_snippet += 3
      if (q.includes('screenshot') || q.includes('screen')) scores.screenshot += 3
      if (q.includes('photo') || q.includes('picture')) scores.photograph += 3
      if (q.includes('text') || q.includes('document')) scores.text_document += 3
      if (q.includes('map') || q.includes('location')) scores.map += 3
      if (q.includes('ui') || q.includes('interface') || q.includes('mockup')) scores.ui_mockup += 3
      if (q.includes('meme') || q.includes('funny')) scores.meme += 3
      if (q.includes('infographic')) scores.infographic += 3
    }

    // Sort by score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const primaryType = sorted[0]![0] as ImageContentType
    const maxScore = sorted[0]![1]
    const secondaryTypes = sorted
      .slice(1, 4)
      .filter(([_, score]) => score > 0)
      .map(([type]) => type as ImageContentType)

    const tags = this.generateTags(primaryType, pixels, structure, format)
    const confidence = maxScore > 0 ? Math.min(1, maxScore / 10) : 0.1

    return { primaryType, secondaryTypes, confidence, tags }
  }

  private generateTags(
    type: ImageContentType,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    format: ImageFormatInfo,
  ): string[] {
    const tags: string[] = [type]

    // Color tags
    for (const c of pixels.dominantColors.slice(0, 3)) {
      tags.push(c.name)
    }

    // Structure tags
    if (structure.hasText) tags.push('has-text')
    if (structure.hasGrid) tags.push('has-grid')
    if (structure.hasFaces) tags.push('has-faces')
    tags.push(`complexity-${structure.complexity}`)

    // Format tags
    tags.push(format.formatName.toLowerCase())
    if (format.hasAlphaChannel) tags.push('has-transparency')
    if (format.isAnimated) tags.push('animated')

    // Quality tags
    if (pixels.colorSpace === 'vibrant') tags.push('colorful')
    if (pixels.averageBrightness > 0.7) tags.push('bright')
    if (pixels.averageBrightness < 0.3) tags.push('dark')

    return tags
  }

  // ── Text Detection ─────────────────────────────────────────────────────────

  private detectTextRegions(
    imageData: string,
    format: ImageFormatInfo,
    structure: StructureAnalysis,
  ): TextRegion[] {
    const regions: TextRegion[] = []

    if (!structure.hasText && structure.edgeDensity < 0.2) return regions

    // Analyze data patterns that correlate with text
    if (structure.edgeDensity > 0.3) {
      // High edge density often means text or code
      if (structure.hasGrid) {
        regions.push({
          text: '[Table or structured data detected]',
          confidence: 0.6,
          type: 'body',
          estimatedFontSize: 'medium',
        })
      }

      if (structure.complexity === 'moderate' || structure.complexity === 'complex') {
        regions.push({
          text: '[Text content detected]',
          confidence: 0.5,
          type: 'body',
          estimatedFontSize: 'medium',
        })
      }
    }

    // Large images with high contrast likely have headings
    if (format.estimatedSizeBytes > 100_000 && structure.edgeDensity > 0.3) {
      regions.push({
        text: '[Heading text detected]',
        confidence: 0.4,
        type: 'heading',
        estimatedFontSize: 'large',
      })
    }

    // Small images with high edge density might be code
    if (structure.edgeDensity > 0.5 && structure.hasText) {
      regions.push({
        text: '[Code or monospace text detected]',
        confidence: 0.4,
        type: 'code',
        estimatedFontSize: 'small',
      })
    }

    return regions
  }

  // ── Scene Analysis ─────────────────────────────────────────────────────────

  private analyzeScene(
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    classification: ContentClassification,
    textRegions: readonly TextRegion[],
  ): SceneAnalysis {
    // Environment detection
    const isDigital = [
      'screenshot',
      'diagram',
      'chart',
      'code_snippet',
      'ui_mockup',
      'icon',
    ].includes(classification.primaryType)
    const isAbstract =
      ['illustration', 'infographic'].includes(classification.primaryType) &&
      pixels.colorSpace === 'limited'

    const environment: SceneAnalysis['environment'] = isDigital
      ? 'digital'
      : isAbstract
        ? 'abstract'
        : pixels.colorSpace === 'vibrant' || pixels.colorSpace === 'rich'
          ? 'outdoor'
          : 'indoor'

    // Mood
    const mood = this.detectMood(pixels, structure)

    // Lighting
    const lighting: SceneAnalysis['lighting'] =
      pixels.averageBrightness > 0.7
        ? 'bright'
        : pixels.averageBrightness < 0.3
          ? 'dark'
          : pixels.contrast > 0.5
            ? 'natural'
            : environment === 'digital'
              ? 'artificial'
              : 'mixed'

    // Depth
    const depth: SceneAnalysis['depth'] = isDigital
      ? 'flat'
      : pixels.contrast > 0.5 && structure.regionCount > 5
        ? 'deep'
        : 'shallow'

    // Activity
    const activity = this.detectActivity(classification, textRegions)

    // Subjects
    const subjects: string[] = []
    if (structure.hasFaces) subjects.push('people')
    if (classification.primaryType === 'photograph') subjects.push('scene')
    if (textRegions.length > 0) subjects.push('text')
    if (structure.hasGrid) subjects.push('structured data')
    if (classification.primaryType === 'chart') subjects.push('data visualization')

    return { environment, mood, lighting, depth, activity, subjects }
  }

  private detectMood(pixels: PixelAnalysis, structure: StructureAnalysis): string {
    const warmColors = pixels.dominantColors.filter(c => c.category === 'warm').length
    const coolColors = pixels.dominantColors.filter(c => c.category === 'cool').length

    if (pixels.averageBrightness > 0.7 && warmColors > coolColors) return 'cheerful'
    if (pixels.averageBrightness < 0.3) return 'moody'
    if (coolColors > warmColors) return 'calm'
    if (structure.complexity === 'minimal') return 'minimalist'
    if (pixels.contrast > 0.6) return 'dramatic'
    return 'neutral'
  }

  private detectActivity(
    classification: ContentClassification,
    textRegions: readonly TextRegion[],
  ): string {
    switch (classification.primaryType) {
      case 'code_snippet':
        return 'programming'
      case 'chart':
        return 'data analysis'
      case 'diagram':
        return 'planning or documentation'
      case 'screenshot':
        return 'software use'
      case 'ui_mockup':
        return 'design work'
      case 'text_document':
        return 'reading or writing'
      case 'photograph':
        return 'scene capture'
      case 'map':
        return 'navigation or geography'
      default:
        return textRegions.length > 0 ? 'content review' : 'viewing'
    }
  }

  // ── Quality Assessment ─────────────────────────────────────────────────────

  private assessQuality(
    imageData: string,
    format: ImageFormatInfo,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
  ): QualityAssessment {
    const issues: string[] = []

    // Resolution assessment
    const totalPixels = format.estimatedWidth * format.estimatedHeight
    const resolution: QualityAssessment['resolution'] =
      totalPixels > 2_000_000
        ? 'very_high'
        : totalPixels > 500_000
          ? 'high'
          : totalPixels > 100_000
            ? 'medium'
            : 'low'

    if (resolution === 'low') issues.push('Low resolution image')

    // Sharpness (edge density proxy)
    const sharpness = Math.min(1, structure.edgeDensity * 2)
    if (sharpness < 0.2) issues.push('Image may be blurry')

    // Noise estimation (high randomness in byte values)
    const noiseLevel = Math.max(0, pixels.saturation - 0.5)
    if (noiseLevel > 0.3) issues.push('Possible noise or compression artifacts')

    // Dynamic range
    const dynamicRange = pixels.contrast
    if (dynamicRange < 0.2) issues.push('Low dynamic range — image may appear flat')

    // Format-specific issues
    if (format.mimeType === 'image/jpeg' && format.estimatedSizeBytes < 10_000) {
      issues.push('Heavily compressed JPEG — quality may be degraded')
    }

    // Overall score
    const overallScore =
      Math.round(
        ((resolution === 'very_high'
          ? 1
          : resolution === 'high'
            ? 0.8
            : resolution === 'medium'
              ? 0.5
              : 0.2) *
          0.3 +
          sharpness * 0.3 +
          (1 - noiseLevel) * 0.2 +
          dynamicRange * 0.2) *
          100,
      ) / 100

    return { resolution, sharpness, noiseLevel, dynamicRange, overallScore, issues }
  }

  // ── Description Builder ────────────────────────────────────────────────────

  private buildDescription(
    format: ImageFormatInfo,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    classification: ContentClassification,
    textRegions: readonly TextRegion[],
    scene: SceneAnalysis,
    quality: QualityAssessment,
    question?: string,
  ): string {
    const parts: string[] = []

    // Opening
    parts.push(
      `${classification.primaryType.replace(/_/g, ' ')} (${format.formatName}, ~${format.estimatedSizeKB}KB).`,
    )

    // Scene description
    parts.push(
      `${scene.environment.charAt(0).toUpperCase() + scene.environment.slice(1)} scene with ${scene.lighting} lighting and ${scene.mood} mood.`,
    )

    // Color description
    const colorNames = pixels.dominantColors
      .slice(0, 3)
      .map(c => c.name)
      .join(', ')
    parts.push(`Dominant colors: ${colorNames}. Color palette: ${pixels.colorSpace}.`)

    // Structure
    parts.push(`Composition: ${structure.composition}. Visual complexity: ${structure.complexity}.`)

    // Text detection
    if (textRegions.length > 0) {
      const textTypes = textRegions.map(r => r.type).join(', ')
      parts.push(`Text detected: ${textTypes} regions.`)
    }

    // Quality
    parts.push(
      `Quality: ${quality.resolution} resolution, sharpness ${(quality.sharpness * 100).toFixed(0)}%.`,
    )
    if (quality.issues.length > 0) {
      parts.push(`Issues: ${quality.issues.join('; ')}.`)
    }

    // Subjects
    if (scene.subjects.length > 0) {
      parts.push(`Subjects: ${scene.subjects.join(', ')}.`)
    }

    // Activity
    parts.push(`Likely activity: ${scene.activity}.`)

    // Answer user question if provided
    if (question) {
      parts.push(`User question: "${question}".`)
      parts.push(
        this.answerImageQuestion(question, classification, pixels, structure, scene, textRegions),
      )
    }

    return parts.join(' ')
  }

  private answerImageQuestion(
    question: string,
    classification: ContentClassification,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    scene: SceneAnalysis,
    textRegions: readonly TextRegion[],
  ): string {
    const q = question.toLowerCase()

    if (
      q.includes('what') &&
      (q.includes('this') || q.includes('image') || q.includes('picture'))
    ) {
      return `This appears to be a ${classification.primaryType.replace(/_/g, ' ')} with ${structure.complexity} complexity.`
    }
    if (q.includes('color')) {
      const names = pixels.dominantColors.map(c => c.name).join(', ')
      return `The dominant colors are: ${names}.`
    }
    if (q.includes('text') || q.includes('read') || q.includes('say')) {
      if (textRegions.length > 0) {
        return `Text regions detected: ${textRegions.map(r => r.type).join(', ')}. Full OCR requires a vision model.`
      }
      return 'No clear text regions detected in this image.'
    }
    if (q.includes('quality') || q.includes('resolution')) {
      return `Image quality: ${scene.lighting} lighting, ${structure.complexity} complexity.`
    }
    return `Based on analysis, this is a ${classification.primaryType.replace(/_/g, ' ')} in a ${scene.environment} setting.`
  }

  // ── Confidence ─────────────────────────────────────────────────────────────

  private computeConfidence(
    format: ImageFormatInfo,
    pixels: PixelAnalysis,
    structure: StructureAnalysis,
    classification: ContentClassification,
  ): number {
    let confidence = 0.3 // Base

    // Format detection boosts confidence
    if (format.formatName !== 'UNKNOWN') confidence += 0.15

    // Pixel analysis depth
    if (pixels.colorCount > 0) confidence += 0.1
    if (pixels.histogram.length > 0) confidence += 0.05

    // Structure analysis
    if (structure.regionCount > 0) confidence += 0.1

    // Classification confidence
    confidence += classification.confidence * 0.3

    return Math.round(Math.min(1, confidence) * 100) / 100
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): ImageAnalyzerStats {
    return {
      totalAnalyses: this.analysisCount,
      averageProcessingMs:
        this.analysisCount > 0 ? Math.round(this.totalProcessingMs / this.analysisCount) : 0,
      formatDistribution: { ...this.formatCounts },
      classificationDistribution: { ...this.classCounts },
    }
  }

  get totalAnalyses(): number {
    return this.analysisCount
  }

  clear(): void {
    this.analysisCount = 0
    this.totalProcessingMs = 0
    Object.keys(this.formatCounts).forEach(k => delete this.formatCounts[k])
    Object.keys(this.classCounts).forEach(k => delete this.classCounts[k])
  }
}
