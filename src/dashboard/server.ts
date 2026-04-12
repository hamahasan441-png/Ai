/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   🖥️  A I   D A S H B O A R D  —  LOCAL WEB UI                              ║
 * ║                                                                             ║
 * ║   Full-featured web dashboard with chat UI supporting ALL local models.     ║
 * ║   No external APIs — connects to Ollama/llama.cpp running locally.          ║
 * ║                                                                             ║
 * ║   Pages:                                                                    ║
 * ║     🏠 Dashboard  — Overview, system stats, quick actions                   ║
 * ║     💬 Chat       — Multi-model chat with model selector                    ║
 * ║     🤖 Models     — Browse, manage, check status of all models             ║
 * ║     📊 Modules    — View all AI modules and capabilities                    ║
 * ║     ⚙️  Settings   — Configure ports, models, preferences                   ║
 * ║                                                                             ║
 * ║   Run: npm run dashboard   or   tsx src/dashboard/server.ts                 ║
 * ║   Default port: 3210 (configurable via AI_DASHBOARD_PORT)                   ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as http from 'http'
import * as os from 'os'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Dashboard configuration */
export interface DashboardConfig {
  port: number
  host: string
  ollamaHost: string
  ollamaPort: number
  llamaCppHost: string
  llamaCppPort: number
  title: string
  maxChatHistory: number
  defaultModel: string
  defaultTemperature: number
  defaultMaxTokens: number
}

/** Chat message for the dashboard */
export interface DashboardChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model: string
  timestamp: number
  tokensUsed?: number
  durationMs?: number
}

/** Chat session */
export interface ChatSession {
  id: string
  title: string
  model: string
  messages: DashboardChatMessage[]
  createdAt: number
  updatedAt: number
}

/** Model status info */
export interface DashboardModelInfo {
  id: string
  name: string
  family: string
  parameterCount: string
  quantization: string
  contextWindow: number
  status: 'available' | 'loaded' | 'unavailable'
  backend: 'ollama' | 'llama_cpp' | 'unknown'
  description: string
  strengths: string[]
}

/** System stats */
export interface SystemStats {
  platform: string
  arch: string
  cpus: number
  totalMemoryGB: number
  freeMemoryGB: number
  uptime: number
  nodeVersion: string
  ollamaAvailable: boolean
  llamaCppAvailable: boolean
  modelsLoaded: number
  totalChats: number
}

/** API route handler */
export type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  body?: string,
) => void | Promise<void>

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: DashboardConfig = {
  port: parseInt(process.env.AI_DASHBOARD_PORT ?? '3210', 10),
  host: '0.0.0.0',
  ollamaHost: 'localhost',
  ollamaPort: 11434,
  llamaCppHost: 'localhost',
  llamaCppPort: 8080,
  title: 'AI Dashboard',
  maxChatHistory: 1000,
  defaultModel: 'qwen2.5-coder:7b',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
}

/** All supported models for the dashboard */
export const DASHBOARD_MODELS: DashboardModelInfo[] = [
  {
    id: 'qwen2.5-coder:7b',
    name: 'Qwen2.5-Coder 7B',
    family: 'qwen2.5',
    parameterCount: '7B',
    quantization: 'Q4_K_M',
    contextWindow: 32768,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Best-in-class for code generation, review, and debugging.',
    strengths: ['Code Generation', 'Code Review', 'Debugging', 'Security Analysis'],
  },
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen2.5-Coder 1.5B',
    family: 'qwen2.5',
    parameterCount: '1.5B',
    quantization: 'Q4_K_M',
    contextWindow: 32768,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Ultra-fast lightweight coder for quick completions.',
    strengths: ['Code Completion', 'Fast Drafting'],
  },
  {
    id: 'llama3.1:8b',
    name: 'LLaMA 3.1 8B',
    family: 'llama3',
    parameterCount: '8B',
    quantization: 'Q4_K_M',
    contextWindow: 131072,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Excellent reasoning, math, and general knowledge with 128K context.',
    strengths: ['Reasoning', 'Math', 'Creative Writing', 'Planning'],
  },
  {
    id: 'llama3:8b',
    name: 'LLaMA 3 8B',
    family: 'llama3',
    parameterCount: '8B',
    quantization: 'Q4_K_M',
    contextWindow: 8192,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Fast general-purpose model for conversation and reasoning.',
    strengths: ['Conversation', 'Summarization', 'Translation'],
  },
  {
    id: 'mistral:7b',
    name: 'Mistral 7B',
    family: 'mistral',
    parameterCount: '7B',
    quantization: 'Q4_K_M',
    contextWindow: 32768,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Balanced model with strong reasoning and instruction following.',
    strengths: ['Reasoning', 'Instruction Following', 'Analysis'],
  },
  {
    id: 'codellama:7b',
    name: 'CodeLlama 7B',
    family: 'codellama',
    parameterCount: '7B',
    quantization: 'Q4_K_M',
    contextWindow: 16384,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Meta code-specialized LLM for generation and infilling.',
    strengths: ['Code Generation', 'Code Infilling', 'Debugging'],
  },
  {
    id: 'deepseek-coder:6.7b',
    name: 'DeepSeek Coder 6.7B',
    family: 'deepseek',
    parameterCount: '6.7B',
    quantization: 'Q4_K_M',
    contextWindow: 16384,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Strong code generation model trained on 2T tokens of code.',
    strengths: ['Code Generation', 'Code Completion', 'Bug Fixing'],
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini',
    family: 'phi',
    parameterCount: '3.8B',
    quantization: 'Q4_K_M',
    contextWindow: 4096,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Compact yet powerful model from Microsoft for reasoning tasks.',
    strengths: ['Reasoning', 'Math', 'Compact Size'],
  },
  {
    id: 'gemma2:9b',
    name: 'Gemma 2 9B',
    family: 'gemma',
    parameterCount: '9B',
    quantization: 'Q4_K_M',
    contextWindow: 8192,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Google open model with strong benchmarks across tasks.',
    strengths: ['Reasoning', 'Coding', 'Analysis'],
  },
  {
    id: 'starcoder2:7b',
    name: 'StarCoder2 7B',
    family: 'starcoder',
    parameterCount: '7B',
    quantization: 'Q4_K_M',
    contextWindow: 16384,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Code-specialized model trained on The Stack v2.',
    strengths: ['Code Generation', 'Multi-language Code', 'Completion'],
  },
  {
    id: 'qwen2.5:72b',
    name: 'Qwen2.5 72B',
    family: 'qwen2.5',
    parameterCount: '72B',
    quantization: 'Q4_K_M',
    contextWindow: 32768,
    status: 'unavailable',
    backend: 'ollama',
    description: 'Largest Qwen model — near GPT-4 level for all tasks. Needs 48GB+ RAM.',
    strengths: ['Everything', 'Code', 'Reasoning', 'Creative Writing', 'Analysis'],
  },
]

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** Get system statistics */
export function getSystemStats(sessions: ChatSession[]): SystemStats {
  const cpus = os.cpus()
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: cpus.length,
    totalMemoryGB: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
    freeMemoryGB: Math.round((os.freemem() / 1024 / 1024 / 1024) * 10) / 10,
    uptime: Math.floor(os.uptime()),
    nodeVersion: process.version,
    ollamaAvailable: false,
    llamaCppAvailable: false,
    modelsLoaded: 0,
    totalChats: sessions.length,
  }
}

/** Parse URL query parameters */
export function parseQuery(url: string): Record<string, string> {
  const qIdx = url.indexOf('?')
  if (qIdx < 0) return {}
  const params: Record<string, string> = {}
  const qs = url.slice(qIdx + 1)
  for (const pair of qs.split('&')) {
    const [k, v] = pair.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return params
}

/** Read request body */
export function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

/** Send JSON response */
export function sendJson(res: http.ServerResponse, data: unknown, status = 200): void {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  })
  res.end(body)
}

/** Send HTML response */
export function sendHtml(res: http.ServerResponse, html: string, status = 200): void {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  })
  res.end(html)
}

/** Check if Ollama is running */
export async function checkOllama(host: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    const req = http.request({ hostname: host, port, path: '/api/tags', method: 'GET', timeout: 2000 }, res => {
      res.resume()
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.end()
  })
}

/** List models from Ollama */
export async function listOllamaModels(host: string, port: number): Promise<string[]> {
  return new Promise(resolve => {
    const req = http.request({ hostname: host, port, path: '/api/tags', method: 'GET', timeout: 5000 }, res => {
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
          const models = (data.models ?? []).map((m: { name: string }) => m.name)
          resolve(models)
        } catch {
          resolve([])
        }
      })
    })
    req.on('error', () => resolve([]))
    req.on('timeout', () => { req.destroy(); resolve([]) })
    req.end()
  })
}

/** Send chat to Ollama and get response */
export async function chatWithOllama(
  host: string,
  port: number,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number },
): Promise<{ text: string; tokensUsed: number; durationMs: number }> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 2048,
      },
    })

    const req = http.request(
      {
        hostname: host,
        port,
        path: '/api/chat',
        method: 'POST',
        timeout: 120000,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      },
      res => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
            resolve({
              text: data.message?.content ?? data.response ?? 'No response from model.',
              tokensUsed: (data.eval_count ?? 0) + (data.prompt_eval_count ?? 0),
              durationMs: Date.now() - start,
            })
          } catch {
            resolve({ text: 'Error parsing model response.', tokensUsed: 0, durationMs: Date.now() - start })
          }
        })
      },
    )
    req.on('error', err => reject(err))
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')) })
    req.write(payload)
    req.end()
  })
}

// ─── HTML Templates ──────────────────────────────────────────────────────────

/** Generate the common HTML head with CSS */
function htmlHead(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
:root {
  --bg: #0f0f0f;
  --bg2: #1a1a2e;
  --bg3: #16213e;
  --accent: #0f3460;
  --primary: #e94560;
  --text: #eee;
  --text2: #aaa;
  --border: #333;
  --green: #00e676;
  --orange: #ff9800;
  --red: #f44336;
  --blue: #2196f3;
  --radius: 12px;
  --shadow: 0 4px 20px rgba(0,0,0,0.5);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
}
/* Sidebar */
.sidebar {
  width: 260px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}
.sidebar-header h1 { font-size: 1.3rem; color: var(--primary); }
.sidebar-header p { font-size: 0.75rem; color: var(--text2); margin-top: 4px; }
.nav { flex: 1; padding: 12px; }
.nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--text2);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  font-size: 0.95rem;
}
.nav a:hover, .nav a.active {
  background: var(--accent);
  color: var(--text);
}
.nav a .icon { font-size: 1.2rem; }
/* Main content */
.main {
  margin-left: 260px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.topbar h2 { font-size: 1.2rem; }
.content { padding: 24px; flex: 1; }
/* Cards */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
.card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}
.card h3 { font-size: 0.9rem; color: var(--text2); margin-bottom: 8px; }
.card .value { font-size: 1.8rem; font-weight: 700; }
.card .sub { font-size: 0.8rem; color: var(--text2); margin-top: 4px; }
/* Status badges */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-green { background: rgba(0,230,118,0.15); color: var(--green); }
.badge-orange { background: rgba(255,152,0,0.15); color: var(--orange); }
.badge-red { background: rgba(244,67,54,0.15); color: var(--red); }
/* Tables */
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
th { color: var(--text2); font-size: 0.85rem; text-transform: uppercase; }
tr:hover { background: rgba(255,255,255,0.03); }
/* Chat UI */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 73px);
}
.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg2);
  flex-shrink: 0;
}
.chat-header select {
  background: var(--bg3);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 200px;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.msg {
  max-width: 80%;
  padding: 14px 18px;
  border-radius: 16px;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-user {
  align-self: flex-end;
  background: var(--accent);
  border-bottom-right-radius: 4px;
}
.msg-assistant {
  align-self: flex-start;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}
.msg-meta {
  font-size: 0.7rem;
  color: var(--text2);
  margin-top: 6px;
}
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg2);
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.chat-input-area textarea {
  flex: 1;
  background: var(--bg3);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  font-family: inherit;
  min-height: 48px;
  max-height: 200px;
}
.chat-input-area textarea:focus { border-color: var(--primary); }
.send-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.send-btn:hover { opacity: 0.85; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
/* Model cards */
.model-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.model-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: transform 0.2s;
}
.model-card:hover { transform: translateY(-2px); }
.model-card h3 { color: var(--primary); margin-bottom: 6px; }
.model-card .family { color: var(--text2); font-size: 0.8rem; margin-bottom: 10px; }
.model-card .desc { font-size: 0.9rem; color: var(--text2); margin-bottom: 12px; }
.model-card .tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  background: rgba(233,69,96,0.1);
  color: var(--primary);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
}
/* Settings form */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; color: var(--text2); font-size: 0.85rem; margin-bottom: 6px; }
.form-group input, .form-group select {
  background: var(--bg3);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 10px 14px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  font-size: 0.95rem;
}
.btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
}
.btn:hover { opacity: 0.85; }
/* Module list */
.module-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.module-item {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 18px;
}
.module-item h4 { color: var(--blue); font-size: 0.95rem; margin-bottom: 4px; }
.module-item p { color: var(--text2); font-size: 0.82rem; }
/* Responsive */
@media (max-width: 768px) {
  .sidebar { width: 60px; }
  .sidebar-header h1, .sidebar-header p, .nav a span { display: none; }
  .nav a { justify-content: center; padding: 12px; }
  .main { margin-left: 60px; }
}
</style>
</head>
<body>`
}

/** Sidebar navigation */
function sidebarHtml(activePage: string): string {
  const links = [
    { href: '/', icon: '🏠', label: 'Dashboard', id: 'dashboard' },
    { href: '/chat', icon: '💬', label: 'Chat', id: 'chat' },
    { href: '/models', icon: '🤖', label: 'Models', id: 'models' },
    { href: '/modules', icon: '📊', label: 'Modules', id: 'modules' },
    { href: '/settings', icon: '⚙️', label: 'Settings', id: 'settings' },
  ]
  return `
<div class="sidebar">
  <div class="sidebar-header">
    <h1>🧠 AI Dashboard</h1>
    <p>100% Local • No API Keys</p>
  </div>
  <nav class="nav">
    ${links.map(l => `<a href="${l.href}" class="${l.id === activePage ? 'active' : ''}"><span class="icon">${l.icon}</span><span>${l.label}</span></a>`).join('\n    ')}
  </nav>
</div>`
}

/** Dashboard home page */
export function renderDashboardPage(stats: SystemStats, models: DashboardModelInfo[]): string {
  const availableModels = models.filter(m => m.status !== 'unavailable').length
  return `${htmlHead('AI Dashboard')}
${sidebarHtml('dashboard')}
<div class="main">
  <div class="topbar"><h2>🏠 Dashboard Overview</h2><span class="badge ${stats.ollamaAvailable ? 'badge-green' : 'badge-red'}">${stats.ollamaAvailable ? 'Ollama Online' : 'Ollama Offline'}</span></div>
  <div class="content">
    <div class="cards">
      <div class="card"><h3>System</h3><div class="value">${stats.platform}</div><div class="sub">${stats.arch} • ${stats.cpus} CPUs</div></div>
      <div class="card"><h3>Memory</h3><div class="value">${stats.freeMemoryGB} GB free</div><div class="sub">of ${stats.totalMemoryGB} GB total</div></div>
      <div class="card"><h3>Models</h3><div class="value">${availableModels} / ${models.length}</div><div class="sub">available models</div></div>
      <div class="card"><h3>Chat Sessions</h3><div class="value">${stats.totalChats}</div><div class="sub">conversations</div></div>
      <div class="card"><h3>Node.js</h3><div class="value">${stats.nodeVersion}</div><div class="sub">runtime version</div></div>
      <div class="card"><h3>Uptime</h3><div class="value">${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m</div><div class="sub">system uptime</div></div>
    </div>
    <h3 style="margin-bottom:12px">Quick Actions</h3>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a href="/chat" class="btn">💬 Start Chat</a>
      <a href="/models" class="btn" style="background:var(--blue)">🤖 View Models</a>
      <a href="/modules" class="btn" style="background:var(--green);color:#000">📊 AI Modules</a>
    </div>
  </div>
</div>
</body></html>`
}

/** Chat page */
export function renderChatPage(models: DashboardModelInfo[], defaultModel: string): string {
  const modelOptions = models.map(m =>
    `<option value="${m.id}" ${m.id === defaultModel ? 'selected' : ''}>${m.name} (${m.parameterCount})</option>`
  ).join('\n          ')

  return `${htmlHead('Chat — AI Dashboard')}
${sidebarHtml('chat')}
<div class="main">
  <div class="chat-container">
    <div class="chat-header">
      <label for="model-select" style="font-weight:600">Model:</label>
      <select id="model-select">
        ${modelOptions}
      </select>
      <label for="temp-input" style="margin-left:16px;font-weight:600">Temp:</label>
      <input type="number" id="temp-input" value="0.7" min="0" max="2" step="0.1" style="width:70px;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:8px;font-size:0.9rem">
      <button onclick="clearChat()" class="btn" style="margin-left:auto;background:var(--red);padding:8px 16px;font-size:0.85rem">🗑 Clear</button>
    </div>
    <div class="chat-messages" id="messages">
      <div style="text-align:center;color:var(--text2);margin-top:40vh">
        <div style="font-size:3rem;margin-bottom:12px">💬</div>
        <p>Select a model and start chatting!</p>
        <p style="font-size:0.8rem;margin-top:8px">All models run 100% locally via Ollama.</p>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea id="chat-input" placeholder="Type your message... (Shift+Enter for new line)" rows="1" onkeydown="handleKeyDown(event)"></textarea>
      <button class="send-btn" id="send-btn" onclick="sendMessage()">Send ➤</button>
    </div>
  </div>
</div>
<script>
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');
const tempInput = document.getElementById('temp-input');

let chatHistory = [];
let isLoading = false;

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function clearChat() {
  chatHistory = [];
  messagesEl.innerHTML = '<div style="text-align:center;color:var(--text2);margin-top:40vh"><div style="font-size:3rem;margin-bottom:12px">💬</div><p>Chat cleared. Start a new conversation!</p></div>';
}

function addMessage(role, content, meta) {
  // Clear placeholder
  if (chatHistory.length === 0 && role === 'user') {
    messagesEl.innerHTML = '';
  }
  const div = document.createElement('div');
  div.className = 'msg msg-' + role;
  let metaHtml = '';
  if (meta) {
    const parts = [];
    if (meta.model) parts.push(meta.model);
    if (meta.durationMs) parts.push((meta.durationMs / 1000).toFixed(1) + 's');
    if (meta.tokensUsed) parts.push(meta.tokensUsed + ' tokens');
    metaHtml = '<div class="msg-meta">' + parts.join(' • ') + '</div>';
  }
  div.innerHTML = escapeHtml(content) + metaHtml;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  isLoading = true;
  sendBtn.disabled = true;
  sendBtn.textContent = '⏳...';

  chatHistory.push({ role: 'user', content: text });
  addMessage('user', text);
  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Add loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'msg msg-assistant';
  loadingDiv.id = 'loading-msg';
  loadingDiv.innerHTML = '<span style="animation:pulse 1.5s infinite">🤔 Thinking...</span>';
  messagesEl.appendChild(loadingDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: chatHistory,
        temperature: parseFloat(tempInput.value) || 0.7,
      }),
    });
    const data = await res.json();

    // Remove loading
    const ld = document.getElementById('loading-msg');
    if (ld) ld.remove();

    if (data.error) {
      addMessage('assistant', '❌ Error: ' + data.error, { model: modelSelect.value });
    } else {
      chatHistory.push({ role: 'assistant', content: data.text });
      addMessage('assistant', data.text, {
        model: modelSelect.options[modelSelect.selectedIndex].text,
        durationMs: data.durationMs,
        tokensUsed: data.tokensUsed,
      });
    }
  } catch (err) {
    const ld = document.getElementById('loading-msg');
    if (ld) ld.remove();
    addMessage('assistant', '❌ Failed to connect. Make sure Ollama is running: ollama serve');
  }

  isLoading = false;
  sendBtn.disabled = false;
  sendBtn.textContent = 'Send ➤';
  inputEl.focus();
}

// Auto-resize textarea
inputEl.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});
</script>
<style>
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
</body></html>`
}

/** Models page */
export function renderModelsPage(models: DashboardModelInfo[]): string {
  const modelCards = models.map(m => `
    <div class="model-card">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h3>${m.name}</h3>
        <span class="badge ${m.status === 'loaded' ? 'badge-green' : m.status === 'available' ? 'badge-orange' : 'badge-red'}">${m.status}</span>
      </div>
      <div class="family">${m.family} • ${m.parameterCount} • ${m.quantization} • ${m.contextWindow.toLocaleString()} ctx</div>
      <div class="desc">${m.description}</div>
      <div class="tags">${m.strengths.map(s => `<span class="tag">${s}</span>`).join('')}</div>
      <div style="margin-top:12px"><a href="/chat?model=${encodeURIComponent(m.id)}" class="btn" style="padding:6px 14px;font-size:0.82rem">💬 Chat with ${m.name}</a></div>
    </div>
  `).join('')

  return `${htmlHead('Models — AI Dashboard')}
${sidebarHtml('models')}
<div class="main">
  <div class="topbar"><h2>🤖 All Models</h2><span style="color:var(--text2)">${models.length} models available</span></div>
  <div class="content">
    <div class="model-grid">${modelCards}</div>
  </div>
</div>
</body></html>`
}

/** AI Modules page listing all chat modules */
export function renderModulesPage(): string {
  const modules = [
    { name: 'LocalBrain', desc: 'Standalone offline AI brain with 47+ intelligence modules' },
    { name: 'ModelSpark', desc: 'Dual-model ensemble engine (Qwen2.5 + LLaMA)' },
    { name: 'QwenLocalLLM', desc: 'Local Qwen2.5-Coder inference engine' },
    { name: 'LocalLLMBridge', desc: 'Brain ↔ LLM connector with smart routing' },
    { name: 'SemanticEngine', desc: 'Semantic understanding and NLU processing' },
    { name: 'IntentEngine', desc: 'Intent classification and slot filling' },
    { name: 'ReasoningEngine', desc: 'Multi-step logical reasoning' },
    { name: 'MetaCognition', desc: 'Self-awareness and confidence calibration' },
    { name: 'ContextManager', desc: 'Multi-turn conversation context tracking' },
    { name: 'SemanticMemory', desc: 'Knowledge graph with semantic search' },
    { name: 'PlanningEngine', desc: 'Goal decomposition and task planning' },
    { name: 'CodeOptimizer', desc: 'Automated code optimization and refactoring' },
    { name: 'ExploitSearchEngine', desc: 'CVE/CWE/exploit database search with CVSS scoring' },
    { name: 'BufferOverflowDebugger', desc: 'Stack/heap overflow analysis with ROP chain generation' },
    { name: 'PythonBlackHat', desc: 'Security research — 16 attack domains, 298 knowledge entries' },
    { name: 'VulnerabilityScanner', desc: 'Automated vulnerability detection and assessment' },
    { name: 'ThreatModeler', desc: 'STRIDE/DREAD threat modeling framework' },
    { name: 'NetworkForensics', desc: 'Packet analysis and network investigation tools' },
    { name: 'CyberThreatIntelligence', desc: 'Threat intelligence feeds and IOC tracking' },
    { name: 'CreativeEngine', desc: 'Creative writing and story generation' },
    { name: 'EmotionEngine', desc: 'Sentiment and emotion analysis' },
    { name: 'KnowledgeGraphEngine', desc: 'Knowledge graph construction and querying' },
    { name: 'DecisionEngine', desc: 'Multi-criteria decision analysis' },
    { name: 'CollaborationEngine', desc: 'Multi-agent collaboration framework' },
    { name: 'DocumentAnalyzer', desc: 'Document parsing, summarization, and extraction' },
    { name: 'CodeAgent', desc: 'Autonomous code generation agent' },
    { name: 'TradingEngine', desc: 'Financial analysis and trading strategy generation' },
    { name: 'AdvancedSearchEngine', desc: 'Multi-strategy search (fuzzy, semantic, graph)' },
    { name: 'BayesianNetwork', desc: 'Probabilistic reasoning and inference' },
    { name: 'TemporalReasoner', desc: 'Time-series analysis and temporal logic' },
    { name: 'ConceptMapper', desc: 'Concept mapping and ontology building' },
    { name: 'PatternRecognizer', desc: 'Pattern detection across code and data' },
    { name: 'SelfReflectionEngine', desc: 'Self-evaluation and improvement' },
    { name: 'DebateEngine', desc: 'Multi-perspective argument analysis' },
    { name: 'ScientificReasoner', desc: 'Hypothesis testing and scientific method' },
    { name: 'EthicalReasoner', desc: 'Ethical analysis and moral reasoning' },
    { name: 'KurdishLanguageUtils', desc: 'Kurdish language processing (Sorani/Kurmanji)' },
    { name: 'ImageAnalyzer', desc: 'Image metadata extraction and analysis' },
    { name: 'PdfExpert', desc: 'PDF parsing and document intelligence' },
    { name: 'TaskOrchestrator', desc: 'Task scheduling and workflow orchestration' },
  ]

  const moduleItems = modules.map(m =>
    `<div class="module-item"><h4>${m.name}</h4><p>${m.desc}</p></div>`
  ).join('')

  return `${htmlHead('AI Modules — AI Dashboard')}
${sidebarHtml('modules')}
<div class="main">
  <div class="topbar"><h2>📊 AI Modules</h2><span style="color:var(--text2)">${modules.length} modules</span></div>
  <div class="content">
    <p style="color:var(--text2);margin-bottom:16px">All modules run 100% offline. No external APIs required.</p>
    <div class="module-list">${moduleItems}</div>
  </div>
</div>
</body></html>`
}

/** Settings page */
export function renderSettingsPage(config: DashboardConfig): string {
  return `${htmlHead('Settings — AI Dashboard')}
${sidebarHtml('settings')}
<div class="main">
  <div class="topbar"><h2>⚙️ Settings</h2></div>
  <div class="content">
    <form id="settings-form" onsubmit="saveSettings(event)">
      <div class="form-group">
        <label>Default Model</label>
        <select name="defaultModel" id="settings-model">
          ${DASHBOARD_MODELS.map(m => `<option value="${m.id}" ${m.id === config.defaultModel ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Ollama Host</label>
        <input type="text" name="ollamaHost" value="${config.ollamaHost}">
      </div>
      <div class="form-group">
        <label>Ollama Port</label>
        <input type="number" name="ollamaPort" value="${config.ollamaPort}">
      </div>
      <div class="form-group">
        <label>Default Temperature</label>
        <input type="number" name="defaultTemperature" value="${config.defaultTemperature}" min="0" max="2" step="0.1">
      </div>
      <div class="form-group">
        <label>Max Tokens</label>
        <input type="number" name="defaultMaxTokens" value="${config.defaultMaxTokens}" min="100" max="8192">
      </div>
      <div class="form-group">
        <label>Dashboard Port</label>
        <input type="number" name="port" value="${config.port}" min="1024" max="65535">
      </div>
      <button type="submit" class="btn">💾 Save Settings</button>
      <span id="save-status" style="margin-left:12px;color:var(--green);display:none">✓ Saved</span>
    </form>
  </div>
</div>
<script>
async function saveSettings(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const data = Object.fromEntries(form);
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const el = document.getElementById('save-status');
      el.style.display = 'inline';
      setTimeout(() => el.style.display = 'none', 2000);
    }
  } catch (err) {
    alert('Failed to save settings');
  }
}
</script>
</body></html>`
}

/** 404 page */
function render404Page(): string {
  return `${htmlHead('404 — AI Dashboard')}
${sidebarHtml('')}
<div class="main">
  <div class="topbar"><h2>404 — Not Found</h2></div>
  <div class="content" style="text-align:center;padding-top:100px">
    <div style="font-size:5rem">🔍</div>
    <h2 style="margin:16px 0">Page Not Found</h2>
    <p style="color:var(--text2)">The page you're looking for doesn't exist.</p>
    <a href="/" class="btn" style="display:inline-block;margin-top:20px">← Back to Dashboard</a>
  </div>
</div>
</body></html>`
}

// ─── Dashboard Server ────────────────────────────────────────────────────────

export class DashboardServer {
  private config: DashboardConfig
  private server: http.Server | null = null
  private sessions: ChatSession[] = []
  private models: DashboardModelInfo[] = [...DASHBOARD_MODELS]

  constructor(config?: Partial<DashboardConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /** Get the server configuration */
  getConfig(): DashboardConfig {
    return { ...this.config }
  }

  /** Get all chat sessions */
  getSessions(): ChatSession[] {
    return [...this.sessions]
  }

  /** Get model list with current status */
  getModels(): DashboardModelInfo[] {
    return [...this.models]
  }

  /** Update model statuses from Ollama */
  async refreshModelStatus(): Promise<void> {
    const ollamaAvailable = await checkOllama(this.config.ollamaHost, this.config.ollamaPort)
    if (!ollamaAvailable) {
      this.models = this.models.map(m => ({ ...m, status: 'unavailable' as const }))
      return
    }
    const ollamaModels = await listOllamaModels(this.config.ollamaHost, this.config.ollamaPort)
    this.models = this.models.map(m => {
      const isAvailable = ollamaModels.some(om =>
        om === m.id || om.startsWith(m.id.split(':')[0] ?? '')
      )
      return { ...m, status: isAvailable ? 'available' as const : 'unavailable' as const }
    })
  }

  /** Handle incoming HTTP requests */
  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = req.url ?? '/'
    const pathname = url.split('?')[0] ?? '/'
    const method = req.method ?? 'GET'

    // CORS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      res.end()
      return
    }

    try {
      // API routes
      if (pathname === '/api/chat' && method === 'POST') {
        const body = await readBody(req)
        await this.handleChatApi(res, body)
        return
      }

      if (pathname === '/api/models' && method === 'GET') {
        await this.refreshModelStatus()
        sendJson(res, { models: this.models })
        return
      }

      if (pathname === '/api/stats' && method === 'GET') {
        const stats = getSystemStats(this.sessions)
        stats.ollamaAvailable = await checkOllama(this.config.ollamaHost, this.config.ollamaPort)
        sendJson(res, stats)
        return
      }

      if (pathname === '/api/sessions' && method === 'GET') {
        sendJson(res, { sessions: this.sessions })
        return
      }

      if (pathname === '/api/settings' && method === 'POST') {
        const body = await readBody(req)
        this.handleSettingsApi(res, body)
        return
      }

      if (pathname === '/api/settings' && method === 'GET') {
        sendJson(res, this.config)
        return
      }

      // Backward-compatible API endpoints (from main branch dashboard)
      if (pathname === '/api/status' && method === 'GET') {
        const mem = process.memoryUsage()
        const ollamaRunning = await checkOllama(this.config.ollamaHost, this.config.ollamaPort)
        sendJson(res, {
          ok: true,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: Math.floor(process.uptime()),
          memoryMB: Math.round(mem.rss / 1024 / 1024),
          heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
          ollamaRunning,
          pid: process.pid,
          cwd: process.cwd(),
        })
        return
      }

      if (pathname === '/api/modules' && method === 'GET') {
        const moduleNames = [
          'LocalBrain', 'ModelSpark', 'QwenLocalLLM', 'LocalLLMBridge',
          'SemanticEngine', 'IntentEngine', 'ReasoningEngine', 'MetaCognition',
          'ContextManager', 'SemanticMemory', 'PlanningEngine', 'CodeOptimizer',
          'ExploitSearchEngine', 'BufferOverflowDebugger', 'PythonBlackHat',
          'VulnerabilityScanner', 'ThreatModeler', 'NetworkForensics',
          'CyberThreatIntelligence', 'CreativeEngine', 'EmotionEngine',
          'KnowledgeGraphEngine', 'DecisionEngine', 'CollaborationEngine',
          'DocumentAnalyzer', 'CodeAgent', 'TradingEngine', 'AdvancedSearchEngine',
          'BayesianNetwork', 'TemporalReasoner', 'ConceptMapper', 'PatternRecognizer',
          'SelfReflectionEngine', 'DebateEngine', 'ScientificReasoner', 'EthicalReasoner',
          'KurdishLanguageUtils', 'ImageAnalyzer', 'PdfExpert', 'TaskOrchestrator',
        ]
        sendJson(res, { ok: true, modules: moduleNames })
        return
      }

      if (pathname === '/api/config' && method === 'GET') {
        sendJson(res, {
          ok: true,
          config: {
            ollamaUrl: `http://${this.config.ollamaHost}:${this.config.ollamaPort}`,
            llamaCppUrl: `http://${this.config.llamaCppHost}:${this.config.llamaCppPort}`,
            defaultModel: this.config.defaultModel,
            dashboardPort: this.config.port,
            version: '2.3.0',
          },
        })
        return
      }

      // Page routes
      if (pathname === '/' && method === 'GET') {
        await this.refreshModelStatus()
        const stats = getSystemStats(this.sessions)
        stats.ollamaAvailable = await checkOllama(this.config.ollamaHost, this.config.ollamaPort)
        sendHtml(res, renderDashboardPage(stats, this.models))
        return
      }

      if (pathname === '/chat' && method === 'GET') {
        const query = parseQuery(url)
        const selectedModel = query.model ?? this.config.defaultModel
        sendHtml(res, renderChatPage(this.models, selectedModel))
        return
      }

      if (pathname === '/models' && method === 'GET') {
        await this.refreshModelStatus()
        sendHtml(res, renderModelsPage(this.models))
        return
      }

      if (pathname === '/modules' && method === 'GET') {
        sendHtml(res, renderModulesPage())
        return
      }

      if (pathname === '/settings' && method === 'GET') {
        sendHtml(res, renderSettingsPage(this.config))
        return
      }

      // 404
      sendHtml(res, render404Page(), 404)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      sendJson(res, { error: message }, 500)
    }
  }

  /** Handle chat API */
  private async handleChatApi(res: http.ServerResponse, body: string): Promise<void> {
    let parsed: { model?: string; messages?: Array<{ role: string; content: string }>; temperature?: number; maxTokens?: number }
    try {
      parsed = JSON.parse(body)
    } catch {
      sendJson(res, { error: 'Invalid JSON body' }, 400)
      return
    }

    const model = parsed.model ?? this.config.defaultModel
    const messages = parsed.messages ?? []
    const temperature = parsed.temperature ?? this.config.defaultTemperature
    const maxTokens = parsed.maxTokens ?? this.config.defaultMaxTokens

    if (messages.length === 0) {
      sendJson(res, { error: 'No messages provided' }, 400)
      return
    }

    try {
      const result = await chatWithOllama(
        this.config.ollamaHost,
        this.config.ollamaPort,
        model,
        messages,
        { temperature, maxTokens },
      )

      // Store in session
      const session: ChatSession = {
        id: generateId(),
        title: (messages[0]?.content ?? 'Chat').slice(0, 50),
        model,
        messages: messages.map(m => ({
          id: generateId(),
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          model,
          timestamp: Date.now(),
        })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Add assistant response
      session.messages.push({
        id: generateId(),
        role: 'assistant',
        content: result.text,
        model,
        timestamp: Date.now(),
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      })

      this.sessions.push(session)
      if (this.sessions.length > this.config.maxChatHistory) {
        this.sessions.shift()
      }

      sendJson(res, {
        text: result.text,
        model,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Chat request failed'
      sendJson(res, { error: `Failed to chat with model "${model}": ${msg}. Make sure Ollama is running (ollama serve) and the model is pulled (ollama pull ${model}).` }, 503)
    }
  }

  /** Handle settings API */
  private handleSettingsApi(res: http.ServerResponse, body: string): void {
    try {
      const settings = JSON.parse(body)
      if (settings.defaultModel) this.config.defaultModel = settings.defaultModel
      if (settings.ollamaHost) this.config.ollamaHost = settings.ollamaHost
      if (settings.ollamaPort) this.config.ollamaPort = parseInt(settings.ollamaPort, 10)
      if (settings.defaultTemperature) this.config.defaultTemperature = parseFloat(settings.defaultTemperature)
      if (settings.defaultMaxTokens) this.config.defaultMaxTokens = parseInt(settings.defaultMaxTokens, 10)
      if (settings.port) this.config.port = parseInt(settings.port, 10)
      sendJson(res, { ok: true, config: this.config })
    } catch {
      sendJson(res, { error: 'Invalid settings JSON' }, 400)
    }
  }

  /** Start the dashboard server */
  start(): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(err => {
          console.error('Dashboard error:', err)
          sendJson(res, { error: 'Internal server error' }, 500)
        })
      })

      this.server.on('error', reject)
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`\n🖥️  AI Dashboard running at http://localhost:${this.config.port}`)
        console.log(`   💬 Chat:     http://localhost:${this.config.port}/chat`)
        console.log(`   🤖 Models:   http://localhost:${this.config.port}/models`)
        console.log(`   📊 Modules:  http://localhost:${this.config.port}/modules`)
        console.log(`   ⚙️  Settings: http://localhost:${this.config.port}/settings`)
        console.log(`\n   Ollama: ${this.config.ollamaHost}:${this.config.ollamaPort}`)
        console.log(`   100% Local — No external APIs\n`)
        resolve(this.server!)
      })
    })
  }

  /** Stop the dashboard server */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve()
        return
      }
      this.server.close(err => {
        if (err) reject(err)
        else {
          this.server = null
          resolve()
        }
      })
    })
  }

  /** Check if server is running */
  isRunning(): boolean {
    return this.server !== null && this.server.listening
  }
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

/** Backward-compatible startDashboard function (used by main branch tests) */
export function startDashboard(port?: number): http.Server {
  const dashboard = new DashboardServer({ port: port ?? DEFAULT_CONFIG.port })
  const server = http.createServer((req, res) => {
    dashboard.handleRequest(req, res).catch(err => {
      console.error('Dashboard error:', err)
      sendJson(res, { error: 'Internal server error' }, 500)
    })
  })
  server.listen(port ?? DEFAULT_CONFIG.port, DEFAULT_CONFIG.host)
  return server
}

if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  const dashboard = new DashboardServer()
  dashboard.start().catch(err => {
    console.error('Failed to start dashboard:', err)
    process.exit(1)
  })
}
