# 🤖 AI Assistant - Android APK

> **120+ AI modules, fully offline, no external APIs** — packaged as an Android application.

## 📱 Overview

This is the Android APK version of the AI Assistant project. It wraps all 120+ AI intelligence modules into a native Android application using React Native and Expo.

### Key Features

- 🔒 **100% Offline** — No internet connection required
- 🚫 **No External APIs** — No cloud services, no API keys needed
- 🔐 **Privacy First** — All data stays on your device
- 🧠 **120+ AI Modules** — Full intelligence suite
- 📱 **Native Android** — Smooth, responsive UI

### AI Module Categories

| Category | Modules | Description |
|----------|---------|-------------|
| 🔒 Cybersecurity | 14 | Exploit search, vulnerability scanning, threat modeling |
| 📊 Trading & Finance | 8 | Technical analysis, chart patterns, MQL coding |
| 💻 Code & Development | 6 | Code generation, optimization, refactoring |
| 🧠 Reasoning & Logic | 10 | Logical proofs, causal analysis, Bayesian inference |
| 📝 Language & NLP | 10 | Language detection, sentiment, dialogue |
| 🗣️ Kurdish Language | 4 | Sorani, Kurmanji, translation, morphology |
| 📚 Knowledge & Memory | 10 | Knowledge graphs, memory, fact verification |
| 📊 Analysis & Decision | 8 | SWOT, debate, economic analysis |
| 📋 Planning & Goals | 5 | Task planning, goal management, strategy |
| 🎨 Creative | 5 | Content generation, storytelling, brainstorming |
| 📖 AI & Learning | 7 | Adaptive learning, pattern recognition |
| 🪞 Meta-Intelligence | 7 | Self-reflection, confidence scoring |
| 🔗 Integration | 8 | LLM bridges, multi-agent collaboration |
| 🔍 Context & Understanding | 7 | Intent detection, explanation, summarization |
| 🔎 Search & Analysis | 3 | Advanced search, image analysis, PDF |
| ✅ Quality | 4 | Contract validation, tool reasoning |

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`)
- [Android Studio](https://developer.android.com/studio) (for local builds)
- JDK 17+

### Install Dependencies

```bash
cd ai-android-app
npm install
```

### Run in Development

```bash
# Start Expo development server
npm start

# Run on Android emulator/device
npm run android
```

### Build APK

#### Option 1: EAS Build (Recommended)

```bash
# Login to Expo (one-time)
npx eas-cli login

# Build APK
npm run build:apk

# Or build AAB (for Google Play)
npm run build:android
```

#### Option 2: Local Build

```bash
# Generate native Android project
npm run prebuild

# Build release APK locally
cd android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### Option 3: Expo Local Build

```bash
# Build APK locally with Expo
npx expo run:android --variant release
```

### Build Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run build:apk` | Build APK via EAS |
| `npm run build:android` | Build AAB via EAS (production) |
| `npm run build:preview` | Build preview APK |
| `npm run prebuild` | Generate native Android project |
| `npm test` | Run tests |
| `npm run typecheck` | TypeScript type checking |

## 📂 Project Structure

```
ai-android-app/
├── App.tsx                 # Main app entry with navigation
├── index.js                # React Native entry point
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── babel.config.js         # Babel configuration
├── jest.config.json        # Jest test configuration
├── jest.setup.ts           # Test setup with mocks
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ChatBubble.tsx      # Chat message bubble
│   │   ├── ChatInput.tsx       # Text input with send button
│   │   ├── SuggestionChips.tsx # Quick suggestion buttons
│   │   ├── ModuleCard.tsx      # AI module display card
│   │   └── TypingIndicator.tsx # Animated typing dots
│   ├── screens/            # App screens
│   │   ├── ChatScreen.tsx      # Main chat interface
│   │   ├── ModulesScreen.tsx   # Browse/manage AI modules
│   │   ├── SettingsScreen.tsx  # App settings
│   │   └── AboutScreen.tsx     # App information
│   ├── services/           # Core services
│   │   ├── AIEngine.ts         # AI processing engine (120 modules)
│   │   └── StorageService.ts   # Persistent storage
│   └── assets/             # Icons and images
├── android/                # Native Android project
│   ├── app/
│   │   ├── build.gradle        # App build config
│   │   ├── proguard-rules.pro  # ProGuard optimization
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/ai/assistant/
│   │       │   ├── MainActivity.kt
│   │       │   └── MainApplication.kt
│   │       └── res/
│   │           ├── values/
│   │           │   ├── strings.xml
│   │           │   └── styles.xml
│   │           └── xml/
│   │               └── network_security_config.xml
│   ├── build.gradle            # Root build config
│   ├── settings.gradle         # Project settings
│   └── gradle.properties       # Gradle properties
└── __tests__/              # Test files
    └── AIEngine.test.ts        # AI engine tests
```

## 🔧 Configuration

### Signing for Release

To create a release-signed APK:

```bash
# Generate a keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore ai-assistant.keystore \
  -alias ai-assistant \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Then update android/app/build.gradle with your keystore details
```

### Customization

- **App Name**: Edit `app.json` → `expo.name`
- **Package ID**: Edit `app.json` → `expo.android.package`
- **Version**: Edit `app.json` → `expo.version`
- **Theme Colors**: Edit `styles.xml` and component styles

## 🧪 Testing

```bash
# Run all tests
npm test

# The original AI project has 12,967 tests passing
# This APK project includes tests for the mobile-specific code
```

## 📊 Technical Specs

| Spec | Value |
|------|-------|
| Min Android | API 23 (Android 6.0) |
| Target Android | API 34 (Android 14) |
| Architecture | ARM, ARM64, x86, x86_64 |
| JS Engine | Hermes (optimized) |
| UI Framework | React Native 0.76 |
| Navigation | React Navigation 6 |
| Storage | AsyncStorage |
| Animations | Reanimated 3 |
| Bundle Size | ~15-25 MB (estimated) |

## 🔒 Security

- **No Internet Permission** — The app explicitly blocks internet access
- **No External APIs** — Zero network calls
- **Local Storage Only** — All data stays on device
- **ProGuard Enabled** — Code obfuscation in release builds
- **Network Security Config** — Restricts all network access

## 📝 Relationship to Main AI Project

This APK project is a mobile wrapper for the main AI project's intelligence modules:

- **Main Project**: 120+ TypeScript modules, 12,967 tests, CLI-based
- **APK Project**: Same AI knowledge, mobile UI, Android native packaging

The AI Engine in this project contains the complete module registry and routing logic from the main project, adapted for mobile use.

## 📄 License

Same license as the parent AI project.
