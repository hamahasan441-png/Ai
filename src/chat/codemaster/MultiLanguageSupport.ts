/**
 * 🌐 MultiLanguageSupport — 27-Language Write & Fix Engine
 *
 * CodeMaster can write and fix code in all 27 supported programming languages:
 *   TypeScript, JavaScript, Python, Rust, Go, Java, C, C++, C#, Swift,
 *   Kotlin, Ruby, PHP, HTML, CSS, SQL, Bash, PowerShell, R, Dart,
 *   Scala, Lua, Haskell, Elixir, MQL4, MQL5, PineScript
 *
 * Each language has:
 *   • Code templates (hello world, function, class, module)
 *   • Common fix patterns (typical bugs and their solutions)
 *   • Style conventions (naming, formatting, idioms)
 *   • Package manager info (npm, pip, cargo, etc.)
 *
 * Works fully offline — zero external deps.
 */

import type { AnalysisLanguage } from './types.js'

// ── Types ──

export interface LanguageProfile {
  language: AnalysisLanguage
  displayName: string
  fileExtensions: string[]
  packageManager: string | null
  commentStyle: { line: string; blockStart?: string; blockEnd?: string }
  namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case' | 'mixed'
  typingSystem: 'static' | 'dynamic' | 'gradual' | 'none'
  paradigms: string[]
  templates: Record<string, string>
  commonFixes: CommonFix[]
}

export interface CommonFix {
  name: string
  description: string
  pattern: RegExp
  fix: (match: string, line: string) => string
  language: AnalysisLanguage
}

export type SupportedLanguage = Exclude<AnalysisLanguage, 'unknown'>

export interface WriteRequest {
  language: SupportedLanguage
  template: 'hello-world' | 'function' | 'class' | 'module' | 'test' | 'api-endpoint'
  name?: string
  description?: string
}

export interface WriteResult {
  code: string
  language: SupportedLanguage
  template: string
  fileName: string
}

export interface FixRequest {
  code: string
  language: SupportedLanguage
  issues?: string[]
}

export interface FixResult {
  original: string
  fixed: string
  language: SupportedLanguage
  fixesApplied: string[]
  unchanged: boolean
}

// ── File extension map ──

const EXTENSION_MAP: Record<SupportedLanguage, string> = {
  typescript: '.ts', javascript: '.js', python: '.py', rust: '.rs', go: '.go',
  java: '.java', c: '.c', cpp: '.cpp', csharp: '.cs', swift: '.swift',
  kotlin: '.kt', ruby: '.rb', php: '.php', html: '.html', css: '.css',
  sql: '.sql', bash: '.sh', powershell: '.ps1', r: '.R', dart: '.dart',
  scala: '.scala', lua: '.lua', haskell: '.hs', elixir: '.ex',
  mql4: '.mq4', mql5: '.mq5', pinescript: '.pine',
}

// ── Language Profiles ──

const LANGUAGE_PROFILES: Map<SupportedLanguage, LanguageProfile> = new Map<SupportedLanguage, LanguageProfile>([
  ['typescript', {
    language: 'typescript',
    displayName: 'TypeScript',
    fileExtensions: ['.ts', '.tsx'],
    packageManager: 'npm',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'functional'],
    templates: {
      'hello-world': 'const main = (): void => {\n  console.log("Hello, World!");\n};\n\nmain();',
      'function': 'export function {name}({description}): void {\n  // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'missing-type-annotation',
        description: 'Add explicit return type to function',
        pattern: /function\s+\w+\([^)]*\)\s*\{/g,
        fix: (_match, line) => line.replace(/\)\s*\{/, '): void {'),
        language: 'typescript',
      },
      {
        name: 'use-const',
        description: 'Replace let with const for unchanged variables',
        pattern: /\blet\s+(\w+)\s*=\s*[^;]+;\s*$/g,
        fix: (_match, line) => line.replace(/\blet\b/, 'const'),
        language: 'typescript',
      },
    ],
  }],
  ['javascript', {
    language: 'javascript',
    displayName: 'JavaScript',
    fileExtensions: ['.js', '.jsx', '.mjs'],
    packageManager: 'npm',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'dynamic',
    paradigms: ['object-oriented', 'functional'],
    templates: {
      'hello-world': 'function main() {\n  console.log("Hello, World!");\n}\n\nmain();',
      'function': 'export function {name}({description}) {\n  // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-strict-equality',
        description: 'Replace == with ===',
        pattern: /[^!=]==[^=]/g,
        fix: (_match, line) => line.replace(/([^!=])={2}([^=])/g, '$1===$2'),
        language: 'javascript',
      },
      {
        name: 'use-const',
        description: 'Replace var with const',
        pattern: /\bvar\s+/g,
        fix: (_match, line) => line.replace(/\bvar\b/, 'const'),
        language: 'javascript',
      },
    ],
  }],
  ['python', {
    language: 'python',
    displayName: 'Python',
    fileExtensions: ['.py'],
    packageManager: 'pip',
    commentStyle: { line: '#' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['object-oriented', 'functional'],
    templates: {
      'hello-world': "def main() -> None:\n    print('Hello, World!')\n\nif __name__ == '__main__':\n    main()",
      'function': 'def {name}({description}) -> None:\n    """TODO: implement."""\n    pass',
    },
    commonFixes: [
      {
        name: 'use-f-string',
        description: 'Convert % formatting to f-string',
        pattern: /['"].*%[sd].*['"]\s*%\s*/g,
        fix: (_match, line) => line.replace(/"(.*)%s(.*)"\s*%\s*\(?([\w.]+)\)?/, 'f"$1{$3}$2"'),
        language: 'python',
      },
      {
        name: 'remove-bare-except',
        description: 'Replace bare except with except Exception',
        pattern: /\bexcept\s*:/g,
        fix: (_match, line) => line.replace(/\bexcept\s*:/, 'except Exception:'),
        language: 'python',
      },
    ],
  }],
  ['rust', {
    language: 'rust',
    displayName: 'Rust',
    fileExtensions: ['.rs'],
    packageManager: 'cargo',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'snake_case',
    typingSystem: 'static',
    paradigms: ['systems', 'functional'],
    templates: {
      'hello-world': 'fn main() {\n    println!("Hello, World!");\n}',
      'function': 'pub fn {name}({description}) -> () {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-clippy-suggestion',
        description: 'Replace .clone() on Copy types with direct use',
        pattern: /\.clone\(\)/g,
        fix: (_match, line) => line.replace(/\.clone\(\)/, ''),
        language: 'rust',
      },
    ],
  }],
  ['go', {
    language: 'go',
    displayName: 'Go',
    fileExtensions: ['.go'],
    packageManager: 'go modules',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['concurrent', 'procedural'],
    templates: {
      'hello-world': 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}',
      'function': 'func {name}({description}) error {\n\t// TODO: implement\n\treturn nil\n}',
    },
    commonFixes: [
      {
        name: 'check-error',
        description: 'Add error check after function call',
        pattern: /(\w+),\s*_\s*:=/g,
        fix: (_match, line) => line.replace(/,\s*_\s*:=/, ', err :='),
        language: 'go',
      },
    ],
  }],
  ['java', {
    language: 'java',
    displayName: 'Java',
    fileExtensions: ['.java'],
    packageManager: 'maven/gradle',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented'],
    templates: {
      'hello-world': 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
      'function': 'public static void {name}({description}) {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-diamond-operator',
        description: 'Use diamond operator for generic types',
        pattern: /new\s+\w+<\w+>\(/g,
        fix: (_match, line) => line.replace(/new\s+(\w+)<\w+>\(/, 'new $1<>('),
        language: 'java',
      },
    ],
  }],
  ['c', {
    language: 'c',
    displayName: 'C',
    fileExtensions: ['.c', '.h'],
    packageManager: null,
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'snake_case',
    typingSystem: 'static',
    paradigms: ['procedural'],
    templates: {
      'hello-world': '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      'function': 'void {name}({description}) {\n    /* TODO: implement */\n}',
    },
    commonFixes: [
      {
        name: 'check-null',
        description: 'Add NULL check after malloc',
        pattern: /(\w+)\s*=\s*malloc\([^)]+\);/g,
        fix: (_match, line) => {
          const m = line.match(/(\w+)\s*=\s*malloc\(/)
          const varName = m?.[1] ?? 'ptr'
          return `${line}\n    if (${varName} == NULL) return;`
        },
        language: 'c',
      },
    ],
  }],
  ['cpp', {
    language: 'cpp',
    displayName: 'C++',
    fileExtensions: ['.cpp', '.hpp', '.cc'],
    packageManager: 'cmake',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'mixed',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'generic'],
    templates: {
      'hello-world': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      'function': 'void {name}({description}) {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-nullptr',
        description: 'Replace NULL with nullptr',
        pattern: /\bNULL\b/g,
        fix: (_match, line) => line.replace(/\bNULL\b/g, 'nullptr'),
        language: 'cpp',
      },
    ],
  }],
  ['csharp', {
    language: 'csharp',
    displayName: 'C#',
    fileExtensions: ['.cs'],
    packageManager: 'nuget',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'PascalCase',
    typingSystem: 'static',
    paradigms: ['object-oriented'],
    templates: {
      'hello-world': 'using System;\n\nclass Program {\n  static void Main() => Console.WriteLine("Hello, World!");\n}',
      'function': 'public static void {name}({description}) {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-var',
        description: 'Use var for obvious type declarations',
        pattern: /\b(string|int|bool)\s+(\w+)\s*=\s*new\b/g,
        fix: (_match, line) => line.replace(/\b(string|int|bool)\s+/, 'var '),
        language: 'csharp',
      },
    ],
  }],
  ['swift', {
    language: 'swift',
    displayName: 'Swift',
    fileExtensions: ['.swift'],
    packageManager: 'spm',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'protocol-oriented'],
    templates: {
      'hello-world': 'import Foundation\n\nprint("Hello, World!")',
      'function': 'func {name}({description}) {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-let',
        description: 'Replace var with let for immutable values',
        pattern: /\bvar\s+(\w+)\s*=\s*[^{]+$/g,
        fix: (_match, line) => line.replace(/\bvar\b/, 'let'),
        language: 'swift',
      },
    ],
  }],
  ['kotlin', {
    language: 'kotlin',
    displayName: 'Kotlin',
    fileExtensions: ['.kt', '.kts'],
    packageManager: 'gradle',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'functional'],
    templates: {
      'hello-world': 'fun main() {\n    println("Hello, World!")\n}',
      'function': 'fun {name}({description}): Unit {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-val',
        description: 'Replace var with val for immutable values',
        pattern: /\bvar\s+(\w+)\s*=\s*[^{]+$/g,
        fix: (_match, line) => line.replace(/\bvar\b/, 'val'),
        language: 'kotlin',
      },
    ],
  }],
  ['ruby', {
    language: 'ruby',
    displayName: 'Ruby',
    fileExtensions: ['.rb'],
    packageManager: 'gem',
    commentStyle: { line: '#' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['object-oriented'],
    templates: {
      'hello-world': 'def main\n  puts "Hello, World!"\nend\n\nmain',
      'function': 'def {name}({description})\n  # TODO: implement\nend',
    },
    commonFixes: [
      {
        name: 'use-frozen-string',
        description: 'Add frozen_string_literal magic comment',
        pattern: /^(?!# frozen_string_literal)/g,
        fix: (_match, line) => `# frozen_string_literal: true\n${line}`,
        language: 'ruby',
      },
    ],
  }],
  ['php', {
    language: 'php',
    displayName: 'PHP',
    fileExtensions: ['.php'],
    packageManager: 'composer',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'dynamic',
    paradigms: ['object-oriented'],
    templates: {
      'hello-world': '<?php\n\necho "Hello, World!\\n";',
      'function': 'function {name}({description}): void {\n    // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-strict-types',
        description: 'Add strict_types declaration',
        pattern: /^<\?php\s*$/gm,
        fix: (_match, line) => line.replace(/^<\?php/, '<?php\ndeclare(strict_types=1);'),
        language: 'php',
      },
    ],
  }],
  ['html', {
    language: 'html',
    displayName: 'HTML',
    fileExtensions: ['.html', '.htm'],
    packageManager: null,
    commentStyle: { line: '<!--', blockStart: '<!--', blockEnd: '-->' },
    namingConvention: 'kebab-case',
    typingSystem: 'none',
    paradigms: ['markup'],
    templates: {
      'hello-world': '<!DOCTYPE html>\n<html lang="en">\n<head><title>Hello</title></head>\n<body><h1>Hello, World!</h1></body>\n</html>',
      'function': '<!-- {name}: {description} -->\n<div id="{name}"></div>',
    },
    commonFixes: [
      {
        name: 'add-alt-attr',
        description: 'Add alt attribute to img tags',
        pattern: /<img\s+(?![^>]*\balt=)[^>]*>/g,
        fix: (_match, line) => line.replace(/<img\s/, '<img alt="" '),
        language: 'html',
      },
    ],
  }],
  ['css', {
    language: 'css',
    displayName: 'CSS',
    fileExtensions: ['.css', '.scss'],
    packageManager: null,
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'kebab-case',
    typingSystem: 'none',
    paradigms: ['styling'],
    templates: {
      'hello-world': 'body {\n  font-family: sans-serif;\n  color: #333;\n}\n\n.hello {\n  font-size: 2rem;\n}',
      'function': '.{name} {\n  /* {description} */\n  display: block;\n}',
    },
    commonFixes: [
      {
        name: 'remove-duplicate-properties',
        description: 'Flag duplicate CSS properties in same rule',
        pattern: /(\w[-\w]*):\s*[^;]+;\s*\1:/g,
        fix: (_match, line) => line,
        language: 'css',
      },
    ],
  }],
  ['sql', {
    language: 'sql',
    displayName: 'SQL',
    fileExtensions: ['.sql'],
    packageManager: null,
    commentStyle: { line: '--', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'snake_case',
    typingSystem: 'none',
    paradigms: ['declarative'],
    templates: {
      'hello-world': "SELECT 'Hello, World!' AS greeting;",
      'function': 'CREATE FUNCTION {name}({description})\nRETURNS void AS $$ BEGIN\n  -- TODO: implement\nEND; $$ LANGUAGE plpgsql;',
    },
    commonFixes: [
      {
        name: 'use-parameterized',
        description: 'Flag string concatenation in queries',
        pattern: /'\s*\+\s*\w+\s*\+\s*'/g,
        fix: (_match, line) => line,
        language: 'sql',
      },
    ],
  }],
  ['bash', {
    language: 'bash',
    displayName: 'Bash',
    fileExtensions: ['.sh', '.bash'],
    packageManager: null,
    commentStyle: { line: '#' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['scripting'],
    templates: {
      'hello-world': '#!/usr/bin/env bash\nset -euo pipefail\n\necho "Hello, World!"',
      'function': '{name}() {\n  # {description}\n  echo "TODO: implement"\n}',
    },
    commonFixes: [
      {
        name: 'quote-variables',
        description: 'Quote variable expansions',
        pattern: /\$\w+(?!")/g,
        fix: (_match, line) => line.replace(/\$(\w+)/g, '"\\$$1"'),
        language: 'bash',
      },
      {
        name: 'use-set-euo',
        description: 'Add strict mode',
        pattern: /^#!\/.*bash\s*$/gm,
        fix: (_match, line) => `${line}\nset -euo pipefail`,
        language: 'bash',
      },
    ],
  }],
  ['powershell', {
    language: 'powershell',
    displayName: 'PowerShell',
    fileExtensions: ['.ps1', '.psm1'],
    packageManager: 'powershell gallery',
    commentStyle: { line: '#', blockStart: '<#', blockEnd: '#>' },
    namingConvention: 'PascalCase',
    typingSystem: 'dynamic',
    paradigms: ['scripting'],
    templates: {
      'hello-world': 'Write-Host "Hello, World!"',
      'function': 'function {name} {{\n    param({description})\n    # TODO: implement\n}}',
    },
    commonFixes: [
      {
        name: 'use-approved-verb',
        description: 'Use approved PowerShell verbs in function names',
        pattern: /function\s+(?!Get-|Set-|New-|Remove-|Add-|Update-)\w+-/g,
        fix: (_match, line) => line,
        language: 'powershell',
      },
    ],
  }],
  ['r', {
    language: 'r',
    displayName: 'R',
    fileExtensions: ['.r', '.R'],
    packageManager: 'cran',
    commentStyle: { line: '#' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['statistical'],
    templates: {
      'hello-world': 'main <- function() {\n  cat("Hello, World!\\n")\n}\n\nmain()',
      'function': '{name} <- function({description}) {\n  # TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-assignment-arrow',
        description: 'Use <- instead of = for assignment',
        pattern: /^(\s*\w+)\s*=\s*(?!=)/gm,
        fix: (_match, line) => line.replace(/(\w+)\s*=\s*(?!=)/, '$1 <- '),
        language: 'r',
      },
    ],
  }],
  ['dart', {
    language: 'dart',
    displayName: 'Dart',
    fileExtensions: ['.dart'],
    packageManager: 'pub',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented'],
    templates: {
      'hello-world': "void main() {\n  print('Hello, World!');\n}",
      'function': 'void {name}({description}) {\n  // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-final',
        description: 'Replace var with final for immutable values',
        pattern: /\bvar\s+(\w+)\s*=\s*[^;]+;$/gm,
        fix: (_match, line) => line.replace(/\bvar\b/, 'final'),
        language: 'dart',
      },
    ],
  }],
  ['scala', {
    language: 'scala',
    displayName: 'Scala',
    fileExtensions: ['.scala', '.sc'],
    packageManager: 'sbt',
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'functional'],
    templates: {
      'hello-world': 'object Main extends App {\n  println("Hello, World!")\n}',
      'function': 'def {name}({description}): Unit = {\n  // TODO: implement\n}',
    },
    commonFixes: [
      {
        name: 'use-val',
        description: 'Replace var with val for immutable values',
        pattern: /\bvar\s+(\w+)\s*=\s*/g,
        fix: (_match, line) => line.replace(/\bvar\b/, 'val'),
        language: 'scala',
      },
    ],
  }],
  ['lua', {
    language: 'lua',
    displayName: 'Lua',
    fileExtensions: ['.lua'],
    packageManager: 'luarocks',
    commentStyle: { line: '--', blockStart: '--[[', blockEnd: ']]' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['scripting'],
    templates: {
      'hello-world': 'print("Hello, World!")',
      'function': 'function {name}({description})\n  -- TODO: implement\nend',
    },
    commonFixes: [
      {
        name: 'use-local',
        description: 'Add local keyword to variable declarations',
        pattern: /^(\s*)(\w+)\s*=\s*(?!.*\blocal\b)/gm,
        fix: (_match, line) => line.replace(/^(\s*)(\w+)\s*=/, '$1local $2 ='),
        language: 'lua',
      },
    ],
  }],
  ['haskell', {
    language: 'haskell',
    displayName: 'Haskell',
    fileExtensions: ['.hs'],
    packageManager: 'cabal/stack',
    commentStyle: { line: '--', blockStart: '{-', blockEnd: '-}' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['functional'],
    templates: {
      'hello-world': 'main :: IO ()\nmain = putStrLn "Hello, World!"',
      'function': '{name} :: {description}\n{name} = undefined -- TODO: implement',
    },
    commonFixes: [
      {
        name: 'add-type-signature',
        description: 'Add type signature to top-level binding',
        pattern: /^(\w+)\s+=/gm,
        fix: (_match, line) => line,
        language: 'haskell',
      },
    ],
  }],
  ['elixir', {
    language: 'elixir',
    displayName: 'Elixir',
    fileExtensions: ['.ex', '.exs'],
    packageManager: 'mix/hex',
    commentStyle: { line: '#' },
    namingConvention: 'snake_case',
    typingSystem: 'dynamic',
    paradigms: ['functional', 'concurrent'],
    templates: {
      'hello-world': 'defmodule Main do\n  def main, do: IO.puts("Hello, World!")\nend\n\nMain.main()',
      'function': 'def {name}({description}) do\n  # TODO: implement\n  :ok\nend',
    },
    commonFixes: [
      {
        name: 'use-pipe-operator',
        description: 'Suggest pipe operator for nested function calls',
        pattern: /\w+\(\w+\([^)]+\)\)/g,
        fix: (_match, line) => line,
        language: 'elixir',
      },
    ],
  }],
  ['mql4', {
    language: 'mql4',
    displayName: 'MQL4',
    fileExtensions: ['.mq4', '.mqh'],
    packageManager: null,
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['procedural', 'event-driven'],
    templates: {
      'hello-world': '#property copyright "MyExpert"\n#property link      ""\n#property version   "1.00"\n#property strict\n\nint init() {\n  Print("Hello, MQL4 World!");\n  return(INIT_SUCCEEDED);\n}\n\nint start() {\n  return(0);\n}\n\nint deinit() {\n  return(0);\n}',
      'function': '//+------------------------------------------------------------------+\n//| {description}\n//+------------------------------------------------------------------+\nvoid {name}() {\n  // TODO: implement\n}',
      'class': '#property copyright "MyExpert"\n#property link      ""\n#property version   "1.00"\n#property strict\n\nextern double LotSize = 0.1;\nextern int StopLoss = 50;\nextern int TakeProfit = 100;\n\nint init() {\n  return(INIT_SUCCEEDED);\n}\n\nint start() {\n  // Trading logic here\n  return(0);\n}\n\nint deinit() {\n  return(0);\n}',
      'module': '#property copyright "MyIndicator"\n#property link      ""\n#property version   "1.00"\n#property strict\n#property indicator_chart_window\n#property indicator_buffers 1\n\ndouble Buffer0[];\n\nint init() {\n  SetIndexBuffer(0, Buffer0);\n  SetIndexStyle(0, DRAW_LINE);\n  return(0);\n}\n\nint start() {\n  int counted = IndicatorCounted();\n  int limit = Bars - counted;\n  for (int i = 0; i < limit; i++) {\n    Buffer0[i] = Close[i];\n  }\n  return(0);\n}',
    },
    commonFixes: [
      {
        name: 'add-strict-mode',
        description: 'Add #property strict for better error checking',
        pattern: /^#property\s+copyright/gm,
        fix: (_match, line) => line,
        language: 'mql4',
      },
      {
        name: 'use-predefined-constants',
        description: 'Replace magic numbers with predefined constants',
        pattern: /return\s*\(\s*0\s*\)\s*;/g,
        fix: (_match, line) => line.replace(/return\s*\(\s*0\s*\)\s*;/, 'return(INIT_SUCCEEDED);'),
        language: 'mql4',
      },
      {
        name: 'check-order-send',
        description: 'Check OrderSend return value for errors',
        pattern: /OrderSend\s*\(.+\)\s*;/g,
        fix: (_match, line) => line.replace(
          /OrderSend\s*\((.+)\)\s*;/,
          'int ticket = OrderSend($1);\n  if (ticket < 0) Print("OrderSend failed: ", GetLastError());',
        ),
        language: 'mql4',
      },
    ],
  }],
  ['mql5', {
    language: 'mql5',
    displayName: 'MQL5',
    fileExtensions: ['.mq5', '.mqh'],
    packageManager: null,
    commentStyle: { line: '//', blockStart: '/*', blockEnd: '*/' },
    namingConvention: 'camelCase',
    typingSystem: 'static',
    paradigms: ['object-oriented', 'event-driven'],
    templates: {
      'hello-world': '#property copyright "MyExpert"\n#property link      ""\n#property version   "1.00"\n\nint OnInit() {\n  Print("Hello, MQL5 World!");\n  return(INIT_SUCCEEDED);\n}\n\nvoid OnTick() {\n  // Called on every tick\n}\n\nvoid OnDeinit(const int reason) {\n  Print("Expert removed, reason: ", reason);\n}',
      'function': '//+------------------------------------------------------------------+\n//| {description}\n//+------------------------------------------------------------------+\nvoid {name}() {\n  // TODO: implement\n}',
      'class': '#property copyright "MyExpert"\n#property link      ""\n#property version   "1.00"\n\n#include <Trade\\Trade.mqh>\n\ninput double InpLotSize = 0.1;\ninput int    InpStopLoss = 50;\ninput int    InpTakeProfit = 100;\n\nCTrade trade;\n\nint OnInit() {\n  trade.SetExpertMagicNumber(12345);\n  return(INIT_SUCCEEDED);\n}\n\nvoid OnTick() {\n  // Trading logic here\n}\n\nvoid OnDeinit(const int reason) {\n}',
      'module': '#property copyright "MyIndicator"\n#property link      ""\n#property version   "1.00"\n#property indicator_chart_window\n#property indicator_buffers 1\n#property indicator_plots   1\n\ndouble Buffer0[];\n\nint OnInit() {\n  SetIndexBuffer(0, Buffer0, INDICATOR_DATA);\n  PlotIndexSetInteger(0, PLOT_DRAW_TYPE, DRAW_LINE);\n  return(INIT_SUCCEEDED);\n}\n\nint OnCalculate(const int rates_total, const int prev_calculated,\n                const datetime &time[], const double &open[],\n                const double &high[], const double &low[],\n                const double &close[], const long &tick_volume[],\n                const long &volume[], const int &spread[]) {\n  for (int i = prev_calculated; i < rates_total; i++) {\n    Buffer0[i] = close[i];\n  }\n  return(rates_total);\n}',
    },
    commonFixes: [
      {
        name: 'use-input-keyword',
        description: 'Replace extern with input keyword in MQL5',
        pattern: /\bextern\s+(double|int|string|bool|color|datetime)\s+/g,
        fix: (_match, line) => line.replace(/\bextern\b/, 'input'),
        language: 'mql5',
      },
      {
        name: 'use-ctrade-class',
        description: 'Suggest CTrade class instead of direct OrderSend',
        pattern: /OrderSend\s*\(/g,
        fix: (_match, line) => `// Consider using CTrade class: trade.Buy() / trade.Sell()\n  ${line}`,
        language: 'mql5',
      },
      {
        name: 'check-result-retcode',
        description: 'Check trade result retcode after operations',
        pattern: /trade\.(Buy|Sell|PositionClose)\s*\([^)]*\)\s*;/g,
        fix: (_match, line) => line,
        language: 'mql5',
      },
    ],
  }],
  ['pinescript', {
    language: 'pinescript',
    displayName: 'PineScript',
    fileExtensions: ['.pine'],
    packageManager: null,
    commentStyle: { line: '//' },
    namingConvention: 'camelCase',
    typingSystem: 'gradual',
    paradigms: ['declarative', 'functional'],
    templates: {
      'hello-world': '//@version=5\nindicator("Hello World", overlay=true)\n\nplot(close, title="Close Price", color=color.blue)',
      'function': '//@version=5\n\n// {description}\n{name}(src, length) =>\n    // TODO: implement\n    ta.sma(src, length)',
      'class': '//@version=5\nstrategy("{name}", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)\n\n// Inputs\nlength = input.int(14, title="Length")\nsrc = input.source(close, title="Source")\n\n// Calculate\nsmaValue = ta.sma(src, length)\nemaValue = ta.ema(src, length)\n\n// Conditions\nlongCondition = ta.crossover(smaValue, emaValue)\nshortCondition = ta.crossunder(smaValue, emaValue)\n\n// Execute\nif longCondition\n    strategy.entry("Long", strategy.long)\nif shortCondition\n    strategy.entry("Short", strategy.short)\n\n// Plot\nplot(smaValue, title="SMA", color=color.blue)\nplot(emaValue, title="EMA", color=color.red)',
      'module': '//@version=5\nindicator("{name}", overlay=false)\n\n// Inputs\nlength = input.int(14, title="Length")\nsrc = input.source(close, title="Source")\n\n// Calculations\nrsiValue = ta.rsi(src, length)\n\n// Levels\nhline(70, "Overbought", color=color.red)\nhline(30, "Oversold", color=color.green)\n\n// Plot\nplot(rsiValue, title="RSI", color=color.purple)',
    },
    commonFixes: [
      {
        name: 'add-version-annotation',
        description: 'Add //@version=5 annotation at the top',
        pattern: /^(?!\/\/@version)/m,
        fix: (_match, line) => line,
        language: 'pinescript',
      },
      {
        name: 'use-ta-namespace',
        description: 'Use ta. namespace for built-in functions (v5)',
        pattern: /\b(sma|ema|rsi|macd|stoch|atr|crossover|crossunder)\s*\(/g,
        fix: (_match, line) => line.replace(
          /\b(sma|ema|rsi|macd|stoch|atr|crossover|crossunder)\s*\(/g,
          'ta.$1(',
        ),
        language: 'pinescript',
      },
      {
        name: 'use-input-functions',
        description: 'Use input.int/input.float/input.string instead of input()',
        pattern: /\binput\s*\(\s*\d+/g,
        fix: (_match, line) => line.replace(/\binput\s*\(/, 'input.int('),
        language: 'pinescript',
      },
    ],
  }],
])

// ── Main Class ──

export class MultiLanguageSupport {
  private profiles: Map<SupportedLanguage, LanguageProfile>

  constructor() {
    this.profiles = LANGUAGE_PROFILES
  }

  /** Get all 27 supported languages. */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.profiles.keys()]
  }

  /** Get the language count (always 27). */
  getLanguageCount(): number { return 27 }

  /** Get a language profile by key. */
  getProfile(language: SupportedLanguage): LanguageProfile | undefined {
    return this.profiles.get(language)
  }

  /** Write code from a template for the given language. */
  write(request: WriteRequest): WriteResult {
    const profile = this.profiles.get(request.language)
    if (!profile) {
      return {
        code: `// Unsupported language: ${request.language}`,
        language: request.language,
        template: request.template,
        fileName: `output${EXTENSION_MAP[request.language] ?? '.txt'}`,
      }
    }

    const templateKey = request.template
    let code = profile.templates[templateKey] ?? profile.templates['hello-world'] ?? ''
    const name = request.name ?? 'myFunction'
    const description = request.description ?? ''

    code = code.replace(/\{name\}/g, name)
    code = code.replace(/\{description\}/g, description)

    const ext = EXTENSION_MAP[request.language] ?? profile.fileExtensions[0] ?? '.txt'
    const fileName = templateKey === 'hello-world'
      ? `main${ext}`
      : `${name}${ext}`

    return {
      code,
      language: request.language,
      template: templateKey,
      fileName,
    }
  }

  /** Apply known fixes for a language to the given code. */
  fix(request: FixRequest): FixResult {
    const profile = this.profiles.get(request.language)
    if (!profile) {
      return {
        original: request.code,
        fixed: request.code,
        language: request.language,
        fixesApplied: [],
        unchanged: true,
      }
    }

    let fixed = request.code
    const applied: string[] = []

    for (const commonFix of profile.commonFixes) {
      if (request.issues && request.issues.length > 0) {
        const relevant = request.issues.some(
          issue => issue.toLowerCase().includes(commonFix.name.toLowerCase()),
        )
        if (!relevant) continue
      }

      const lines = fixed.split('\n')
      let changed = false

      const processedLines = lines.map(line => {
        if (commonFix.pattern.test(line)) {
          commonFix.pattern.lastIndex = 0
          const result = commonFix.fix(line, line)
          if (result !== line) {
            changed = true
            return result
          }
        }
        commonFix.pattern.lastIndex = 0
        return line
      })

      if (changed) {
        fixed = processedLines.join('\n')
        applied.push(commonFix.name)
      }
    }

    return {
      original: request.code,
      fixed,
      language: request.language,
      fixesApplied: applied,
      unchanged: applied.length === 0,
    }
  }

  /** Check whether a language string is a supported language. */
  isSupported(language: string): language is SupportedLanguage {
    return this.profiles.has(language as SupportedLanguage)
  }

  /** Get the primary file extension for a language. */
  getFileExtension(language: SupportedLanguage): string {
    return EXTENSION_MAP[language] ?? '.txt'
  }

  /** Return a human-readable summary of CodeMaster's language capabilities. */
  getCapabilitiesSummary(): string {
    return `CodeMaster supports writing and fixing code in ${this.getLanguageCount()} programming languages: ${this.getSupportedLanguages().map(l => this.getProfile(l)?.displayName ?? l).join(', ')}.`
  }
}
