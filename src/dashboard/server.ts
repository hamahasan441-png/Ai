/**
 * AI Dashboard Server
 *
 * A professional web UI dashboard for managing local AI models,
 * monitoring system status, and interacting with the AI.
 * Runs fully offline — no external API dependencies.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { resolve, extname } from 'path'
import { readFile, readdir, stat } from 'fs/promises'
import { execSync } from 'child_process'

const DEFAULT_PORT = parseInt(process.env.AI_DASHBOARD_PORT ?? '3210', 10)

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

// ── Helper: get Ollama models ─────────────────────────────────────────────────
async function getOllamaModels(): Promise<object[]> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const resp = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!resp.ok) return []
    const data = (await resp.json()) as { models?: object[] }
    return data.models ?? []
  } catch {
    return []
  }
}

// ── Helper: get system info ───────────────────────────────────────────────────
function getSystemInfo(): Record<string, unknown> {
  const mem = process.memoryUsage()
  let ollamaRunning = false
  try {
    execSync('curl -sf http://localhost:11434/api/tags > /dev/null 2>&1', { timeout: 2000 })
    ollamaRunning = true
  } catch {
    /* ignored */
  }
  return {
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
  }
}

// ── Helper: list local chat modules ───────────────────────────────────────────
async function getChatModules(): Promise<string[]> {
  try {
    const chatDir = resolve(__dirname, '..', 'chat')
    const files = await readdir(chatDir)
    return files.filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'index.ts')
  } catch {
    return []
  }
}

// ── API route handler ─────────────────────────────────────────────────────────
async function handleAPI(path: string, _req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  switch (path) {
    case '/api/status': {
      const info = getSystemInfo()
      res.end(JSON.stringify({ ok: true, ...info }))
      break
    }
    case '/api/models': {
      const models = await getOllamaModels()
      res.end(JSON.stringify({ ok: true, models }))
      break
    }
    case '/api/modules': {
      const modules = await getChatModules()
      res.end(JSON.stringify({ ok: true, modules }))
      break
    }
    case '/api/config': {
      const config = {
        ollamaUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
        llamaCppUrl: process.env.LLAMACPP_BASE_URL ?? 'http://localhost:8080',
        defaultModel: process.env.AI_DEFAULT_MODEL ?? 'qwen2.5-coder:7b',
        dashboardPort: DEFAULT_PORT,
        version: '2.3.0',
      }
      res.end(JSON.stringify({ ok: true, config }))
      break
    }
    default:
      res.statusCode = 404
      res.end(JSON.stringify({ ok: false, error: 'Not found' }))
  }
}

// ── Main request handler ──────────────────────────────────────────────────────
async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? '/'

  // API routes
  if (url.startsWith('/api/')) {
    await handleAPI(url.split('?')[0], req, res)
    return
  }

  // Serve the SPA dashboard
  const html = getDashboardHTML()
  res.setHeader('Content-Type', 'text/html')
  res.end(html)
}

// ── Start server ──────────────────────────────────────────────────────────────
export function startDashboard(port?: number): ReturnType<typeof createServer> {
  const p = port ?? DEFAULT_PORT
  const server = createServer(handler)
  server.listen(p, () => {
    console.log(`\n  🤖 AI Dashboard running at http://localhost:${p}\n`)
  })
  return server
}

// ── CLI entry ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  startDashboard()
}

// ── Dashboard HTML (self-contained SPA) ───────────────────────────────────────
function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Dashboard</title>
  <style>
    :root {
      --bg-primary: #0a0e17;
      --bg-secondary: #111827;
      --bg-card: #1a2332;
      --bg-card-hover: #1f2b3d;
      --bg-input: #0d1321;
      --border-color: #2a3a50;
      --border-active: #3b82f6;
      --text-primary: #e2e8f0;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-green: #10b981;
      --accent-amber: #f59e0b;
      --accent-red: #ef4444;
      --accent-cyan: #06b6d4;
      --gradient-primary: linear-gradient(135deg, #3b82f6, #8b5cf6);
      --gradient-green: linear-gradient(135deg, #10b981, #06b6d4);
      --gradient-amber: linear-gradient(135deg, #f59e0b, #ef4444);
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
      --shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }
    a { color: var(--accent-blue); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Layout ── */
    .app { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      transition: transform 0.3s;
    }
    .main {
      flex: 1;
      margin-left: 260px;
      padding: 32px;
      min-height: 100vh;
    }

    /* ── Logo ── */
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px 24px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 24px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--gradient-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 15px rgba(59,130,246,0.3);
    }
    .logo-text { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .logo-version {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--bg-card);
      padding: 2px 8px;
      border-radius: 20px;
      margin-left: auto;
    }

    /* ── Nav ── */
    .nav { list-style: none; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
    }
    .nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
    .nav-item.active {
      background: rgba(59,130,246,0.12);
      color: var(--accent-blue);
      font-weight: 600;
    }
    .nav-icon { font-size: 18px; width: 24px; text-align: center; }
    .nav-badge {
      margin-left: auto;
      background: var(--accent-blue);
      color: white;
      font-size: 11px;
      padding: 1px 7px;
      border-radius: 20px;
      font-weight: 600;
    }

    /* ── Sidebar footer ── */
    .sidebar-footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
    }
    .status-dot.online { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }
    .status-dot.offline { background: var(--accent-red); box-shadow: 0 0 6px var(--accent-red); }
    .status-text { font-size: 13px; color: var(--text-secondary); }

    /* ── Page Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
    .header-actions { display: flex; gap: 12px; }

    /* ── Cards ── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      transition: all 0.2s;
    }
    .card:hover { border-color: var(--border-active); box-shadow: var(--shadow-md); }
    .card-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ── Grid ── */
    .grid { display: grid; gap: 20px; }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }

    /* ── Stat cards ── */
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.2s;
    }
    .stat-card:hover { border-color: var(--border-active); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .stat-icon.blue { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
    .stat-icon.green { background: rgba(16,185,129,0.15); color: var(--accent-green); }
    .stat-icon.purple { background: rgba(139,92,246,0.15); color: var(--accent-purple); }
    .stat-icon.amber { background: rgba(245,158,11,0.15); color: var(--accent-amber); }
    .stat-icon.cyan { background: rgba(6,182,212,0.15); color: var(--accent-cyan); }
    .stat-icon.red { background: rgba(239,68,68,0.15); color: var(--accent-red); }
    .stat-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
    .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    .stat-change {
      font-size: 12px;
      margin-top: 6px;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
    }
    .stat-change.up { background: rgba(16,185,129,0.1); color: var(--accent-green); }
    .stat-change.neutral { background: rgba(100,116,139,0.1); color: var(--text-muted); }

    /* ── Model cards ── */
    .model-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
      transition: all 0.2s;
      cursor: pointer;
    }
    .model-card:hover { border-color: var(--accent-purple); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .model-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .model-name { font-size: 16px; font-weight: 600; }
    .model-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-ready { background: rgba(16,185,129,0.15); color: var(--accent-green); }
    .badge-download { background: rgba(245,158,11,0.15); color: var(--accent-amber); }
    .badge-active { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
    .model-meta { display: flex; gap: 16px; margin-top: 12px; }
    .model-meta-item { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

    /* ── Table ── */
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(42,58,80,0.5); font-size: 14px; }
    tr:hover td { background: rgba(59,130,246,0.04); }

    /* ── Buttons ── */
    .btn {
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s;
    }
    .btn-primary { background: var(--gradient-primary); color: white; }
    .btn-primary:hover { opacity: 0.9; box-shadow: 0 4px 15px rgba(59,130,246,0.3); }
    .btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); }
    .btn-secondary:hover { border-color: var(--border-active); }
    .btn-danger { background: rgba(239,68,68,0.15); color: var(--accent-red); border: 1px solid rgba(239,68,68,0.3); }
    .btn-sm { padding: 6px 14px; font-size: 13px; }

    /* ── Chat ── */
    .chat-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 140px);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .chat-message {
      max-width: 80%;
      padding: 14px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
    }
    .chat-message.user {
      align-self: flex-end;
      background: var(--gradient-primary);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .chat-message.assistant {
      align-self: flex-start;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-bottom-left-radius: 4px;
    }
    .chat-message pre {
      background: var(--bg-primary);
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 13px;
    }
    .chat-input-area {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 12px;
      background: var(--bg-secondary);
    }
    .chat-input {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: var(--accent-blue); }
    .chat-input::placeholder { color: var(--text-muted); }

    /* ── Progress bars ── */
    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--bg-input);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s;
    }
    .progress-fill.blue { background: var(--gradient-primary); }
    .progress-fill.green { background: var(--gradient-green); }

    /* ── Tags ── */
    .tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 4px;
    }
    .tag-blue { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
    .tag-green { background: rgba(16,185,129,0.15); color: var(--accent-green); }
    .tag-purple { background: rgba(139,92,246,0.15); color: var(--accent-purple); }
    .tag-amber { background: rgba(245,158,11,0.15); color: var(--accent-amber); }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* ── Responsive ── */
    @media (max-width: 1200px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main { margin-left: 0; padding: 16px; }
      .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
    }

    /* ── Animations ── */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    .pulse { animation: pulse 2s infinite; }

    /* ── Empty state ── */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    .empty-state-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }

    /* ── Spinner ── */
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Section divider ── */
    .section { margin-bottom: 32px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-title { font-size: 18px; font-weight: 600; }

    /* ── Module list ── */
    .module-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
    .module-item {
      padding: 10px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
    }
    .module-item:hover { border-color: var(--accent-purple); background: var(--bg-card-hover); }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app" id="app">
    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
      <div class="logo">
        <div class="logo-icon">🤖</div>
        <span class="logo-text">AI</span>
        <span class="logo-version" id="version">v2.3.0</span>
      </div>

      <ul class="nav" id="nav">
        <li class="nav-item active" data-page="dashboard" onclick="navigate('dashboard')">
          <span class="nav-icon">📊</span> Dashboard
        </li>
        <li class="nav-item" data-page="models" onclick="navigate('models')">
          <span class="nav-icon">🧠</span> Models
          <span class="nav-badge" id="model-count">0</span>
        </li>
        <li class="nav-item" data-page="modules" onclick="navigate('modules')">
          <span class="nav-icon">📦</span> Modules
          <span class="nav-badge" id="module-count">0</span>
        </li>
        <li class="nav-item" data-page="chat" onclick="navigate('chat')">
          <span class="nav-icon">💬</span> Chat
        </li>
        <li class="nav-item" data-page="settings" onclick="navigate('settings')">
          <span class="nav-icon">⚙️</span> Settings
        </li>
      </ul>

      <div class="sidebar-footer">
        <div style="display:flex;align-items:center;padding:8px 12px">
          <span class="status-dot" id="status-dot"></span>
          <span class="status-text" id="status-text">Checking…</span>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main" id="content">
      <!-- Rendered by JS -->
    </main>
  </div>

  <script>
    // ── State ──
    let state = {
      page: 'dashboard',
      status: null,
      models: [],
      modules: [],
      config: null,
      chatMessages: [
        { role: 'assistant', content: 'Hello! I am your local AI assistant. All processing happens on your machine — no cloud APIs needed. How can I help you today?' }
      ],
    };

    // ── API ──
    async function fetchJSON(url) {
      try {
        const r = await fetch(url);
        return await r.json();
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    async function refreshData() {
      const [statusRes, modelsRes, modulesRes, configRes] = await Promise.all([
        fetchJSON('/api/status'),
        fetchJSON('/api/models'),
        fetchJSON('/api/modules'),
        fetchJSON('/api/config'),
      ]);
      state.status = statusRes;
      state.models = modelsRes.models || [];
      state.modules = modulesRes.modules || [];
      state.config = configRes.config || {};
      document.getElementById('model-count').textContent = state.models.length;
      document.getElementById('module-count').textContent = state.modules.length;

      const dot = document.getElementById('status-dot');
      const txt = document.getElementById('status-text');
      if (statusRes.ollamaRunning) {
        dot.className = 'status-dot online';
        txt.textContent = 'Ollama Online';
      } else {
        dot.className = 'status-dot offline';
        txt.textContent = 'Ollama Offline';
      }
      render();
    }

    // ── Navigation ──
    function navigate(page) {
      state.page = page;
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
      });
      render();
    }

    // ── Render ──
    function render() {
      const el = document.getElementById('content');
      switch (state.page) {
        case 'dashboard': el.innerHTML = renderDashboard(); break;
        case 'models': el.innerHTML = renderModels(); break;
        case 'modules': el.innerHTML = renderModules(); break;
        case 'chat': el.innerHTML = renderChat(); setupChat(); break;
        case 'settings': el.innerHTML = renderSettings(); break;
      }
    }

    // ── Dashboard Page ──
    function renderDashboard() {
      const s = state.status || {};
      const modelCount = state.models.length;
      const moduleCount = state.modules.length;
      const memPercent = s.heapTotalMB ? Math.round((s.heapUsedMB / s.heapTotalMB) * 100) : 0;

      return \`
        <div class="fade-in">
          <div class="page-header">
            <div>
              <h1 class="page-title">Dashboard</h1>
              <p class="page-subtitle">System overview and performance metrics</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" onclick="refreshData()">🔄 Refresh</button>
            </div>
          </div>

          <div class="grid grid-4" style="margin-bottom:24px">
            <div class="stat-card">
              <div class="stat-icon blue">🧠</div>
              <div>
                <div class="stat-value">\${modelCount}</div>
                <div class="stat-label">Local Models</div>
                <span class="stat-change \${modelCount > 0 ? 'up' : 'neutral'}">\${modelCount > 0 ? '✓ Ready' : '⬇ Install models'}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple">📦</div>
              <div>
                <div class="stat-value">\${moduleCount}</div>
                <div class="stat-label">AI Modules</div>
                <span class="stat-change up">All loaded</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">💾</div>
              <div>
                <div class="stat-value">\${s.memoryMB || 0} MB</div>
                <div class="stat-label">Memory Usage</div>
                <span class="stat-change neutral">RSS</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon amber">⏱️</div>
              <div>
                <div class="stat-value">\${formatUptime(s.uptime || 0)}</div>
                <div class="stat-label">Uptime</div>
                <span class="stat-change neutral">PID \${s.pid || '—'}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="card">
              <div class="card-title">System Information</div>
              <table>
                <tr><td style="color:var(--text-secondary)">Platform</td><td>\${s.platform || '—'} / \${s.arch || '—'}</td></tr>
                <tr><td style="color:var(--text-secondary)">Node.js</td><td>\${s.nodeVersion || '—'}</td></tr>
                <tr><td style="color:var(--text-secondary)">Heap Used</td><td>\${s.heapUsedMB || 0} / \${s.heapTotalMB || 0} MB (\${memPercent}%)</td></tr>
                <tr><td style="color:var(--text-secondary)">Ollama</td><td>\${s.ollamaRunning ? '<span style="color:var(--accent-green)">● Running</span>' : '<span style="color:var(--accent-red)">● Not running</span>'}</td></tr>
                <tr><td style="color:var(--text-secondary)">Working Dir</td><td style="font-family:monospace;font-size:12px">\${s.cwd || '—'}</td></tr>
              </table>
            </div>
            <div class="card">
              <div class="card-title">Memory Usage</div>
              <div style="padding:16px 0">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <span style="font-size:13px;color:var(--text-secondary)">Heap Used</span>
                  <span style="font-size:13px;font-weight:600">\${memPercent}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill blue" style="width:\${memPercent}%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:20px;margin-bottom:8px">
                  <span style="font-size:13px;color:var(--text-secondary)">RSS Memory</span>
                  <span style="font-size:13px;font-weight:600">\${s.memoryMB || 0} MB</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill green" style="width:\${Math.min(100, (s.memoryMB || 0) / 10)}%"></div>
                </div>
              </div>
            </div>
          </div>

          \${state.models.length > 0 ? \`
          <div class="section" style="margin-top:24px">
            <div class="section-header">
              <h2 class="section-title">Installed Models</h2>
              <button class="btn btn-secondary btn-sm" onclick="navigate('models')">View All →</button>
            </div>
            <div class="grid grid-3">
              \${state.models.slice(0, 3).map(m => renderModelMiniCard(m)).join('')}
            </div>
          </div>
          \` : \`
          <div class="card" style="margin-top:24px;text-align:center;padding:40px">
            <div style="font-size:40px;margin-bottom:12px">🚀</div>
            <h3 style="margin-bottom:8px">Get Started with Local AI</h3>
            <p style="color:var(--text-secondary);margin-bottom:16px">Install Ollama and pull a model to begin using AI locally.</p>
            <code style="background:var(--bg-input);padding:8px 16px;border-radius:8px;font-size:13px;display:inline-block">ollama pull qwen2.5-coder:7b</code>
          </div>
          \`}
        </div>
      \`;
    }

    function renderModelMiniCard(m) {
      const size = m.size ? formatSize(m.size) : '—';
      return \`
        <div class="model-card" onclick="navigate('models')">
          <div class="model-card-header">
            <span class="model-name">\${m.name || m.model || '—'}</span>
            <span class="model-badge badge-ready">Ready</span>
          </div>
          <div class="model-meta">
            <span class="model-meta-item">💾 \${size}</span>
            \${m.details?.parameter_size ? \`<span class="model-meta-item">🔢 \${m.details.parameter_size}</span>\` : ''}
            \${m.details?.quantization_level ? \`<span class="model-meta-item">📐 \${m.details.quantization_level}</span>\` : ''}
          </div>
        </div>
      \`;
    }

    // ── Models Page ──
    function renderModels() {
      return \`
        <div class="fade-in">
          <div class="page-header">
            <div>
              <h1 class="page-title">Models</h1>
              <p class="page-subtitle">Manage your local AI models — all running offline</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" onclick="refreshData()">🔄 Refresh</button>
            </div>
          </div>

          <div class="card" style="margin-bottom:24px;padding:16px 20px">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:13px;color:var(--text-secondary)">Ollama:</span>
                \${state.status?.ollamaRunning ?
                  '<span class="tag tag-green">● Online</span>' :
                  '<span class="tag tag-amber">● Offline</span>'}
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:13px;color:var(--text-secondary)">Total Models:</span>
                <strong>\${state.models.length}</strong>
              </div>
              <div style="margin-left:auto;font-size:12px;color:var(--text-muted)">
                Models are served via Ollama (localhost:11434)
              </div>
            </div>
          </div>

          \${state.models.length > 0 ? \`
            <div class="grid grid-3">
              \${state.models.map(m => {
                const size = m.size ? formatSize(m.size) : '—';
                const modified = m.modified_at ? new Date(m.modified_at).toLocaleDateString() : '—';
                return \`
                  <div class="model-card">
                    <div class="model-card-header">
                      <span class="model-name">\${m.name || m.model || '—'}</span>
                      <span class="model-badge badge-ready">Ready</span>
                    </div>
                    <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">\${m.details?.family || 'Local Model'}</p>
                    <div class="model-meta">
                      <span class="model-meta-item">💾 \${size}</span>
                      \${m.details?.parameter_size ? \`<span class="model-meta-item">🔢 \${m.details.parameter_size}</span>\` : ''}
                      \${m.details?.quantization_level ? \`<span class="model-meta-item">📐 \${m.details.quantization_level}</span>\` : ''}
                      <span class="model-meta-item">📅 \${modified}</span>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          \` : \`
            <div class="empty-state">
              <div class="empty-state-icon">🧠</div>
              <div class="empty-state-title">No Models Installed</div>
              <p style="margin-bottom:20px">Install Ollama and pull models to get started.</p>
              <div style="display:flex;flex-direction:column;gap:8px;max-width:400px;margin:0 auto;text-align:left">
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">curl -fsSL https://ollama.com/install.sh | sh</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama pull qwen2.5-coder:7b</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama pull llama3.1:8b</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama pull mistral:7b</code>
              </div>
            </div>
          \`}

          <div class="section" style="margin-top:32px">
            <div class="section-header">
              <h2 class="section-title">Recommended Models</h2>
            </div>
            <div class="table-container card" style="padding:0;overflow:hidden">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Best For</th>
                    <th>Install</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>qwen2.5-coder:7b</strong></td>
                    <td>4.7 GB</td>
                    <td><span class="tag tag-blue">Code</span></td>
                    <td>Code generation, analysis, debugging</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull qwen2.5-coder:7b</code></td>
                  </tr>
                  <tr>
                    <td><strong>llama3.1:8b</strong></td>
                    <td>4.9 GB</td>
                    <td><span class="tag tag-purple">General</span></td>
                    <td>General tasks, reasoning, chat</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull llama3.1:8b</code></td>
                  </tr>
                  <tr>
                    <td><strong>mistral:7b</strong></td>
                    <td>4.1 GB</td>
                    <td><span class="tag tag-green">General</span></td>
                    <td>Fast inference, good balance</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull mistral:7b</code></td>
                  </tr>
                  <tr>
                    <td><strong>deepseek-coder:6.7b</strong></td>
                    <td>3.8 GB</td>
                    <td><span class="tag tag-blue">Code</span></td>
                    <td>Code completion, fill-in-middle</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull deepseek-coder:6.7b</code></td>
                  </tr>
                  <tr>
                    <td><strong>codellama:7b</strong></td>
                    <td>3.8 GB</td>
                    <td><span class="tag tag-blue">Code</span></td>
                    <td>Code generation, Meta's model</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull codellama:7b</code></td>
                  </tr>
                  <tr>
                    <td><strong>phi3:mini</strong></td>
                    <td>2.3 GB</td>
                    <td><span class="tag tag-amber">Compact</span></td>
                    <td>Lightweight, low memory usage</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull phi3:mini</code></td>
                  </tr>
                  <tr>
                    <td><strong>gemma2:9b</strong></td>
                    <td>5.4 GB</td>
                    <td><span class="tag tag-purple">General</span></td>
                    <td>Google's model, reasoning</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull gemma2:9b</code></td>
                  </tr>
                  <tr>
                    <td><strong>starcoder2:7b</strong></td>
                    <td>4.0 GB</td>
                    <td><span class="tag tag-blue">Code</span></td>
                    <td>Multi-language code completion</td>
                    <td><code style="font-size:12px;background:var(--bg-input);padding:4px 8px;border-radius:4px">ollama pull starcoder2:7b</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      \`;
    }

    // ── Modules Page ──
    function renderModules() {
      return \`
        <div class="fade-in">
          <div class="page-header">
            <div>
              <h1 class="page-title">AI Modules</h1>
              <p class="page-subtitle">\${state.modules.length} modules loaded — all running locally</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" onclick="refreshData()">🔄 Refresh</button>
            </div>
          </div>

          <div class="card" style="margin-bottom:24px">
            <div class="card-title">Module Categories</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span class="tag tag-blue">Core AI</span>
              <span class="tag tag-purple">Code Analysis</span>
              <span class="tag tag-green">Security</span>
              <span class="tag tag-amber">Planning</span>
              <span class="tag tag-blue">Search</span>
              <span class="tag tag-purple">Memory</span>
              <span class="tag tag-green">Debugging</span>
              <span class="tag tag-amber">Knowledge</span>
            </div>
          </div>

          \${state.modules.length > 0 ? \`
            <div class="module-grid">
              \${state.modules.map(m => {
                const name = m.replace('.ts', '');
                const icon = getModuleIcon(name);
                return \`<div class="module-item">\${icon} \${name}</div>\`;
              }).join('')}
            </div>
          \` : \`
            <div class="empty-state">
              <div class="empty-state-icon">📦</div>
              <div class="empty-state-title">No Modules Found</div>
              <p>Chat modules should be in src/chat/</p>
            </div>
          \`}
        </div>
      \`;
    }

    // ── Chat Page ──
    function renderChat() {
      return \`
        <div class="fade-in" style="height:calc(100vh - 64px)">
          <div class="page-header" style="margin-bottom:16px">
            <div>
              <h1 class="page-title">Chat</h1>
              <p class="page-subtitle">Talk to your local AI — all processing stays on your machine</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" onclick="clearChat()">🗑️ Clear</button>
            </div>
          </div>

          <div class="chat-container">
            <div class="chat-messages" id="chat-messages">
              \${state.chatMessages.map(msg => \`
                <div class="chat-message \${msg.role}">
                  \${escapeHtml(msg.content)}
                </div>
              \`).join('')}
            </div>
            <div class="chat-input-area">
              <input
                type="text"
                class="chat-input"
                id="chat-input"
                placeholder="Type a message…"
                onkeydown="if(event.key==='Enter')sendMessage()"
              />
              <button class="btn btn-primary" onclick="sendMessage()">Send ➤</button>
            </div>
          </div>
        </div>
      \`;
    }

    function setupChat() {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
      const input = document.getElementById('chat-input');
      if (input) input.focus();
    }

    async function sendMessage() {
      const input = document.getElementById('chat-input');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      input.value = '';

      state.chatMessages.push({ role: 'user', content: text });
      render();

      // Try to send to Ollama for a real response
      try {
        const ollamaUrl = state.config?.ollamaUrl || 'http://localhost:11434';
        const model = state.config?.defaultModel || 'qwen2.5-coder:7b';
        const response = await fetch(ollamaUrl + '/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt: text, stream: false }),
        });
        if (response.ok) {
          const data = await response.json();
          state.chatMessages.push({ role: 'assistant', content: data.response || 'No response.' });
        } else {
          state.chatMessages.push({ role: 'assistant', content: 'I received your message but could not generate a response. Make sure Ollama is running with a model loaded.' });
        }
      } catch {
        state.chatMessages.push({ role: 'assistant', content: 'Unable to connect to Ollama. Please make sure it is running (ollama serve) and a model is installed.' });
      }
      render();
    }

    function clearChat() {
      state.chatMessages = [
        { role: 'assistant', content: 'Chat cleared. How can I help you?' }
      ];
      render();
    }

    // ── Settings Page ──
    function renderSettings() {
      const c = state.config || {};
      return \`
        <div class="fade-in">
          <div class="page-header">
            <div>
              <h1 class="page-title">Settings</h1>
              <p class="page-subtitle">Configure your local AI environment</p>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="card">
              <div class="card-title">Backend Configuration</div>
              <table>
                <tr><td style="color:var(--text-secondary)">Ollama URL</td><td><code>\${c.ollamaUrl || '—'}</code></td></tr>
                <tr><td style="color:var(--text-secondary)">llama.cpp URL</td><td><code>\${c.llamaCppUrl || '—'}</code></td></tr>
                <tr><td style="color:var(--text-secondary)">Default Model</td><td><code>\${c.defaultModel || '—'}</code></td></tr>
                <tr><td style="color:var(--text-secondary)">Dashboard Port</td><td><code>\${c.dashboardPort || '—'}</code></td></tr>
                <tr><td style="color:var(--text-secondary)">Version</td><td><code>\${c.version || '—'}</code></td></tr>
              </table>
            </div>
            <div class="card">
              <div class="card-title">Quick Commands</div>
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama serve</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama pull qwen2.5-coder:7b</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">ollama list</code>
                <code style="background:var(--bg-input);padding:10px 14px;border-radius:8px;font-size:13px;display:block">npm run dashboard</code>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:24px">
            <div class="card-title">About</div>
            <p style="color:var(--text-secondary);line-height:1.8;font-size:14px">
              This AI system runs <strong>entirely locally</strong> on your machine. No cloud APIs, no external services,
              no API keys needed. All models are served through <a href="https://ollama.com" target="_blank">Ollama</a>
              or <a href="https://github.com/ggerganov/llama.cpp" target="_blank">llama.cpp</a>.<br><br>
              Supported local models include Qwen 2.5 Coder, LLaMA 3.x, Mistral, DeepSeek Coder, CodeLlama,
              Phi-3, Gemma 2, StarCoder 2, and many more through Ollama's model library.
            </p>
          </div>
        </div>
      \`;
    }

    // ── Helpers ──
    function formatUptime(seconds) {
      if (seconds < 60) return seconds + 's';
      if (seconds < 3600) return Math.floor(seconds/60) + 'm ' + (seconds%60) + 's';
      const h = Math.floor(seconds/3600);
      const m = Math.floor((seconds%3600)/60);
      return h + 'h ' + m + 'm';
    }

    function formatSize(bytes) {
      if (bytes > 1e9) return (bytes/1e9).toFixed(1) + ' GB';
      if (bytes > 1e6) return (bytes/1e6).toFixed(1) + ' MB';
      return (bytes/1e3).toFixed(1) + ' KB';
    }

    function getModuleIcon(name) {
      const n = name.toLowerCase();
      if (n.includes('brain') || n.includes('spark')) return '🧠';
      if (n.includes('exploit') || n.includes('security') || n.includes('blackhat')) return '🔐';
      if (n.includes('search') || n.includes('query')) return '🔍';
      if (n.includes('memory') || n.includes('semantic')) return '💾';
      if (n.includes('plan') || n.includes('orchestrat')) return '📋';
      if (n.includes('debug') || n.includes('overflow')) return '🐛';
      if (n.includes('code') || n.includes('analysis')) return '💻';
      if (n.includes('llm') || n.includes('qwen') || n.includes('model')) return '🤖';
      if (n.includes('visual') || n.includes('data')) return '📊';
      if (n.includes('conversation') || n.includes('dialogue')) return '💬';
      if (n.includes('knowledge') || n.includes('bounty')) return '📚';
      return '📦';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // ── Boot ──
    refreshData();
    setInterval(refreshData, 15000);
  </script>
</body>
</html>`;
}
