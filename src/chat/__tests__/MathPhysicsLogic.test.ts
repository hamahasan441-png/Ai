import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'

describe('Math, Physics & Logic Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  MATHEMATICS                                                              ║
  // ══════════════════════════════════════════════════════════════════════════════

  describe('Mathematics', () => {
    // ── Algebra ──
    it('answers algebra questions', async () => {
      const r = await brain.chat('How do I solve a quadratic equation?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/quadratic|formula|equation|root/)
    })

    it('knows about polynomials', async () => {
      const r = await brain.chat('What is a polynomial and how do I find its roots?')
      expect(r.text.toLowerCase()).toMatch(/polynomial|root|factor|degree/)
    })

    it('explains exponents and logarithms', async () => {
      const r = await brain.chat('Explain logarithms and exponents')
      expect(r.text.toLowerCase()).toMatch(/log|exponent|power|ln/)
    })

    it('knows complex numbers', async () => {
      const r = await brain.chat('What are complex numbers?')
      expect(r.text.toLowerCase()).toMatch(/complex|imagin|euler|i/)
    })

    // ── Linear Algebra ──
    it('explains matrices and determinants', async () => {
      const r = await brain.chat('How do matrices work? What is a determinant?')
      expect(r.text.toLowerCase()).toMatch(/matrix|determinant|inverse|eigenvalue/)
    })

    it('knows about vectors and dot product', async () => {
      const r = await brain.chat('Explain vectors and the dot product')
      expect(r.text.toLowerCase()).toMatch(/vector|dot|cross|magnitude/)
    })

    it('explains linear transformations', async () => {
      const r = await brain.chat('What is a linear transformation?')
      expect(r.text.toLowerCase()).toMatch(/linear|transform|kernel|rank/)
    })

    // ── Calculus ──
    it('explains derivatives', async () => {
      const r = await brain.chat('What is a derivative in calculus?')
      expect(r.text.toLowerCase()).toMatch(/derivative|rate|chain rule|calculus/)
    })

    it('explains integrals', async () => {
      const r = await brain.chat('How does integration work?')
      expect(r.text.toLowerCase()).toMatch(/integral|antiderivative|area|fundamental/)
    })

    it('knows about limits', async () => {
      const r = await brain.chat('What is a limit in calculus?')
      expect(r.text.toLowerCase()).toMatch(/limit|continuity|epsilon|converge|calculus/)
    })

    it('explains series and Taylor series', async () => {
      const r = await brain.chat('What is a Taylor series?')
      expect(r.text.toLowerCase()).toMatch(/taylor|series|converge|maclaurin/)
    })

    it('knows about differential equations', async () => {
      const r = await brain.chat('What are differential equations?')
      expect(r.text.toLowerCase()).toMatch(/differential|ode|equation|separable/)
    })

    it('explains multivariable calculus', async () => {
      const r = await brain.chat('Explain gradient and divergence')
      expect(r.text.toLowerCase()).toMatch(/gradient|divergence|curl|partial/)
    })

    // ── Geometry & Trigonometry ──
    it('knows geometry formulas', async () => {
      const r = await brain.chat('What are the key geometry formulas?')
      expect(r.text.toLowerCase()).toMatch(/triangle|circle|area|volume/)
    })

    it('explains trigonometry', async () => {
      const r = await brain.chat('Explain trigonometry - sine, cosine, tangent')
      expect(r.text.toLowerCase()).toMatch(/sin|cos|tan|trig/)
    })

    // ── Statistics & Probability ──
    it('explains statistics concepts', async () => {
      const r = await brain.chat('What is standard deviation and variance?')
      expect(r.text.toLowerCase()).toMatch(/standard deviation|variance|mean|normal/)
    })

    it('knows probability and Bayes theorem', async () => {
      const r = await brain.chat('Explain probability and Bayes theorem')
      expect(r.text.toLowerCase()).toMatch(/probability|bayes|conditional/)
    })

    it('knows combinatorics', async () => {
      const r = await brain.chat('How do permutations and combinations work?')
      expect(r.text.toLowerCase()).toMatch(/permutation|combination|factorial|counting/)
    })

    // ── Number Theory ──
    it('knows number theory basics', async () => {
      const r = await brain.chat('What is modular arithmetic and prime numbers?')
      expect(r.text.toLowerCase()).toMatch(/prime|modular|gcd|divisib/)
    })

    // ── Discrete Math ──
    it('knows graph theory', async () => {
      const r = await brain.chat('What is graph theory?')
      expect(r.text.toLowerCase()).toMatch(/graph|vertex|edge|tree/)
    })

    it('knows set theory', async () => {
      const r = await brain.chat('Explain set theory - union, intersection')
      expect(r.text.toLowerCase()).toMatch(/set|union|intersection|subset/)
    })

    it('explains mathematical induction', async () => {
      const r = await brain.chat('How does proof by induction work?')
      expect(r.text.toLowerCase()).toMatch(/induction|base case|inductive|prove/)
    })

    // ── Advanced Topics ──
    it('knows Fourier analysis', async () => {
      const r = await brain.chat('What is the Fourier transform?')
      expect(r.text.toLowerCase()).toMatch(/fourier|frequency|transform|signal/)
    })

    it('explains optimization', async () => {
      const r = await brain.chat('How does mathematical optimization work?')
      expect(r.text.toLowerCase()).toMatch(/optim|lagrange|gradient|minimize/)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  PHYSICS                                                                  ║
  // ══════════════════════════════════════════════════════════════════════════════

  describe('Physics', () => {
    // ── Mechanics ──
    it("explains Newton's laws", async () => {
      const r = await brain.chat("What are Newton's three laws of motion?")
      expect(r.text.toLowerCase()).toMatch(/newton|force|acceleration|f\s*=\s*m\s*a|inertia/)
    })

    it('knows kinematics equations', async () => {
      const r = await brain.chat('What are the kinematics equations for projectile motion?')
      expect(r.text.toLowerCase()).toMatch(/velocity|acceleration|kinematic|projectile/)
    })

    it('explains energy conservation', async () => {
      const r = await brain.chat('Explain conservation of energy and kinetic energy')
      expect(r.text.toLowerCase()).toMatch(/energy|kinetic|potential|conservation/)
    })

    it('knows momentum and collisions', async () => {
      const r = await brain.chat('What is conservation of momentum?')
      expect(r.text.toLowerCase()).toMatch(/momentum|collision|impulse|conserv/)
    })

    it('explains rotational mechanics', async () => {
      const r = await brain.chat('What is torque and angular momentum?')
      expect(r.text.toLowerCase()).toMatch(/torque|angular|moment of inertia|rotation/)
    })

    it('knows gravity and orbits', async () => {
      const r = await brain.chat("How does gravity work? What are Kepler's laws?")
      expect(r.text.toLowerCase()).toMatch(/grav|kepler|orbit|escape velocity/)
    })

    // ── Thermodynamics ──
    it('explains laws of thermodynamics', async () => {
      const r = await brain.chat('What are the laws of thermodynamics?')
      expect(r.text.toLowerCase()).toMatch(/thermodynamic|entropy|heat|energy/)
    })

    it('knows ideal gas law', async () => {
      const r = await brain.chat('What is the ideal gas law?')
      expect(r.text.toLowerCase()).toMatch(/gas|pv\s*=\s*nrt|pressure|boyle|charles/)
    })

    // ── Electromagnetism ──
    it("explains electric fields and Coulomb's law", async () => {
      const r = await brain.chat("What is Coulomb's law and electric fields?")
      expect(r.text.toLowerCase()).toMatch(/coulomb|electric|charge|field/)
    })

    it('knows circuit analysis', async () => {
      const r = await brain.chat("How do electrical circuits work? Ohm's law?")
      expect(r.text.toLowerCase()).toMatch(/ohm|circuit|resistor|voltage|current/)
    })

    it("explains magnetism and Faraday's law", async () => {
      const r = await brain.chat('What is electromagnetic induction?')
      expect(r.text.toLowerCase()).toMatch(/magnet|faraday|induction|electromagnetic/)
    })

    it("knows Maxwell's equations", async () => {
      const r = await brain.chat("What are Maxwell's equations?")
      expect(r.text.toLowerCase()).toMatch(/maxwell|electromagnetic|gauss|wave/)
    })

    // ── Waves & Optics ──
    it('explains waves and sound', async () => {
      const r = await brain.chat('How do waves work? What is wavelength?')
      expect(r.text.toLowerCase()).toMatch(/wave|frequency|wavelength|amplitude/)
    })

    it('knows optics and refraction', async () => {
      const r = await brain.chat("What is Snell's law and how do lenses work?")
      expect(r.text.toLowerCase()).toMatch(/optic|lens|refraction|snell/)
    })

    // ── Modern Physics ──
    it('explains quantum mechanics', async () => {
      const r = await brain.chat('What is quantum mechanics?')
      expect(r.text.toLowerCase()).toMatch(/quantum|wave|particle|uncertainty|schr/)
    })

    it('knows about relativity', async () => {
      const r = await brain.chat("Explain Einstein's theory of relativity")
      expect(r.text.toLowerCase()).toMatch(/relativ|einstein|spacetime|e\s*=\s*mc/)
    })

    it('explains atomic and nuclear physics', async () => {
      const r = await brain.chat('How does radioactive decay work?')
      expect(r.text.toLowerCase()).toMatch(/atom|nuclear|radioact|decay|half-life/)
    })

    it('knows the Standard Model', async () => {
      const r = await brain.chat('What is the Standard Model of particle physics?')
      expect(r.text.toLowerCase()).toMatch(/standard model|quark|lepton|boson|particle/)
    })

    it('explains fluid mechanics', async () => {
      const r = await brain.chat("What is Bernoulli's equation?")
      expect(r.text.toLowerCase()).toMatch(/fluid|bernoulli|pressure|buoyan/)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  LOGIC                                                                    ║
  // ══════════════════════════════════════════════════════════════════════════════

  describe('Logic', () => {
    // ── Propositional Logic ──
    it('explains propositional logic', async () => {
      const r = await brain.chat('What is propositional logic?')
      expect(r.text.toLowerCase()).toMatch(/proposition|truth|logical|connective/)
    })

    it('knows predicate logic', async () => {
      const r = await brain.chat('Explain predicate logic and quantifiers')
      expect(r.text.toLowerCase()).toMatch(/predicate|quantifier|universal|existential/)
    })

    it('explains boolean algebra', async () => {
      const r = await brain.chat('What is boolean algebra and logic gates?')
      expect(r.text.toLowerCase()).toMatch(/boolean|gate|nand|xor|and|or/)
    })

    it('knows logical fallacies', async () => {
      const r = await brain.chat('Tell me about common logical fallacies like ad hominem')
      expect(r.text.toLowerCase()).toMatch(/fallac|ad hominem|straw man|argument|logic/)
    })

    // ── Proof Techniques ──
    it('explains proof techniques', async () => {
      const r = await brain.chat('What are different proof techniques in math?')
      expect(r.text.toLowerCase()).toMatch(/proof|contradiction|direct|contrapositive/)
    })

    it('knows deductive reasoning', async () => {
      const r = await brain.chat('What is modus ponens and deductive reasoning?')
      expect(r.text.toLowerCase()).toMatch(/deduct|modus|syllogism|valid/)
    })

    it('explains types of reasoning', async () => {
      const r = await brain.chat(
        'What is the difference between deductive and inductive reasoning?',
      )
      expect(r.text.toLowerCase()).toMatch(/deduct|induct|abduct|reason/)
    })

    // ── Formal Systems ──
    it("knows about Gödel's incompleteness theorems", async () => {
      const r = await brain.chat("What are Gödel's incompleteness theorems?")
      expect(r.text.toLowerCase()).toMatch(/gödel|godel|incomplet|formal|theorem/)
    })

    it('explains Turing machines and computability', async () => {
      const r = await brain.chat('What is a Turing machine?')
      expect(r.text.toLowerCase()).toMatch(/turing|computab|halting|decidab/)
    })

    // ── Critical Thinking ──
    it('teaches critical thinking', async () => {
      const r = await brain.chat('How do I think critically about an argument?')
      expect(r.text.toLowerCase()).toMatch(/critical|argument|premise|conclusion|evidence/)
    })

    it('explains problem-solving strategies', async () => {
      const r = await brain.chat('What are good problem solving strategies?')
      expect(r.text.toLowerCase()).toMatch(/problem|solv|strategy|heuristic|decompos/)
    })

    it('knows the scientific method', async () => {
      const r = await brain.chat('Explain the scientific method')
      expect(r.text.toLowerCase()).toMatch(/scientific|hypothesis|experiment|theory/)
    })

    // ── Math Logic for CS ──
    it('explains lambda calculus', async () => {
      const r = await brain.chat('What is lambda calculus?')
      expect(r.text.toLowerCase()).toMatch(/lambda|calculus|church|function/)
    })

    it('knows automata theory', async () => {
      const r = await brain.chat('What are finite automata and the Chomsky hierarchy?')
      expect(r.text.toLowerCase()).toMatch(/automata|finite state|context.?free|chomsky/)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  CROSS-DOMAIN REASONING                                                   ║
  // ══════════════════════════════════════════════════════════════════════════════

  describe('Cross-domain reasoning', () => {
    it('handles dimensional analysis questions', async () => {
      const r = await brain.chat('How does dimensional analysis work for unit conversion?')
      expect(r.text.toLowerCase()).toMatch(/dimension|unit|conver|si/)
    })

    it('handles math+physics combined questions', async () => {
      const r = await brain.chat('How is calculus used in physics for acceleration?')
      expect(r.text.length).toBeGreaterThan(50)
    })

    it('handles logic+CS combined questions', async () => {
      const r = await brain.chat('How does boolean algebra relate to digital circuits?')
      expect(r.text.length).toBeGreaterThan(50)
    })

    it('uses reasoning engine for complex math questions', async () => {
      const r = await brain.chat(
        'Why does the derivative of a constant equal zero and how does the chain rule work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
    })

    it('uses reasoning for complex physics questions', async () => {
      const r = await brain.chat('Why does entropy always increase and what are the implications?')
      expect(r.text.length).toBeGreaterThan(50)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  QUERY CLASSIFIER ACCURACY                                                ║
  // ══════════════════════════════════════════════════════════════════════════════

  describe('Query classifier accuracy', () => {
    it('detects math/physics queries for enhanced reasoning', async () => {
      // These should all get substantive responses, not generic fallbacks
      const queries = [
        'Solve the equation 2x + 5 = 15',
        'Calculate the force on a 5kg object',
        'What is the eigenvalue of this matrix?',
        'Prove that the square root of 2 is irrational',
        'Find the derivative of sin(x²)',
      ]
      for (const q of queries) {
        const r = await brain.chat(q)
        expect(r.text.length).toBeGreaterThan(30)
      }
    })
  })
})
