# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  AI — Windows Installation Script (PowerShell)                               ║
# ║                                                                              ║
# ║  One-line install:                                                           ║
# ║  irm https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-windows.ps1 | iex       ║
# ║                                                                              ║
# ║  Options:                                                                    ║
# ║    -WithSqlite     Install SQLite for DatabaseTool                           ║
# ║    -Dev            Install in development mode (clone from git)              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

param(
    [switch]$WithSqlite,
    [switch]$Dev,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# ── Colors ──
function Write-Info  { Write-Host "ℹ  $args" -ForegroundColor Cyan }
function Write-Ok    { Write-Host "✓  $args" -ForegroundColor Green }
function Write-Warn  { Write-Host "⚠  $args" -ForegroundColor Yellow }
function Write-Err   { Write-Host "✗  $args" -ForegroundColor Red }

if ($Help) {
    Write-Host "Usage: install-windows.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -WithSqlite   Install SQLite for DatabaseTool"
    Write-Host "  -Dev          Clone and install from source"
    Write-Host "  -Help         Show this help"
    exit 0
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║  🤖 AI — Installation for Windows          ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""

# ── Step 1: Check Node.js ──
Write-Info "Checking Node.js..."

$nodeExists = $null
try { $nodeExists = Get-Command node -ErrorAction SilentlyContinue } catch {}

if ($nodeExists) {
    $nodeVersion = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
    if ([int]$nodeVersion -ge 18) {
        Write-Ok "Node.js $(node -v) found"
    } else {
        Write-Err "Node.js $(node -v) found but version 18+ is required"
        Write-Info "Please install Node.js 22 LTS from https://nodejs.org/"

        # Try winget
        $wingetExists = $null
        try { $wingetExists = Get-Command winget -ErrorAction SilentlyContinue } catch {}
        if ($wingetExists) {
            Write-Info "Installing via winget..."
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
            Write-Ok "Node.js installed via winget. Please restart your terminal."
            exit 0
        }

        # Try chocolatey
        $chocoExists = $null
        try { $chocoExists = Get-Command choco -ErrorAction SilentlyContinue } catch {}
        if ($chocoExists) {
            Write-Info "Installing via Chocolatey..."
            choco install nodejs-lts -y
            Write-Ok "Node.js installed via Chocolatey. Please restart your terminal."
            exit 0
        }

        Write-Err "Please install Node.js manually from https://nodejs.org/"
        exit 1
    }
} else {
    Write-Warn "Node.js not found."

    $wingetExists = $null
    try { $wingetExists = Get-Command winget -ErrorAction SilentlyContinue } catch {}
    if ($wingetExists) {
        Write-Info "Installing Node.js via winget..."
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        Write-Ok "Node.js installed. Please restart your terminal and re-run this script."
        exit 0
    }

    $chocoExists = $null
    try { $chocoExists = Get-Command choco -ErrorAction SilentlyContinue } catch {}
    if ($chocoExists) {
        Write-Info "Installing Node.js via Chocolatey..."
        choco install nodejs-lts -y
        Write-Ok "Node.js installed. Please restart your terminal and re-run this script."
        exit 0
    }

    Write-Err "Please install Node.js 22 LTS from https://nodejs.org/"
    exit 1
}

# ── Step 2: Check Git ──
Write-Info "Checking Git..."

$gitExists = $null
try { $gitExists = Get-Command git -ErrorAction SilentlyContinue } catch {}

if ($gitExists) {
    Write-Ok "Git found"
} else {
    Write-Warn "Git not found."

    $wingetExists = $null
    try { $wingetExists = Get-Command winget -ErrorAction SilentlyContinue } catch {}
    if ($wingetExists) {
        Write-Info "Installing Git via winget..."
        winget install Git.Git --accept-package-agreements --accept-source-agreements
        Write-Ok "Git installed. Please restart your terminal."
        exit 0
    }

    Write-Err "Please install Git from https://git-scm.com/download/win"
    exit 1
}

# ── Step 3: Install AI ──
if ($Dev) {
    Write-Info "Installing in development mode..."

    $installDir = "$env:USERPROFILE\ai"

    if (Test-Path $installDir) {
        Write-Info "Updating existing installation..."
        Set-Location $installDir
        git pull
    } else {
        git clone https://github.com/hamahasan441-png/Ai.git $installDir
        Set-Location $installDir
    }

    npm install
    Write-Ok "Development installation complete at $installDir"
} else {
    Write-Info "Installing via npm..."

    try {
        npm install -g ai@latest 2>$null
        Write-Ok "Installed globally via npm"
    } catch {
        Write-Warn "npm registry install not available. Cloning from source..."
        $installDir = "$env:USERPROFILE\ai"

        if (-not (Test-Path $installDir)) {
            git clone https://github.com/hamahasan441-png/Ai.git $installDir
        } else {
            Set-Location $installDir
            git pull
        }

        Set-Location $installDir
        npm install
        Write-Ok "Installed from source at $installDir"
    }
}

# ── Step 4: Create data directories ──
Write-Info "Creating data directories..."

$appData = $env:APPDATA
$localAppData = $env:LOCALAPPDATA

$dataDir = "$appData\ai"
$cacheDir = "$localAppData\ai\cache"
$configDir = "$appData\ai\config"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
New-Item -ItemType Directory -Force -Path "$cacheDir\responses" | Out-Null
New-Item -ItemType Directory -Force -Path $configDir | Out-Null

Write-Ok "Data: $dataDir"
Write-Ok "Cache: $cacheDir"
Write-Ok "Config: $configDir"

# ── Step 5: Done ──
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║  ✅  Installation Complete!                 ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""
Write-Info "Data directory:   $dataDir"
Write-Info "Cache directory:  $cacheDir"
Write-Info "Config directory: $configDir"
Write-Host ""

if ($Dev) {
    Write-Info "Run: cd $installDir; npm test"
} else {
    Write-Info "To get started, set your API key:"
    Write-Host '  $env:ANTHROPIC_API_KEY = "your-key-here"'
}

Write-Host ""
Write-Ok "🤖 AI is ready!"
