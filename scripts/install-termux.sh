#!/data/data/com.termux/files/usr/bin/bash
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  AI — Termux Installation Script                                            ║
# ║                                                                              ║
# ║  Run inside Termux:                                                          ║
# ║    bash scripts/install-termux.sh                                            ║
# ║                                                                              ║
# ║  Or one-line install:                                                        ║
# ║    curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-termux.sh | bash  ║
# ║                                                                              ║
# ║  Options:                                                                    ║
# ║    --with-voice    Install audio dependencies (sox)                          ║
# ║    --with-sqlite   Install SQLite for DatabaseTool                           ║
# ║    --with-python   Install Python + security/networking packages             ║
# ║    --full          Install everything (voice + sqlite + python + tools)      ║
# ║    --dev           Clone and install from source (development mode)          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${BLUE}ℹ${NC}  $*"; }
ok()    { echo -e "${GREEN}✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
error() { echo -e "${RED}✗${NC}  $*" >&2; }

# ── Parse arguments ──
WITH_VOICE=false
WITH_SQLITE=false
WITH_PYTHON=false
WITH_TOOLS=false
DEV_MODE=false

for arg in "$@"; do
  case "$arg" in
    --with-voice)  WITH_VOICE=true ;;
    --with-sqlite) WITH_SQLITE=true ;;
    --with-python) WITH_PYTHON=true ;;
    --full)
      WITH_VOICE=true
      WITH_SQLITE=true
      WITH_PYTHON=true
      WITH_TOOLS=true
      ;;
    --dev)         DEV_MODE=true ;;
    --help|-h)
      echo "Usage: install-termux.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --with-voice    Install audio dependencies (sox)"
      echo "  --with-sqlite   Install SQLite for DatabaseTool"
      echo "  --with-python   Install Python + security packages"
      echo "  --full          Install all optional dependencies"
      echo "  --dev           Clone and install from source"
      echo "  --help          Show this help"
      exit 0
      ;;
    *)
      warn "Unknown option: $arg"
      ;;
  esac
done

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🤖 AI — Termux Installation               ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

# ── Check Termux ──
if [ ! -d "/data/data/com.termux" ] && [ -z "${TERMUX_VERSION:-}" ]; then
  warn "This script is designed for Termux on Android."
  warn "Proceeding anyway, but some commands may not work."
fi

# ── Step 1: Update package repositories ──
info "Updating Termux packages..."
pkg update -y && pkg upgrade -y
ok "Packages updated"

# ── Step 2: Install core dependencies ──
info "Installing core dependencies (nodejs, git, build tools)..."
pkg install -y nodejs-lts git build-essential python make clang
ok "Core dependencies installed"

# Verify Node.js
NODE_VERSION=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VERSION" = "none" ]; then
  error "Node.js installation failed"
  exit 1
fi
ok "Node.js ${NODE_VERSION} ready"

# Verify npm
NPM_VERSION=$(npm -v 2>/dev/null || echo "none")
if [ "$NPM_VERSION" = "none" ]; then
  error "npm not found"
  exit 1
fi
ok "npm ${NPM_VERSION} ready"

# ── Step 3: Install optional - SQLite ──
if [ "$WITH_SQLITE" = true ]; then
  info "Installing SQLite..."
  pkg install -y libsqlite
  ok "SQLite installed"
fi

# ── Step 4: Install optional - Voice/Audio ──
if [ "$WITH_VOICE" = true ]; then
  info "Installing audio dependencies (sox)..."
  pkg install -y sox
  ok "Audio dependencies installed"
fi

# ── Step 5: Install optional - Python packages ──
if [ "$WITH_PYTHON" = true ]; then
  info "Installing Python packages for security/networking features..."
  pip install --upgrade pip 2>/dev/null || true
  pip install requests beautifulsoup4 cryptography paramiko 2>/dev/null || {
    warn "Some Python packages failed to install. You may need to install them manually."
  }
  ok "Python packages installed"
fi

# ── Step 6: Install optional - Extra tools ──
if [ "$WITH_TOOLS" = true ]; then
  info "Installing extra tools (tmux, ripgrep, curl, wget, nmap, openssl, net-tools)..."
  pkg install -y tmux ripgrep curl wget openssl net-tools nmap 2>/dev/null || {
    warn "Some tools failed to install. Install them individually with: pkg install <name>"
  }
  ok "Extra tools installed"
fi

# ── Step 7: Install AI ──
if [ "$DEV_MODE" = true ]; then
  info "Installing in development mode..."

  INSTALL_DIR="$HOME/Ai"

  if [ -d "$INSTALL_DIR" ]; then
    info "Updating existing installation at $INSTALL_DIR..."
    cd "$INSTALL_DIR"
    git pull
  else
    git clone https://github.com/hamahasan441-png/Ai.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi

  info "Running npm install (this may take a few minutes on Termux)..."
  npm install
  ok "Development installation complete at $INSTALL_DIR"
else
  info "Installing via npm..."

  npm install -g ai@latest 2>/dev/null || {
    info "Global npm install not available. Cloning from source..."
    INSTALL_DIR="$HOME/Ai"

    if [ -d "$INSTALL_DIR" ]; then
      cd "$INSTALL_DIR" && git pull
    else
      git clone https://github.com/hamahasan441-png/Ai.git "$INSTALL_DIR"
      cd "$INSTALL_DIR"
    fi

    npm install
    ok "Installed from source at $INSTALL_DIR"
  }
fi

# ── Step 8: Create data directories ──
info "Creating data directories..."

DATA_DIR="$HOME/.local/share/ai"
CACHE_DIR="$HOME/.cache/ai"
CONFIG_DIR="$HOME/.config/ai"

mkdir -p "$DATA_DIR" "$CACHE_DIR" "$CACHE_DIR/responses" "$CONFIG_DIR"
ok "Data:   $DATA_DIR"
ok "Cache:  $CACHE_DIR"
ok "Config: $CONFIG_DIR"

# ── Done ──
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅  Termux Installation Complete!          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DEV_MODE" = true ]; then
  info "Run: cd ${INSTALL_DIR} && npm test"
else
  info "To get started, set your API key:"
  echo "  export ANTHROPIC_API_KEY='your-key-here'"
fi

echo ""
info "Termux Tips:"
echo "  • Use 'termux-wake-lock' to prevent sleep during long operations"
echo "  • Use 'termux-storage-setup' to access shared storage"
echo "  • Run 'npm test' to verify installation"
echo ""
ok "🤖 AI is ready on Termux!"
