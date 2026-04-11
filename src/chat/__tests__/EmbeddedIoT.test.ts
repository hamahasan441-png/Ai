import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Embedded Systems & IoT Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Microcontroller Programming ─────────────────────────────────────────
  describe('Microcontroller Programming', () => {
    it('explains Arduino and ESP32 programming', async () => {
      const r = await brain.chat(
        'How do I program Arduino ESP32 microcontrollers with embedded systems firmware?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/arduino|esp32|stm32|microcontroller|firmware|embedded/)
    })

    it('covers RTOS concepts', async () => {
      const r = await brain.chat(
        'What is RTOS real-time operating system for embedded programming?',
      )
      expect(r.text.toLowerCase()).toMatch(/rtos|freertos|task|queue|real.?time|embedded/)
    })
  })

  // ── IoT Protocols ──────────────────────────────────────────────────────
  describe('IoT Protocols', () => {
    it('explains MQTT and CoAP IoT protocols', async () => {
      const r = await brain.chat(
        'How do IoT internet of things MQTT CoAP protocols work for smart devices?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mqtt|coap|iot|sensor|protocol|gateway/)
    })

    it('covers edge computing and IoT architecture', async () => {
      const r = await brain.chat('What is IoT edge computing fog architecture for sensor data?')
      expect(r.text.toLowerCase()).toMatch(/edge|iot|sensor|cloud|gateway|fog|computing/)
    })
  })

  // ── Embedded Peripherals ───────────────────────────────────────────────
  describe('Embedded Peripherals', () => {
    it('explains GPIO SPI I2C UART interfaces', async () => {
      const r = await brain.chat(
        'How do GPIO SPI I2C UART peripheral interfaces work in embedded systems?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/gpio|spi|i2c|uart|serial|bus|peripheral/)
    })

    it('covers ADC DAC PWM analog conversion', async () => {
      const r = await brain.chat('What are ADC DAC PWM analog digital conversion in embedded?')
      expect(r.text.toLowerCase()).toMatch(/adc|dac|pwm|analog|digital|duty|conversion/)
    })
  })

  // ── Embedded Linux ─────────────────────────────────────────────────────
  describe('Embedded Linux', () => {
    it('explains Yocto and Buildroot', async () => {
      const r = await brain.chat(
        'How do I build embedded Linux with Yocto Buildroot kernel for ARM?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/yocto|buildroot|embedded|linux|kernel|arm|device/)
    })
  })

  // ── Power Management & Hardware ────────────────────────────────────────
  describe('Embedded Power & Hardware', () => {
    it('explains power management and PCB design', async () => {
      const r = await brain.chat(
        'What is power management battery optimization for embedded hardware PCB design?',
      )
      expect(r.text.toLowerCase()).toMatch(/power|battery|sleep|pcb|design|embedded|hardware/)
    })
  })

  // ── TinyML & Edge AI ──────────────────────────────────────────────────
  describe('TinyML & Edge AI', () => {
    it('explains TinyML on microcontrollers', async () => {
      const r = await brain.chat(
        'How does TinyML machine learning work on microcontroller inference with TensorFlow Lite?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/tinyml|tensorflow|microcontroller|edge|inference|model/)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - Embedded/IoT concepts', () => {
    it('has Embedded Systems & IoT concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Embedded Systems & IoT')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('embedded')
    })

    it('has Microcontroller Programming concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Microcontroller Programming')
      expect(c).toBeDefined()
    })

    it('has IoT Protocols concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('IoT Protocols')
      expect(c).toBeDefined()
    })

    it('has TinyML & Edge AI concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('TinyML & Edge AI')
      expect(c).toBeDefined()
    })

    it('Embedded IoT has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Embedded Systems & IoT')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Microcontroller is related to Peripherals', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Microcontroller Programming')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Embedded Peripherals')
    })
  })
})
