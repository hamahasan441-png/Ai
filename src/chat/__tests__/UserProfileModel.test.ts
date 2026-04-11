import { describe, it, expect, beforeEach } from 'vitest'
import { UserProfileModel } from '../UserProfileModel.js'

describe('UserProfileModel', () => {
  let profile: UserProfileModel

  beforeEach(() => {
    profile = new UserProfileModel()
  })

  it('should create instance', () => {
    expect(profile).toBeInstanceOf(UserProfileModel)
  })

  it('should return unknown skill for new domain', () => {
    expect(profile.getSkillLevel('python')).toBe('unknown')
  })

  it('should update skill level from interaction', () => {
    profile.updateFromInteraction('What is Python? How to learn?', 'python')
    expect(profile.getSkillLevel('python')).toBe('beginner')
  })

  it('should detect expert indicators', () => {
    profile.updateFromInteraction(
      'How to optimize the architecture for scalability?',
      'system_design',
    )
    const level = profile.getSkillLevel('system_design')
    expect(['intermediate', 'expert']).toContain(level)
  })

  it('should track language preferences', () => {
    profile.updateFromInteraction('I use python and typescript daily', 'dev')
    const prefs = profile.getPreferences()
    expect(prefs.preferredLanguages).toContain('python')
    expect(prefs.preferredLanguages).toContain('typescript')
  })

  it('should track framework preferences', () => {
    profile.updateFromInteraction('Building with react and express', 'web')
    const prefs = profile.getPreferences()
    expect(prefs.preferredFrameworks).toContain('react')
    expect(prefs.preferredFrameworks).toContain('express')
  })

  it('should get full profile', () => {
    profile.updateFromInteraction('test', 'general')
    const p = profile.getProfile()
    expect(p.totalInteractions).toBe(1)
    expect(p.skillLevels).toBeDefined()
  })

  it('should adapt response for beginners', () => {
    profile.updateFromInteraction('What is a variable? Help me understand', 'python')
    const adapted = profile.adaptResponse('Variables store data.', 'python')
    expect(adapted).toContain('Tip')
  })

  it('should not add tip for non-beginners', () => {
    profile.updateFromInteraction('Optimize the architecture', 'python')
    const adapted = profile.adaptResponse('Use caching.', 'python')
    expect(adapted).not.toContain('Tip')
  })

  it('should serialize/deserialize', () => {
    profile.updateFromInteraction('test', 'general')
    const serialized = profile.serialize()
    const restored = UserProfileModel.deserialize(serialized)
    expect(restored.getStats().totalInteractions).toBe(1)
  })

  it('should track stats', () => {
    profile.updateFromInteraction('q1', 'a')
    profile.updateFromInteraction('q2', 'b')
    const stats = profile.getStats()
    expect(stats.updateCount).toBe(2)
    expect(stats.domainCount).toBe(2)
  })
})
