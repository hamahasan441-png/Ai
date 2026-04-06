import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Mobile Development Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── React Native ──────────────────────────────────────────────────────────

  describe('React Native', () => {
    it('explains React Native app development basics', async () => {
      const r = await brain.chat('How does React Native app development work with Expo for cross-platform mobile?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/react\s*native|expo|cross-?platform|mobile|component/)
    })

    it('describes React Native navigation patterns', async () => {
      const r = await brain.chat('How does React Native app navigation and state management work?')
      expect(r.text.toLowerCase()).toMatch(/react\s*native|navigat|state|redux|zustand|stack|tab/)
    })

    it('covers React Native core components', async () => {
      const r = await brain.chat('What are the core React Native app components for mobile development?')
      expect(r.text.toLowerCase()).toMatch(/react\s*native|view|text|flatlist|scrollview|touchable|image/)
    })
  })

  // ── Flutter ───────────────────────────────────────────────────────────────

  describe('Flutter & Dart', () => {
    it('explains Flutter widget architecture', async () => {
      const r = await brain.chat('How does the Flutter widget architecture with Dart work for mobile apps?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/flutter|widget|dart|stateless|stateful|material/)
    })

    it('describes Flutter state management', async () => {
      const r = await brain.chat('How does Flutter widget state management with Provider or Riverpod work?')
      expect(r.text.toLowerCase()).toMatch(/flutter|state|provider|riverpod|bloc|setstate/)
    })

    it('covers Flutter layout and navigation', async () => {
      const r = await brain.chat('How does Flutter material design layout and navigation work?')
      expect(r.text.toLowerCase()).toMatch(/flutter|row|column|container|navigat|scaffold|material/)
    })
  })

  // ── iOS Swift ─────────────────────────────────────────────────────────────

  describe('iOS Swift Development', () => {
    it('explains SwiftUI declarative UI development', async () => {
      const r = await brain.chat('How does SwiftUI view and state management work for iOS app development?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/swiftui|ios|state|binding|view|declarative/)
    })

    it('describes iOS architecture patterns', async () => {
      const r = await brain.chat('What architecture patterns work best for iOS app development with Swift?')
      expect(r.text.toLowerCase()).toMatch(/ios|swift|mvc|mvvm|viper|uikit|swiftui|archit/)
    })
  })

  // ── Android Kotlin ────────────────────────────────────────────────────────

  describe('Android Kotlin Development', () => {
    it('explains Jetpack Compose for Android UI', async () => {
      const r = await brain.chat('How does Jetpack Compose Android UI development with Kotlin work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/jetpack\s*compose|kotlin|android|composable|material/)
    })

    it('describes Android architecture components', async () => {
      const r = await brain.chat('How do Kotlin Android Jetpack architecture components like ViewModel and Room work?')
      expect(r.text.toLowerCase()).toMatch(/android|kotlin|viewmodel|room|livedata|stateflow|hilt/)
    })
  })

  // ── Mobile Common Patterns ────────────────────────────────────────────────

  describe('Mobile Common Patterns', () => {
    it('explains mobile app state management approaches', async () => {
      const r = await brain.chat('What are the best mobile app state management patterns for cross-platform development?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/state|redux|zustand|provider|mobx|management|mobile/)
    })

    it('describes mobile push notification integration', async () => {
      const r = await brain.chat('How does mobile app push notification integration with Firebase work?')
      expect(r.text.toLowerCase()).toMatch(/push\s*notif|firebase|fcm|apns|notification|mobile/)
    })
  })

  // ── Testing & Deployment ──────────────────────────────────────────────────

  describe('Mobile Testing & Deployment', () => {
    it('explains mobile app testing strategies', async () => {
      const r = await brain.chat('What are mobile app testing automation strategies with Appium?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/test|mobile|unit|integration|appium|detox|espresso/)
    })

    it('describes Fastlane mobile CI/CD', async () => {
      const r = await brain.chat('How does Fastlane automate mobile CI/CD build and deployment?')
      expect(r.text.toLowerCase()).toMatch(/fastlane|build|deploy|testflight|play\s*store|app\s*store/)
    })

    it('covers app store submission process', async () => {
      const r = await brain.chat('How does mobile app deployment to the App Store and Google Play work?')
      expect(r.text.toLowerCase()).toMatch(/app\s*store|google\s*play|submit|review|deploy|distribut/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Mobile Development concepts', () => {
    it('has Mobile Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Mobile Development')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('software-engineering')
    })

    it('has React Native concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('React Native')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('mobile')
    })

    it('has Flutter & Dart concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Flutter & Dart')
      expect(concept).toBeDefined()
    })

    it('has iOS Swift Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('iOS Swift Development')
      expect(concept).toBeDefined()
    })

    it('has Android Kotlin Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Android Kotlin Development')
      expect(concept).toBeDefined()
    })

    it('Mobile Development has related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Mobile Development')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(4)
    })

    it('React Native is related to Flutter', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('React Native')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Flutter & Dart')
    })

    it('iOS is related to Android', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('iOS Swift Development')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Android Kotlin Development')
    })
  })
})
