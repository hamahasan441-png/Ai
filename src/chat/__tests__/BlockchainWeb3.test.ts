import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Blockchain & Web3 Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Solidity Smart Contracts ──────────────────────────────────────────────

  describe('Solidity Smart Contracts', () => {
    it('explains Solidity contract development basics', async () => {
      const r = await brain.chat('How does Solidity smart contract development on Ethereum work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/solidity|contract|ethereum|function|evm|state/)
    })

    it('describes ERC token standards', async () => {
      const r = await brain.chat('What are the ERC-20 and ERC-721 token standards for Solidity contracts?')
      expect(r.text.toLowerCase()).toMatch(/erc-?20|erc-?721|token|openzeppelin|standard|fungible/)
    })

    it('covers Hardhat and Foundry development tools', async () => {
      const r = await brain.chat('How to use Hardhat and Foundry forge for Solidity contract testing and deployment?')
      expect(r.text.toLowerCase()).toMatch(/hardhat|foundry|forge|test|deploy|compil/)
    })

    it('explains gas optimization techniques', async () => {
      const r = await brain.chat('What Solidity smart contract gas optimization techniques exist?')
      expect(r.text.toLowerCase()).toMatch(/gas|optim|storage|calldata|pack|sstore|unchecked/)
    })
  })

  // ── DeFi ──────────────────────────────────────────────────────────────────

  describe('DeFi Protocols', () => {
    it('explains decentralized exchange AMM mechanics', async () => {
      const r = await brain.chat('How does a DeFi decentralized exchange AMM with liquidity pools work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/defi|dex|amm|liquidity|pool|swap|uniswap/)
    })

    it('describes DeFi lending and flash loans', async () => {
      const r = await brain.chat('How do DeFi lending protocols and flash loans like Aave work?')
      expect(r.text.toLowerCase()).toMatch(/defi|lend|flash\s*loan|aave|compound|collateral|borrow/)
    })

    it('covers yield farming and impermanent loss', async () => {
      const r = await brain.chat('What is DeFi yield farming and impermanent loss in liquidity pools?')
      expect(r.text.toLowerCase()).toMatch(/yield\s*farm|impermanent\s*loss|liquidity|pool|reward/)
    })
  })

  // ── Web3 DApp Development ─────────────────────────────────────────────────

  describe('Web3 DApp Development', () => {
    it('explains ethers.js and wallet integration', async () => {
      const r = await brain.chat('How does Web3 DApp development with ethers.js and MetaMask wallet connection work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/web3|ethers|metamask|wallet|connect|signer|provider/)
    })

    it('describes IPFS and decentralized storage', async () => {
      const r = await brain.chat('How does Web3 DApp development use IPFS for decentralized storage?')
      expect(r.text.toLowerCase()).toMatch(/ipfs|decentral|storage|pin|metadata|cid/)
    })

    it('covers wagmi hooks for React Web3', async () => {
      const r = await brain.chat('How do wagmi hooks work for React Web3 DApp frontend development?')
      expect(r.text.toLowerCase()).toMatch(/wagmi|hook|react|connect|contract|wallet|web3/)
    })
  })

  // ── Smart Contract Security ───────────────────────────────────────────────

  describe('Smart Contract Security', () => {
    it('explains reentrancy vulnerability and prevention', async () => {
      const r = await brain.chat('What is the smart contract security reentrancy vulnerability and how to prevent it?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reentr|vulnerab|check|effect|interact|guard|dao/)
    })

    it('describes audit tools and formal verification', async () => {
      const r = await brain.chat('What smart contract security audit tools exist like Slither and Mythril?')
      expect(r.text.toLowerCase()).toMatch(/audit|slither|mythril|echidna|security|vulnerab|formal/)
    })

    it('covers common smart contract vulnerabilities', async () => {
      const r = await brain.chat('What are common Solidity smart contract security vulnerabilities?')
      expect(r.text.toLowerCase()).toMatch(/vulnerab|reentr|overflow|access\s*control|front-?run|oracle/)
    })
  })

  // ── NFT Development ───────────────────────────────────────────────────────

  describe('NFT Development', () => {
    it('explains NFT minting and token standards', async () => {
      const r = await brain.chat('How does NFT smart contract minting with ERC-721 and ERC-1155 work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/nft|erc-?721|erc-?1155|mint|token|metadata/)
    })

    it('describes NFT metadata and IPFS storage', async () => {
      const r = await brain.chat('How does NFT metadata storage with IPFS and Arweave work?')
      expect(r.text.toLowerCase()).toMatch(/nft|metadata|ipfs|arweave|storage|tokenuri|image/)
    })
  })

  // ── Layer 2 Scaling ───────────────────────────────────────────────────────

  describe('Layer 2 Scaling', () => {
    it('explains optimistic and zk rollups', async () => {
      const r = await brain.chat('How do Layer 2 scaling solutions like optimistic rollups and zk-rollups work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/layer\s*2|rollup|optimistic|zk|scaling|proof|l1/)
    })

    it('describes Arbitrum, Optimism, and zkSync', async () => {
      const r = await brain.chat('How do Layer 2 scaling solutions Arbitrum, Optimism, and zkSync compare?')
      expect(r.text.toLowerCase()).toMatch(/arbitrum|optimism|zksync|layer\s*2|rollup|scaling/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Blockchain & Web3 concepts', () => {
    it('has Blockchain & Web3 concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Blockchain & Web3')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('distributed-systems')
    })

    it('has Solidity Smart Contracts concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Solidity Smart Contracts')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('blockchain')
    })

    it('has DeFi Protocols concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('DeFi Protocols')
      expect(concept).toBeDefined()
    })

    it('has Web3 DApp Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Web3 DApp Development')
      expect(concept).toBeDefined()
    })

    it('has Smart Contract Security concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Smart Contract Security')
      expect(concept).toBeDefined()
    })

    it('has NFT Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('NFT Development')
      expect(concept).toBeDefined()
    })

    it('has Layer 2 Scaling concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Layer 2 Scaling')
      expect(concept).toBeDefined()
    })

    it('Blockchain & Web3 has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Blockchain & Web3')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(4)
    })

    it('Smart Contract Security is related to Solidity', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Smart Contract Security')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Solidity Smart Contracts')
    })

    it('DeFi is related to Solidity', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('DeFi Protocols')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Solidity Smart Contracts')
    })
  })
})
