#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  AI — Linux Installation Script                                              ║
# ║                                                                              ║
# ║  One-line install:                                                           ║
# ║  curl -fsSL https://raw.githubusercontent.com/hamahasan441-png/Ai/main/scripts/install-linux.sh | bash  ║
# ║                                                                              ║
# ║  Options:                                                                    ║
# ║    --with-voice    Install audio dependencies (sox, alsa-utils)              ║
# ║    --with-sqlite   Install SQLite dev headers for DatabaseTool               ║
# ║    --dev           Install in development mode (clone from git)              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}ℹ${NC}  $*"; }
ok()    { echo -e "${GREEN}✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
error() { echo -e "${RED}✗${NC}  $*" >&2; }

# ── Parse arguments ──
WITH_VOICE=false
WITH_SQLITE=false
DEV_MODE=false

for arg in "$@"; do
  case "$arg" in
    --with-voice)  WITH_VOICE=true ;;
    --with-sqlite) WITH_SQLITE=true ;;
    --dev)         DEV_MODE=true ;;
    --help|-h)
      echo "Usage: install-linux.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --with-voice    Install audio dependencies (sox, alsa-utils)"
      echo "  --with-sqlite   Install SQLite dev headers"
      echo "  --dev           Clone and install from source (development mode)"
      echo "  --help          Show this help"
      exit 0
      ;;
    *)
      warn "Unknown option: $arg"
      ;;
  esac
done

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  🤖 AI — Installation for Linux            ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check Node.js ──
info "Checking Node.js..."

if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -ge 18 ]; then
    ok "Node.js $(node -v) found"
  else
    error "Node.js $(node -v) found but version 18+ is required"
    info "Installing Node.js via nvm..."

    if ! command -v nvm &>/dev/null; then
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    nvm install 22
    nvm use 22
    ok "Node.js $(node -v) installed via nvm"
  fi
else
  warn "Node.js not found. Installing via nvm..."

  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  nvm install 22
  nvm use 22
  ok "Node.js $(node -v) installed via nvm"
fi

# ── Step 2: Check Git ──
info "Checking Git..."

if command -v git &>/dev/null; then
  ok "Git $(git --version | cut -d' ' -f3) found"
else
  warn "Git not found. Installing..."

  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq git
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y git
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm git
  elif command -v apk &>/dev/null; then
    apk add git
  else
    error "Could not install git. Please install it manually."
    exit 1
  fi

  ok "Git installed"
fi

# ── Step 3: Optional dependencies ──
if [ "$WITH_VOICE" = true ]; then
  info "Installing audio dependencies..."

  if command -v apt-get &>/dev/null; then
    sudo apt-get install -y -qq sox alsa-utils libsox-fmt-all
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y sox alsa-utils
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm sox alsa-utils
  else
    warn "Could not auto-install audio deps. Please install sox and alsa-utils manually."
  fi

  ok "Audio dependencies installed"
fi

if [ "$WITH_SQLITE" = true ]; then
  info "Installing SQLite development headers..."

  if command -v apt-get &>/dev/null; then
    sudo apt-get install -y -qq libsqlite3-dev
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y sqlite-devel
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm sqlite
  else
    warn "Could not auto-install SQLite headers. Please install libsqlite3-dev manually."
  fi

  ok "SQLite headers installed"
fi

# ── Step 4: Install AI ──
if [ "$DEV_MODE" = true ]; then
  info "Installing in development mode..."

  INSTALL_DIR="$HOME/ai"

  if [ -d "$INSTALL_DIR" ]; then
    info "Updating existing installation at $INSTALL_DIR..."
    cd "$INSTALL_DIR"
    git pull
  else
    git clone https://github.com/hamahasan441-png/Ai.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi

  npm install
  ok "Development installation complete at $INSTALL_DIR"
else
  info "Installing via npm..."

  npm install -g ai@latest 2>/dev/null || {
    info "Global npm install failed. Trying with --prefix..."
    npm install --prefix "$HOME/.local" ai@latest 2>/dev/null || {
      warn "npm registry install not available. Cloning from source..."
      INSTALL_DIR="$HOME/ai"
      git clone https://github.com/hamahasan441-png/Ai.git "$INSTALL_DIR" 2>/dev/null || {
        cd "$INSTALL_DIR" && git pull
      }
      cd "$INSTALL_DIR"
      npm install
      ok "Installed from source at $INSTALL_DIR"
    }
  }
fi

# ── Step 5: Create data directories ──
info "Creating data directories..."

DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ai"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ai"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ai"

mkdir -p "$DATA_DIR" "$CACHE_DIR" "$CACHE_DIR/responses" "$CONFIG_DIR"
ok "Data: $DATA_DIR"
ok "Cache: $CACHE_DIR"
ok "Config: $CONFIG_DIR"

# ── Step 6: Verify installation ──
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✅  Installation Complete!                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""
info "Data directory:   $DATA_DIR"
info "Cache directory:  $CACHE_DIR"
info "Config directory: $CONFIG_DIR"
echo ""

if [ "$DEV_MODE" = true ]; then
  info "Run: cd $INSTALL_DIR && npm test"
else
  info "To get started, set your API key:"
  echo "  export ANTHROPIC_API_KEY='your-key-here'"
fi

echo ""
ok "🤖 AI is ready!"
