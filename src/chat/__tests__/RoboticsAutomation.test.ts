import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Robotics & Automation Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── ROS Framework ──────────────────────────────────────────────────────
  describe('ROS Framework', () => {
    it('explains ROS2 nodes topics and navigation', async () => {
      const r = await brain.chat(
        'How does ROS robot operating system ROS2 node topic service navigation work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ros|node|topic|service|navigation|slam|robot/)
    })

    it('covers SLAM and autonomous robot mapping', async () => {
      const r = await brain.chat(
        'How does autonomous robot SLAM simultaneous localization and mapping work in ROS?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /slam|localization|mapping|robot|ros|navigation|autonomous/,
      )
    })
  })

  // ── Robot Kinematics ───────────────────────────────────────────────────
  describe('Robot Kinematics', () => {
    it('explains forward and inverse kinematics', async () => {
      const r = await brain.chat(
        'How do forward inverse kinematics work for robotic arm joint control?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /kinematics|forward|inverse|joint|robotic\s*arm|trajectory|motion/,
      )
    })

    it('covers motion planning and MoveIt', async () => {
      const r = await brain.chat(
        'How does trajectory planning and MoveIt path optimization for robotics work?',
      )
      expect(r.text.toLowerCase()).toMatch(/trajectory|motion|planning|moveit|path|rrt|robot/)
    })
  })

  // ── Robot Perception ───────────────────────────────────────────────────
  describe('Robot Perception', () => {
    it('explains computer vision and LiDAR for robots', async () => {
      const r = await brain.chat(
        'How do computer vision robot perception LiDAR sensor fusion systems work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /vision|perception|lidar|sensor|point\s*cloud|depth|detection/,
      )
    })

    it('covers sensor fusion and Kalman filter', async () => {
      const r = await brain.chat(
        'How does sensor fusion camera depth point cloud processing work for robots?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /sensor\s*fusion|camera|depth|point\s*cloud|kalman|imu|calibr/,
      )
    })
  })

  // ── Industrial Automation ──────────────────────────────────────────────
  describe('Industrial Automation', () => {
    it('explains PLC and SCADA systems', async () => {
      const r = await brain.chat(
        'How do industrial automation PLC SCADA control ladder logic systems work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/plc|scada|industrial|ladder|logic|automation|control/)
    })

    it('covers industrial robot brands', async () => {
      const r = await brain.chat(
        'What are industrial robot programming languages for FANUC KUKA ABB?',
      )
      expect(r.text.toLowerCase()).toMatch(/industrial|robot|fanuc|kuka|abb|programming|universal/)
    })
  })

  // ── Drones & UAVs ─────────────────────────────────────────────────────
  describe('Drone & UAV Systems', () => {
    it('explains drone flight controllers and MAVLink', async () => {
      const r = await brain.chat(
        'How do drone UAV autonomous flight control ArduPilot PX4 MAVLink systems work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/drone|uav|ardupilot|px4|flight|mavlink|autonomous/)
    })
  })

  // ── Robot Simulation ───────────────────────────────────────────────────
  describe('Robot Simulation', () => {
    it('explains Gazebo and sim-to-real transfer', async () => {
      const r = await brain.chat(
        'How does robot simulation Gazebo Webots with sim to real transfer domain randomization work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /gazebo|simulation|sim.?to.?real|physics|robot|domain\s*random/,
      )
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - Robotics concepts', () => {
    it('has Robotics & Automation concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Robotics & Automation')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('robotics')
    })

    it('has ROS Framework concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('ROS Framework')
      expect(c).toBeDefined()
    })

    it('has Robot Kinematics concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Robot Kinematics')
      expect(c).toBeDefined()
    })

    it('has Robot Perception concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Robot Perception')
      expect(c).toBeDefined()
    })

    it('has Drone & UAV Systems concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Drone & UAV Systems')
      expect(c).toBeDefined()
    })

    it('Robotics has many related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Robotics & Automation')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('ROS is related to Robot Kinematics', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('ROS Framework')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Robot Kinematics')
    })

    it('Robot Perception is related to ROS', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Robot Perception')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('ROS Framework')
    })
  })
})
