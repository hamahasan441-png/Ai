/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Analogical Reasoner — Reason by Analogy Using Semantic Relationships        ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Structure Mapping — Find structural parallels between domains           ║
 * ║    ✦ Cross-Domain Analogies — "React hooks are like Python decorators"       ║
 * ║    ✦ Code Generation by Analogy — Translate patterns across languages        ║
 * ║    ✦ Transfer Learning — Apply solutions from one domain to another          ║
 * ║    ✦ Pattern Learning — Remember and reuse discovered analogies              ║
 * ║    ✦ Explanation Generation — Explain concepts via best-fit analogies        ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface StructureElement {
  name: string;
  domain: string;
  properties: string[];
  relations: string[];
}

export interface StructureMapping {
  sourceProperty: string;
  targetProperty: string;
  mappingType: 'identical' | 'analogous' | 'partial' | 'inverse';
  confidence: number;
}

export interface AnalogyResult {
  source: StructureElement;
  target: StructureElement;
  mappings: StructureMapping[];
  similarity: number;
  explanation: string;
  confidence: number;
}

export interface AnalogyPattern {
  id: string;
  sourcePattern: string;
  targetPattern: string;
  domain: string;
  abstraction: string;
  examples: string[];
  useCount: number;
  createdAt: number;
}

export interface TransferResult {
  sourceDomain: string;
  targetDomain: string;
  originalSolution: string;
  transferredSolution: string;
  adaptations: string[];
  confidence: number;
}

export interface AnalogicalReasonerConfig {
  minSimilarity: number;
  maxAnalogies: number;
  structureWeight: number;
  enablePatternLearning: boolean;
  maxPatterns: number;
}

export interface AnalogicalReasonerStats {
  totalAnalogies: number;
  totalTransfers: number;
  patternsLearned: number;
  avgConfidence: number;
  domainsCovered: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: AnalogicalReasonerConfig = {
  minSimilarity: 0.3,
  maxAnalogies: 5,
  structureWeight: 0.6,
  enablePatternLearning: true,
  maxPatterns: 200,
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'that',
  'this', 'it', 'its', 'and', 'or', 'not', 'but', 'if', 'then',
  'so', 'up', 'out', 'no', 'just', 'also', 'very', 'what', 'how',
  'like', 'such', 'when', 'which', 'there', 'their', 'than',
]);

// ── Pre-Built Structural Knowledge ──────────────────────────────────────────

/** Structural properties for common programming concepts. */
const CONCEPT_PROPERTIES: Record<string, string[]> = {
  function: ['input', 'output', 'name', 'body', 'side-effects', 'scope', 'return-value'],
  class: ['name', 'fields', 'methods', 'constructor', 'inheritance', 'encapsulation'],
  loop: ['condition', 'body', 'iteration', 'termination', 'counter'],
  conditional: ['condition', 'true-branch', 'false-branch', 'evaluation'],
  variable: ['name', 'type', 'value', 'scope', 'mutability'],
  array: ['elements', 'index', 'length', 'order', 'iteration'],
  object: ['keys', 'values', 'nesting', 'reference', 'prototype'],
  promise: ['pending', 'resolved', 'rejected', 'chaining', 'async'],
  interface: ['contract', 'methods', 'properties', 'implementation'],
  module: ['exports', 'imports', 'encapsulation', 'namespace', 'scope'],
  event: ['emitter', 'listener', 'payload', 'propagation', 'async'],
  error: ['type', 'message', 'stack', 'handling', 'propagation'],
  iterator: ['current', 'next', 'done', 'sequence', 'lazy'],
  generic: ['type-parameter', 'constraint', 'instantiation', 'reuse'],
  decorator: ['target', 'wrapper', 'composition', 'metadata', 'higher-order'],
  closure: ['environment', 'captured-variables', 'function', 'scope', 'lifetime'],
  callback: ['function-reference', 'invocation', 'context', 'async', 'error-first'],
  stream: ['source', 'sink', 'transform', 'backpressure', 'lazy', 'pipeline'],
  middleware: ['request', 'response', 'next', 'chain', 'transform'],
  component: ['props', 'state', 'render', 'lifecycle', 'children'],
};

/** How concepts are expressed in specific languages. */
const LANGUAGE_CONSTRUCTS: Record<string, Record<string, string>> = {
  javascript: {
    function: 'function / arrow (=>)', class: 'class with constructor', loop: 'for, for...of, while',
    variable: 'const, let', array: '[] literal, map/filter/reduce', promise: 'Promise, async/await',
    module: 'import/export, require', iterator: 'generators (function*)', closure: 'lexical scoping',
    callback: 'error-first convention', middleware: 'Express (req, res, next)', component: 'React hooks / class',
  },
  typescript: {
    function: 'typed arrow function', class: 'class with access modifiers', loop: 'for...of + type narrowing',
    variable: 'const/let with annotations', array: 'Array<T>, tuple types', promise: 'Promise<T>, async/await',
    module: 'import type', interface: 'interface, declaration merging', generic: '<T> with extends constraint',
    iterator: 'Iterable<T>, Generator<T>', decorator: '@decorator (experimental)', component: 'React.FC<Props>',
  },
  python: {
    function: 'def, lambda', class: 'class with __init__', loop: 'for...in, comprehension',
    variable: 'dynamic + type hints', array: 'list [], tuple ()', promise: 'asyncio, async def/await',
    module: 'import, from...import', iterator: 'yield, __iter__/__next__', decorator: '@decorator syntax',
    closure: 'nested function capture', middleware: 'Django/ASGI middleware', callback: 'callable argument',
  },
  rust: {
    function: 'fn with explicit types', class: 'struct + impl + traits', loop: 'loop, for...in, iterators',
    variable: 'let / let mut', array: 'Vec<T>, [T; N], slices', promise: 'Future, async/await, tokio',
    module: 'mod, use, crate', interface: 'trait definitions', generic: '<T: Trait>, where clauses',
    iterator: '.iter(), .into_iter()', error: 'Result<T,E>, Option<T>, ?', closure: '|args| Fn/FnMut/FnOnce',
  },
  go: {
    function: 'func, multiple returns', class: 'struct + receiver methods', loop: 'for, range',
    variable: ':= / var', array: 'slices, append()', promise: 'goroutine + chan T',
    module: 'package, go.mod', interface: 'implicit interface', generic: '[T any] (Go 1.18+)',
    error: 'error return (val, err)', closure: 'anonymous func', middleware: 'http.Handler wrapper',
  },
  java: {
    function: 'method / static method', class: 'class extends/implements', loop: 'for-each, streams',
    variable: 'final, typed decl', array: 'List<T>, T[]', promise: 'CompletableFuture<T>',
    module: 'package, import', interface: 'interface, default methods', generic: '<T>, wildcards',
    iterator: 'Iterator<T>, Stream<T>', decorator: '@Annotation', closure: '(args) -> expr',
  },
};

// ── Pre-Built Analogy Knowledge Base ────────────────────────────────────────

interface AnalogyEntry {
  source: string;
  sourceDomain: string;
  target: string;
  targetDomain: string;
  sourceProperties: string[];
  targetProperties: string[];
  explanation: string;
}

function buildAnalogyKnowledgeBase(): AnalogyEntry[] {
  const entries: AnalogyEntry[] = [];

  const add = (
    source: string, sourceDomain: string,
    target: string, targetDomain: string,
    sourceProperties: string[], targetProperties: string[],
    explanation: string,
  ) => {
    entries.push({ source, sourceDomain, target, targetDomain, sourceProperties, targetProperties, explanation });
  };

  // ── Programming ↔ Real World ──
  add('function', 'programming', 'recipe', 'cooking',
    ['input', 'output', 'steps', 'name', 'reusable'],
    ['ingredients', 'dish', 'instructions', 'title', 'reusable'],
    'A function is like a recipe: takes inputs (ingredients), follows steps, and produces output (a dish).');
  add('variable', 'programming', 'labeled box', 'storage',
    ['name', 'value', 'type', 'scope'],
    ['label', 'contents', 'size', 'location'],
    'A variable is like a labeled box: has a name (label) and holds a value (contents).');
  add('loop', 'programming', 'treadmill', 'exercise',
    ['condition', 'body', 'repetition', 'termination'],
    ['speed-setting', 'running', 'continuous', 'stop-button'],
    'A loop is like a treadmill: keeps repeating the same action until a stop condition is met.');
  add('recursion', 'programming', 'Russian dolls', 'toys',
    ['self-reference', 'base-case', 'stack', 'depth'],
    ['nesting', 'smallest-doll', 'layers', 'size-decrease'],
    'Recursion is like Russian dolls: each contains a smaller version until you reach the smallest (base case).');
  add('API', 'programming', 'waiter in a restaurant', 'restaurant',
    ['request', 'response', 'interface', 'endpoints'],
    ['order', 'food', 'menu', 'tables'],
    'An API is like a waiter: you make a request (order) through a defined interface (menu) and get a response (food).');
  add('class', 'programming', 'blueprint', 'architecture',
    ['fields', 'methods', 'constructor', 'instances'],
    ['dimensions', 'features', 'foundation', 'buildings'],
    'A class is like a blueprint: defines structure and you create instances (buildings) from it.');
  add('inheritance', 'programming', 'family tree', 'genealogy',
    ['parent', 'child', 'override', 'shared-traits'],
    ['ancestor', 'descendant', 'unique-traits', 'inherited-traits'],
    'Inheritance is like a family tree: children inherit traits from parents but can have unique ones too.');
  add('array', 'programming', 'filing cabinet', 'office',
    ['index', 'elements', 'order', 'length'],
    ['drawer-number', 'files', 'order', 'capacity'],
    'An array is like a filing cabinet: items stored in numbered slots, accessed by position.');
  add('stack', 'programming', 'stack of plates', 'kitchen',
    ['push', 'pop', 'LIFO', 'top'],
    ['add-plate', 'remove-plate', 'last-on-first-off', 'top-plate'],
    'A stack is like a stack of plates: you add/remove only from the top (LIFO).');
  add('queue', 'programming', 'line at a store', 'retail',
    ['enqueue', 'dequeue', 'FIFO', 'front'],
    ['join-line', 'served', 'first-come-first-served', 'front'],
    'A queue is like a line at a store: first in line is served first (FIFO).');
  add('hash map', 'programming', 'dictionary', 'reference',
    ['key', 'value', 'lookup', 'hash-function'],
    ['word', 'definition', 'search', 'alphabetical-order'],
    'A hash map is like a dictionary: look up a key (word) to find its value (definition) quickly.');
  add('compiler', 'programming', 'translator', 'language',
    ['source-code', 'machine-code', 'parsing', 'errors'],
    ['source-language', 'target-language', 'understanding', 'mistakes'],
    'A compiler is like a translator: converts source code into machine code (another language).');
  add('debugger', 'programming', 'detective', 'investigation',
    ['breakpoints', 'step-through', 'inspect', 'trace'],
    ['clues', 'follow-leads', 'examine-evidence', 'reconstruct'],
    'A debugger is like a detective: pause, inspect clues, and trace steps leading to a problem.');

  // ── Framework ↔ Framework ──
  add('React hooks', 'react', 'Vue composition API', 'vue',
    ['useState', 'useEffect', 'custom-hooks', 'functional'],
    ['ref', 'watch', 'composables', 'setup-function'],
    'React hooks and Vue composition API both provide reactive state and lifecycle in functional components.');
  add('Express middleware', 'express', 'Django middleware', 'django',
    ['req-res-next', 'chain', 'order-matters'],
    ['process_request', 'chain', 'order-matters'],
    'Express and Django middleware both intercept requests/responses in an ordered chain.');
  add('Redux', 'react', 'Vuex', 'vue',
    ['store', 'actions', 'reducers', 'dispatch'],
    ['store', 'actions', 'mutations', 'commit'],
    'Redux and Vuex are centralized state stores with actions triggering state changes.');
  add('React JSX', 'react', 'Vue SFC template', 'vue',
    ['component', 'props', 'render', 'virtual-dom'],
    ['component', 'props', 'template', 'virtual-dom'],
    'JSX and Vue templates both describe component UI declaratively via virtual DOM.');
  add('Next.js', 'react', 'Nuxt.js', 'vue',
    ['SSR', 'file-routing', 'API-routes'],
    ['SSR', 'file-routing', 'server-routes'],
    'Next.js and Nuxt.js are SSR meta-frameworks with file-based routing for their ecosystems.');
  add('React context', 'react', 'Vue provide/inject', 'vue',
    ['createContext', 'Provider', 'useContext'],
    ['provide', 'inject', 'reactive'],
    'React context and Vue provide/inject both pass data down the tree without prop drilling.');

  // ── Concept ↔ Concept ──
  add('Promise', 'programming', 'delivery order', 'commerce',
    ['pending', 'resolved', 'rejected', 'then'],
    ['placed', 'delivered', 'cancelled', 'receive'],
    'A Promise is like a delivery order: starts pending, resolves (delivered) or rejects (cancelled).');
  add('callback', 'programming', 'phone callback', 'communication',
    ['function-reference', 'later-invocation', 'async'],
    ['phone-number', 'return-call', 'later'],
    'A callback is like a phone callback: leave your number (function) and get called when ready.');
  add('event loop', 'programming', 'task queue', 'management',
    ['call-stack', 'task-queue', 'microtasks', 'non-blocking'],
    ['current-task', 'waiting-tasks', 'urgent-tasks', 'delegation'],
    'The event loop is like a task manager: finishes the current task, then checks the queue.');
  add('garbage collection', 'programming', 'automatic cleanup', 'housekeeping',
    ['unreachable', 'mark-sweep', 'automatic'],
    ['unused-items', 'sort-discard', 'scheduled'],
    'Garbage collection is like automatic cleanup: unreachable objects removed without manual intervention.');
  add('cache', 'programming', 'notebook', 'learning',
    ['fast-access', 'eviction', 'hit-miss', 'TTL'],
    ['quick-reference', 'erasing-old-notes', 'found-or-not', 'relevance'],
    'A cache is like a notebook of frequent answers: quick to check, periodically cleared.');
  add('mutex', 'programming', 'bathroom key', 'shared-resource',
    ['lock', 'unlock', 'exclusive-access'],
    ['take-key', 'return-key', 'one-at-a-time'],
    'A mutex is like a bathroom key: only one holder at a time, others must wait.');
  add('thread', 'programming', 'worker', 'factory',
    ['execution', 'shared-memory', 'concurrent'],
    ['task', 'shared-tools', 'parallel'],
    'A thread is like a factory worker: multiple workers operate concurrently, sharing resources.');
  add('type system', 'programming', 'dress code', 'social',
    ['type-checking', 'constraints', 'safety'],
    ['rules', 'restrictions', 'appropriateness'],
    'A type system is like a dress code: enforces rules about what values are acceptable.');

  // ── Pattern ↔ Pattern ──
  add('Observer pattern', 'design-patterns', 'newsletter subscription', 'media',
    ['subject', 'observers', 'notify', 'subscribe'],
    ['publisher', 'subscribers', 'send-issue', 'subscribe'],
    'The Observer pattern is like a newsletter: subscribers sign up, publisher notifies on new content.');
  add('Factory pattern', 'design-patterns', 'car assembly line', 'manufacturing',
    ['creator', 'product', 'abstract-interface'],
    ['assembly-line', 'car', 'blueprint'],
    'The Factory pattern is like an assembly line: creates objects without specifying exact class.');
  add('MVC pattern', 'design-patterns', 'restaurant', 'hospitality',
    ['model', 'view', 'controller', 'separation'],
    ['kitchen', 'menu', 'waiter', 'role-division'],
    'MVC is like a restaurant: model=kitchen (data), view=menu (presentation), controller=waiter (logic).');
  add('Singleton pattern', 'design-patterns', 'president of a country', 'governance',
    ['single-instance', 'global-access'],
    ['one-leader', 'public-office'],
    'The Singleton is like having one president: only one instance exists, globally accessible.');
  add('Strategy pattern', 'design-patterns', 'GPS navigation modes', 'navigation',
    ['context', 'strategy-interface', 'swap-at-runtime'],
    ['GPS-app', 'route-type', 'change-route'],
    'The Strategy pattern is like GPS routes: pick a strategy that can be swapped at runtime.');
  add('Adapter pattern', 'design-patterns', 'power adapter', 'travel',
    ['source-interface', 'target-interface', 'wrapper'],
    ['foreign-plug', 'local-socket', 'adapter-device'],
    'The Adapter pattern is like a power adapter: wraps one interface to be compatible with another.');
  add('Decorator pattern', 'design-patterns', 'gift wrapping', 'retail',
    ['base-object', 'wrapper', 'added-behavior'],
    ['gift', 'wrapping-paper', 'ribbon-bow'],
    'The Decorator pattern is like gift wrapping: each layer adds presentation without changing the inside.');

  // ── Cross-Domain ──
  add('database index', 'databases', 'book index', 'publishing',
    ['B-tree', 'lookup', 'sorted', 'pointer-to-data'],
    ['alphabetical', 'lookup', 'sorted', 'page-numbers'],
    'A database index is like a book index: sorted structure pointing to data for fast lookup.');
  add('Docker container', 'devops', 'shipping container', 'logistics',
    ['isolation', 'standardized', 'portable', 'image'],
    ['sealed', 'standardized', 'transportable', 'manifest'],
    'A Docker container is like a shipping container: standardized, isolated, and portable.');
  add('Git branch', 'version-control', 'parallel universe', 'science-fiction',
    ['diverge', 'merge', 'independent-changes'],
    ['split-timeline', 'converge', 'independent-events'],
    'A Git branch is like a parallel universe: timelines diverge, evolve independently, and merge.');
  add('microservices', 'architecture', 'specialized departments', 'business',
    ['independent', 'API-communication', 'single-responsibility'],
    ['departments', 'memos-meetings', 'focused-role'],
    'Microservices are like departments: each handles one concern via defined interfaces.');
  add('load balancer', 'infrastructure', 'traffic officer', 'transportation',
    ['distribute', 'health-check', 'availability'],
    ['direct-traffic', 'check-roads', 'flow'],
    'A load balancer is like a traffic officer: distributes requests across servers.');
  add('firewall', 'security', 'security guard', 'building',
    ['rules', 'allow-deny', 'inspection'],
    ['checklist', 'allow-deny', 'ID-check'],
    'A firewall is like a security guard: inspects traffic and decides what to allow or block.');
  add('DNS', 'networking', 'phone book', 'communication',
    ['domain-name', 'IP-address', 'lookup'],
    ['name', 'phone-number', 'search'],
    'DNS is like a phone book: translates names (domains) into addresses (IPs).');
  add('encryption', 'security', 'secret language', 'espionage',
    ['plaintext', 'ciphertext', 'key'],
    ['message', 'coded-message', 'codebook'],
    'Encryption is like a secret language: only those with the key can decode the message.');
  add('REST API', 'web', 'library system', 'education',
    ['resources', 'CRUD', 'stateless', 'endpoints'],
    ['books', 'borrow-return', 'no-memory', 'desks'],
    'A REST API is like a library: resources accessed via endpoints using standard operations.');
  add('WebSocket', 'web', 'phone call', 'communication',
    ['persistent-connection', 'bidirectional', 'real-time'],
    ['open-line', 'two-way', 'instant'],
    'A WebSocket is like a phone call: once connected, both sides talk in real-time.');
  add('CI/CD pipeline', 'devops', 'assembly line', 'manufacturing',
    ['stages', 'automated', 'sequential', 'quality-checks'],
    ['stations', 'automated', 'sequential', 'inspections'],
    'A CI/CD pipeline is like an assembly line: code passes through automated testing stages.');
  add('ORM', 'databases', 'interpreter', 'diplomacy',
    ['object-mapping', 'query-generation', 'abstraction'],
    ['language-bridge', 'message-conversion', 'simplification'],
    'An ORM is like an interpreter: translates between OO code and relational DB language.');

  return entries;
}

// ── Language Analogy Pairs for Code Generation ──────────────────────────────

interface LanguageAnalogyPair {
  sourceLang: string;
  targetLang: string;
  sourceConstruct: string;
  targetConstruct: string;
  sourceExample: string;
  targetExample: string;
}

function buildLanguageAnalogies(): LanguageAnalogyPair[] {
  const pairs: LanguageAnalogyPair[] = [];

  const add = (
    sourceLang: string, targetLang: string,
    sourceConstruct: string, targetConstruct: string,
    sourceExample: string, targetExample: string,
  ) => {
    pairs.push({ sourceLang, targetLang, sourceConstruct, targetConstruct, sourceExample, targetExample });
  };

  add('python', 'javascript', 'list comprehension', 'map/filter',
    '[x * 2 for x in items if x > 0]',
    'items.filter(x => x > 0).map(x => x * 2)');
  add('python', 'javascript', 'decorator', 'higher-order function',
    '@log_calls\ndef greet(name): ...',
    'const greet = logCalls((name) => { ... })');
  add('python', 'javascript', 'context manager', 'try/finally',
    'with open("f.txt") as f: data = f.read()',
    'const f = openFile("f.txt"); try { data = f.read(); } finally { f.close(); }');
  add('python', 'javascript', 'generator', 'generator function',
    'def count(): yield n',
    'function* count() { yield n; }');
  add('rust', 'typescript', 'Result<T, E>', 'discriminated union',
    'fn parse(s: &str) -> Result<i32, ParseError>',
    'function parse(s: string): { ok: true; value: number } | { ok: false; error: ParseError }');
  add('rust', 'typescript', 'pattern matching', 'switch/if narrowing',
    'match shape { Circle(r) => ..., Rect(w,h) => ... }',
    'switch (shape.kind) { case "circle": ... case "rect": ... }');
  add('rust', 'typescript', 'Option<T>', 'T | undefined',
    'fn find(id: u32) -> Option<User>',
    'function find(id: number): User | undefined');
  add('go', 'javascript', 'goroutine', 'async function',
    'go func() { doWork() }()',
    '(async () => { await doWork(); })()');
  add('go', 'typescript', 'error return', 'Result pattern',
    'val, err := doSomething()\nif err != nil { return err }',
    'const result = doSomething();\nif (!result.ok) return result;');
  add('java', 'typescript', 'Stream API', 'Array methods',
    'list.stream().filter(x -> x > 0).map(x -> x * 2).collect(toList())',
    'list.filter(x => x > 0).map(x => x * 2)');
  add('java', 'typescript', 'Optional<T>', 'optional chaining',
    'Optional.ofNullable(user).map(User::getName).orElse("anon")',
    'user?.name ?? "anon"');
  add('python', 'rust', 'list comprehension', 'iterator chain',
    '[x * 2 for x in items if x > 0]',
    'items.iter().filter(|&x| x > 0).map(|x| x * 2).collect::<Vec<_>>()');
  add('javascript', 'python', 'Promise.all', 'asyncio.gather',
    'await Promise.all([fetchA(), fetchB()])',
    'await asyncio.gather(fetch_a(), fetch_b())');
  add('typescript', 'rust', 'interface', 'trait',
    'interface Printable { print(): void }',
    'trait Printable { fn print(&self); }');
  add('typescript', 'go', 'interface', 'interface',
    'interface Writer { write(data: string): void }',
    'type Writer interface { Write(data string) }');

  return pairs;
}

// ── Domain Transfer Templates ───────────────────────────────────────────────

interface TransferTemplate {
  sourceDomain: string;
  targetDomain: string;
  mappings: Record<string, string>;
  adaptationHints: string[];
}

const TRANSFER_TEMPLATES: TransferTemplate[] = [
  {
    sourceDomain: 'web-frontend', targetDomain: 'mobile',
    mappings: { 'DOM manipulation': 'view hierarchy', 'CSS styles': 'layout constraints', 'event listeners': 'gesture handlers', 'fetch API': 'networking layer', 'local storage': 'app storage' },
    adaptationHints: ['Replace DOM APIs with native view APIs', 'Convert CSS to platform layout', 'Handle mobile lifecycle events'],
  },
  {
    sourceDomain: 'backend', targetDomain: 'serverless',
    mappings: { 'server process': 'function invocation', 'middleware chain': 'function composition', 'connection pool': 'per-invocation connection', 'session storage': 'external state store', 'background job': 'async event trigger' },
    adaptationHints: ['Remove long-lived state assumptions', 'Add cold-start optimization', 'Use external storage for state'],
  },
  {
    sourceDomain: 'monolith', targetDomain: 'microservices',
    mappings: { 'module': 'service', 'function call': 'API call', 'shared database': 'per-service database', 'in-process event': 'message queue event', 'transaction': 'saga pattern' },
    adaptationHints: ['Add network error handling', 'Implement eventual consistency', 'Add service discovery'],
  },
  {
    sourceDomain: 'synchronous', targetDomain: 'asynchronous',
    mappings: { 'sequential execution': 'event-driven flow', 'return value': 'callback / promise', 'try/catch': 'error handler / .catch()', 'blocking I/O': 'non-blocking I/O' },
    adaptationHints: ['Replace blocking calls with async equivalents', 'Add async error propagation', 'Consider race conditions'],
  },
  {
    sourceDomain: 'SQL', targetDomain: 'NoSQL',
    mappings: { 'table': 'collection', 'row': 'document', 'column': 'field', 'join': 'embedded document / reference', 'schema': 'flexible schema' },
    adaptationHints: ['Denormalize for read performance', 'Design around access patterns', 'Handle eventual consistency'],
  },
  {
    sourceDomain: 'OOP', targetDomain: 'functional',
    mappings: { 'class': 'module + closures', 'method': 'pure function', 'field': 'parameter / closure variable', 'inheritance': 'composition + HOF', 'mutable state': 'immutable data + transforms' },
    adaptationHints: ['Replace mutation with transformation', 'Use composition over inheritance', 'Leverage higher-order functions'],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function structuralSimilarity(propsA: string[], propsB: string[]): number {
  if (propsA.length === 0 && propsB.length === 0) return 1;
  if (propsA.length === 0 || propsB.length === 0) return 0;
  const setA = new Set(propsA.map(p => p.toLowerCase()));
  const setB = new Set(propsB.map(p => p.toLowerCase()));
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function surfaceSimilarity(nameA: string, nameB: string): number {
  const tokensA = tokenize(nameA);
  const tokensB = tokenize(nameB);
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb) { matches++; break; }
      if (ta.length > 3 && tb.length > 3) {
        if (ta.includes(tb) || tb.includes(ta)) { matches += 0.5; break; }
      }
    }
  }
  return clamp(matches / Math.max(tokensA.length, tokensB.length), 0, 1);
}

function generateExplanation(
  source: StructureElement,
  target: StructureElement,
  mappings: StructureMapping[],
): string {
  if (mappings.length === 0) {
    return `"${source.name}" (${source.domain}) and "${target.name}" (${target.domain}) share a loose conceptual relationship.`;
  }

  const identicalMaps = mappings.filter(m => m.mappingType === 'identical');
  const analogousMaps = mappings.filter(m => m.mappingType === 'analogous');

  const parts: string[] = [];
  parts.push(`"${source.name}" (${source.domain}) is analogous to "${target.name}" (${target.domain}).`);

  if (identicalMaps.length > 0) {
    const shared = identicalMaps.map(m => m.sourceProperty).join(', ');
    parts.push(`They share identical properties: ${shared}.`);
  }
  if (analogousMaps.length > 0) {
    const mapped = analogousMaps.map(m => `${m.sourceProperty} ↔ ${m.targetProperty}`).join(', ');
    parts.push(`Analogous mappings: ${mapped}.`);
  }

  return parts.join(' ');
}

function generateId(): string {
  return `pat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class AnalogicalReasoner {
  private config: AnalogicalReasonerConfig;
  private analogyKB: AnalogyEntry[];
  private languageAnalogies: LanguageAnalogyPair[];
  private learnedPatterns: AnalogyPattern[] = [];
  private totalAnalogies: number = 0;
  private totalTransfers: number = 0;
  private confidenceHistory: number[] = [];
  private domainSet: Set<string> = new Set();

  constructor(config?: Partial<AnalogicalReasonerConfig>) {
    this.config = {
      minSimilarity: config?.minSimilarity ?? DEFAULT_CONFIG.minSimilarity,
      maxAnalogies: config?.maxAnalogies ?? DEFAULT_CONFIG.maxAnalogies,
      structureWeight: config?.structureWeight ?? DEFAULT_CONFIG.structureWeight,
      enablePatternLearning: config?.enablePatternLearning ?? DEFAULT_CONFIG.enablePatternLearning,
      maxPatterns: config?.maxPatterns ?? DEFAULT_CONFIG.maxPatterns,
    };
    this.analogyKB = buildAnalogyKnowledgeBase();
    this.languageAnalogies = buildLanguageAnalogies();
  }

  // ── Core Analogy Finding ────────────────────────────────────────────────

  /** Find the best analogy for a concept, optionally scoped to a target domain. */
  findAnalogy(sourceConcept: string, targetDomain?: string): AnalogyResult | null {
    const results = this.findAnalogies(sourceConcept, 1, targetDomain);
    return results.length > 0 ? results[0] : null;
  }

  /** Find multiple analogies across domains for a concept. */
  findAnalogies(sourceConcept: string, limit?: number, targetDomain?: string): AnalogyResult[] {
    const max = limit ?? this.config.maxAnalogies;
    const conceptTokens = tokenize(sourceConcept);
    const conceptLower = sourceConcept.toLowerCase();

    const scored: Array<{ entry: AnalogyEntry; score: number }> = [];

    // Score each knowledge base entry against the source concept
    for (const entry of this.analogyKB) {
      if (targetDomain && entry.targetDomain.toLowerCase() !== targetDomain.toLowerCase()) {
        continue;
      }

      let nameScore = 0;
      const sourceLower = entry.source.toLowerCase();
      if (sourceLower === conceptLower) {
        nameScore = 1;
      } else if (conceptLower.includes(sourceLower) || sourceLower.includes(conceptLower)) {
        nameScore = 0.7;
      } else {
        nameScore = surfaceSimilarity(sourceConcept, entry.source);
      }

      // Check tokens against source properties for structural relevance
      let propertyScore = 0;
      if (conceptTokens.length > 0) {
        const entryTokens = new Set([
          ...tokenize(entry.source),
          ...entry.sourceProperties.map(p => p.toLowerCase()),
        ]);
        let hits = 0;
        for (const t of conceptTokens) {
          if (entryTokens.has(t)) hits++;
        }
        propertyScore = conceptTokens.length > 0 ? hits / conceptTokens.length : 0;
      }

      const score = nameScore * 0.7 + propertyScore * 0.3;
      if (score >= this.config.minSimilarity) {
        scored.push({ entry, score });
      }
    }

    // Also check learned patterns
    for (const pattern of this.learnedPatterns) {
      if (targetDomain && pattern.domain.toLowerCase() !== targetDomain.toLowerCase()) {
        continue;
      }
      const patternScore = surfaceSimilarity(sourceConcept, pattern.sourcePattern);
      if (patternScore >= this.config.minSimilarity) {
        scored.push({
          entry: {
            source: pattern.sourcePattern,
            sourceDomain: pattern.domain,
            target: pattern.targetPattern,
            targetDomain: pattern.domain,
            sourceProperties: tokenize(pattern.sourcePattern),
            targetProperties: tokenize(pattern.targetPattern),
            explanation: pattern.abstraction,
          },
          score: patternScore * 0.9,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const results: AnalogyResult[] = [];
    const seenTargets = new Set<string>();

    for (const { entry, score } of scored) {
      if (results.length >= max) break;
      const targetKey = `${entry.target}:${entry.targetDomain}`;
      if (seenTargets.has(targetKey)) continue;
      seenTargets.add(targetKey);

      const source: StructureElement = {
        name: entry.source,
        domain: entry.sourceDomain,
        properties: entry.sourceProperties,
        relations: [],
      };
      const target: StructureElement = {
        name: entry.target,
        domain: entry.targetDomain,
        properties: entry.targetProperties,
        relations: [],
      };

      const mappings = this.buildMappings(entry.sourceProperties, entry.targetProperties);
      const confidence = round2(clamp(score * 0.9, 0, 1));

      results.push({
        source,
        target,
        mappings,
        similarity: round2(score),
        explanation: entry.explanation,
        confidence,
      });

      this.totalAnalogies++;
      this.confidenceHistory.push(confidence);
      this.domainSet.add(entry.sourceDomain);
      this.domainSet.add(entry.targetDomain);
    }

    return results;
  }

  /** Compare two structure elements and return similarity + mappings. */
  compareStructures(elementA: StructureElement, elementB: StructureElement): AnalogyResult {
    const structScore = structuralSimilarity(elementA.properties, elementB.properties);
    const surfScore = surfaceSimilarity(elementA.name, elementB.name);
    const surfaceWeight = 1 - this.config.structureWeight;
    const similarity = round2(
      this.config.structureWeight * structScore + surfaceWeight * surfScore,
    );

    const mappings = this.buildMappings(elementA.properties, elementB.properties);
    const confidence = round2(clamp(similarity * 0.85, 0, 1));
    const explanation = generateExplanation(elementA, elementB, mappings);

    this.totalAnalogies++;
    this.confidenceHistory.push(confidence);
    this.domainSet.add(elementA.domain);
    this.domainSet.add(elementB.domain);

    return { source: elementA, target: elementB, mappings, similarity, explanation, confidence };
  }

  // ── Code Generation by Analogy ──────────────────────────────────────────

  /** Generate code in target language by analogy with source code. */
  generateByAnalogy(sourceCode: string, sourceLanguage: string, targetLanguage: string): string {
    const srcLang = sourceLanguage.toLowerCase();
    const tgtLang = targetLanguage.toLowerCase();
    const codeLower = sourceCode.toLowerCase();

    const scorePair = (pair: LanguageAnalogyPair, construct: string, example: string) => {
      let score = 0;
      for (const t of tokenize(construct)) { if (codeLower.includes(t)) score++; }
      for (const t of tokenize(example)) { if (codeLower.includes(t)) score += 0.5; }
      return score;
    };

    let bestPair: LanguageAnalogyPair | null = null;
    let bestScore = -1;

    for (const p of this.languageAnalogies.filter(p => p.sourceLang === srcLang && p.targetLang === tgtLang)) {
      const s = scorePair(p, p.sourceConstruct, p.sourceExample);
      if (s > bestScore) { bestScore = s; bestPair = p; }
    }
    for (const p of this.languageAnalogies.filter(p => p.sourceLang === tgtLang && p.targetLang === srcLang)) {
      const s = scorePair(p, p.targetConstruct, p.targetExample);
      if (s > bestScore) {
        bestScore = s;
        bestPair = { sourceLang: p.targetLang, targetLang: p.sourceLang, sourceConstruct: p.targetConstruct, targetConstruct: p.sourceConstruct, sourceExample: p.targetExample, targetExample: p.sourceExample };
      }
    }

    if (!bestPair) return this.generateGenericTranslation(sourceCode, srcLang, tgtLang);

    this.totalAnalogies++;
    return [
      `// Analogy: ${srcLang} "${bestPair.sourceConstruct}" → ${tgtLang} "${bestPair.targetConstruct}"`,
      `// Source pattern: ${bestPair.sourceExample.split('\n')[0]}`,
      `// Target pattern: ${bestPair.targetExample.split('\n')[0]}`,
      '', `// Translated from ${srcLang} to ${tgtLang}:`, bestPair.targetExample,
    ].join('\n');
  }

  // ── Transfer Learning ──────────────────────────────────────────────────

  /** Apply a solution from one domain to another by analogy. */
  transferSolution(problem: string, sourceDomain: string, targetDomain: string): TransferResult {
    const srcDomain = sourceDomain.toLowerCase();
    const tgtDomain = targetDomain.toLowerCase();

    let template = TRANSFER_TEMPLATES.find(
      t => t.sourceDomain.toLowerCase() === srcDomain && t.targetDomain.toLowerCase() === tgtDomain,
    );
    let reversed = false;
    if (!template) {
      template = TRANSFER_TEMPLATES.find(
        t => t.sourceDomain.toLowerCase() === tgtDomain && t.targetDomain.toLowerCase() === srcDomain,
      );
      if (template) reversed = true;
    }

    const problemTokens = tokenize(problem);
    const adaptations: string[] = [];
    let transferredSolution: string;

    if (template) {
      const mappings = reversed ? this.reverseMappings(template.mappings) : template.mappings;
      const parts: string[] = [`Transferred solution from ${sourceDomain} to ${targetDomain}:`, ''];

      let matched = false;
      for (const [src, tgt] of Object.entries(mappings)) {
        if (tokenize(src).some(t => problemTokens.includes(t))) {
          parts.push(`• Replace "${src}" with "${tgt}"`);
          adaptations.push(`Mapped "${src}" → "${tgt}"`);
          matched = true;
        }
      }
      if (!matched) {
        for (const [src, tgt] of Object.entries(mappings)) {
          parts.push(`• Replace "${src}" with "${tgt}"`);
          adaptations.push(`Mapped "${src}" → "${tgt}"`);
        }
      }

      parts.push('', 'Adaptation notes:');
      for (const hint of template.adaptationHints) {
        parts.push(`  - ${hint}`);
        adaptations.push(hint);
      }
      transferredSolution = parts.join('\n');
    } else {
      transferredSolution = this.generateConceptualTransfer(problem, sourceDomain, targetDomain);
      adaptations.push('No direct template found; used conceptual analogy mapping');
    }

    const confidence = round2(template ? 0.75 : 0.4);
    this.totalTransfers++;
    this.confidenceHistory.push(confidence);
    this.domainSet.add(sourceDomain);
    this.domainSet.add(targetDomain);

    return { sourceDomain, targetDomain, originalSolution: problem, transferredSolution, adaptations, confidence };
  }

  /** Learn a new analogy pattern from examples. */
  learnPattern(sourcePattern: string, targetPattern: string, domain: string, abstraction: string): AnalogyPattern | null {
    if (!this.config.enablePatternLearning) return null;

    // Evict oldest pattern if at capacity
    if (this.learnedPatterns.length >= this.config.maxPatterns) {
      this.learnedPatterns.sort((a, b) => a.useCount - b.useCount);
      this.learnedPatterns.shift();
    }

    const pattern: AnalogyPattern = {
      id: generateId(),
      sourcePattern,
      targetPattern,
      domain,
      abstraction,
      examples: [`${sourcePattern} → ${targetPattern}`],
      useCount: 0,
      createdAt: Date.now(),
    };

    this.learnedPatterns.push(pattern);
    this.domainSet.add(domain);
    return pattern;
  }

  // ── Pattern Management ─────────────────────────────────────────────────

  /** List all learned patterns. */
  getPatterns(): ReadonlyArray<AnalogyPattern> {
    return [...this.learnedPatterns];
  }

  /** Filter patterns by domain. */
  getPatternsByDomain(domain: string): AnalogyPattern[] {
    const lower = domain.toLowerCase();
    return this.learnedPatterns.filter(p => p.domain.toLowerCase() === lower);
  }

  /** Remove a learned pattern by ID. */
  removePattern(id: string): boolean {
    const idx = this.learnedPatterns.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.learnedPatterns.splice(idx, 1);
    return true;
  }

  // ── Explanation Generation ─────────────────────────────────────────────

  /** Explain a concept using the best analogy for the audience level. */
  explain(concept: string, targetAudience?: string): string {
    const audience = (targetAudience ?? 'beginner').toLowerCase();
    const isExpert = audience === 'expert' || audience === 'advanced' || audience === 'senior';

    const realWorldDomains = new Set([
      'cooking', 'storage', 'exercise', 'toys', 'restaurant', 'architecture',
      'kitchen', 'office', 'retail', 'commerce', 'communication', 'management',
      'housekeeping', 'learning', 'publishing', 'logistics', 'science-fiction',
      'business', 'manufacturing', 'transportation', 'building', 'reference',
      'language', 'investigation', 'governance', 'navigation', 'travel', 'media',
      'hospitality', 'espionage', 'education', 'social', 'factory',
      'shared-resource', 'genealogy', 'diplomacy',
    ]);
    const techDomains = new Set([
      'react', 'vue', 'express', 'django', 'design-patterns',
      'architecture', 'databases', 'devops', 'programming',
    ]);

    const allAnalogies = this.findAnalogies(concept, 10);
    if (allAnalogies.length === 0) {
      return `${concept}: a concept understood through its structural properties. ` +
        this.describeFromProperties(concept);
    }

    const preferred = isExpert ? techDomains : realWorldDomains;
    const best = allAnalogies.find(a => preferred.has(a.target.domain)) ?? allAnalogies[0];

    if (isExpert) {
      const parts = [`${concept} is analogous to ${best.target.name} (${best.target.domain}).`, best.explanation];
      const mapDesc = best.mappings.filter(m => m.confidence > 0.5)
        .map(m => `${m.sourceProperty} ↔ ${m.targetProperty}`).join(', ');
      if (mapDesc) parts.push(`Key mappings: ${mapDesc}.`);
      return parts.join(' ');
    }
    return `Think of ${concept} like ${best.target.name}. ${best.explanation}`;
  }

  // ── Stats & Persistence ───────────────────────────────────────────────

  /** Return current statistics. */
  getStats(): Readonly<AnalogicalReasonerStats> {
    const avg = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
      : 0;

    return {
      totalAnalogies: this.totalAnalogies,
      totalTransfers: this.totalTransfers,
      patternsLearned: this.learnedPatterns.length,
      avgConfidence: round2(avg),
      domainsCovered: Array.from(this.domainSet),
    };
  }

  /** Serialize the reasoner state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      learnedPatterns: this.learnedPatterns,
      totalAnalogies: this.totalAnalogies,
      totalTransfers: this.totalTransfers,
      confidenceHistory: this.confidenceHistory,
      domainSet: Array.from(this.domainSet),
    });
  }

  /** Restore an AnalogicalReasoner from serialized JSON. */
  static deserialize(json: string): AnalogicalReasoner {
    const data = JSON.parse(json) as {
      config: AnalogicalReasonerConfig;
      learnedPatterns: AnalogyPattern[];
      totalAnalogies: number;
      totalTransfers: number;
      confidenceHistory: number[];
      domainSet: string[];
    };

    const instance = new AnalogicalReasoner(data.config);
    instance.learnedPatterns = data.learnedPatterns;
    instance.totalAnalogies = data.totalAnalogies;
    instance.totalTransfers = data.totalTransfers;
    instance.confidenceHistory = data.confidenceHistory;
    instance.domainSet = new Set(data.domainSet);
    return instance;
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private buildMappings(sourceProps: string[], targetProps: string[]): StructureMapping[] {
    const mappings: StructureMapping[] = [];
    const usedTargets = new Set<number>();

    for (const sp of sourceProps) {
      const spLower = sp.toLowerCase();
      let bestIdx = -1;
      let bestScore = 0;
      let bestType: StructureMapping['mappingType'] = 'partial';

      for (let j = 0; j < targetProps.length; j++) {
        if (usedTargets.has(j)) continue;
        const tpLower = targetProps[j].toLowerCase();

        if (spLower === tpLower) {
          bestIdx = j;
          bestScore = 1;
          bestType = 'identical';
          break;
        }

        // Check for analogous: shared root words or substring match
        const sim = this.wordSimilarity(spLower, tpLower);
        if (sim > bestScore) {
          bestScore = sim;
          bestIdx = j;
          bestType = sim > 0.6 ? 'analogous' : 'partial';
        }
      }

      // Check for inverse relationships
      if (bestScore < 0.3 && bestIdx === -1) {
        for (let j = 0; j < targetProps.length; j++) {
          if (usedTargets.has(j)) continue;
          if (this.isInverse(spLower, targetProps[j].toLowerCase())) {
            bestIdx = j;
            bestScore = 0.5;
            bestType = 'inverse';
            break;
          }
        }
      }

      if (bestIdx >= 0 && bestScore > 0.15) {
        usedTargets.add(bestIdx);
        mappings.push({
          sourceProperty: sp,
          targetProperty: targetProps[bestIdx],
          mappingType: bestType,
          confidence: round2(clamp(bestScore, 0, 1)),
        });
      }
    }

    return mappings;
  }

  private wordSimilarity(a: string, b: string): number {
    if (a === b) return 1;

    // Substring containment
    if (a.includes(b) || b.includes(a)) return 0.7;

    // Split on hyphens and compare parts
    const partsA = a.split('-').filter(p => p.length > 0);
    const partsB = b.split('-').filter(p => p.length > 0);

    let matches = 0;
    for (const pa of partsA) {
      for (const pb of partsB) {
        if (pa === pb) matches++;
        else if (pa.includes(pb) || pb.includes(pa)) matches += 0.5;
      }
    }

    const maxParts = Math.max(partsA.length, partsB.length);
    if (maxParts === 0) return 0;

    // Character bigram overlap as a fallback
    const bigramsA = this.getBigrams(a);
    const bigramsB = this.getBigrams(b);
    let bigramOverlap = 0;
    for (const bg of bigramsA) {
      if (bigramsB.has(bg)) bigramOverlap++;
    }
    const totalBigrams = bigramsA.size + bigramsB.size;
    const bigramScore = totalBigrams > 0 ? (2 * bigramOverlap) / totalBigrams : 0;

    return Math.max(matches / maxParts, bigramScore);
  }

  private getBigrams(s: string): Set<string> {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  }

  private isInverse(a: string, b: string): boolean {
    const inversePairs: Array<[string, string]> = [
      ['input', 'output'], ['push', 'pop'], ['enqueue', 'dequeue'],
      ['lock', 'unlock'], ['open', 'close'], ['start', 'stop'],
      ['read', 'write'], ['request', 'response'], ['send', 'receive'],
      ['source', 'sink'], ['producer', 'consumer'], ['encrypt', 'decrypt'],
      ['encode', 'decode'], ['serialize', 'deserialize'], ['connect', 'disconnect'],
      ['subscribe', 'unsubscribe'], ['mount', 'unmount'], ['create', 'destroy'],
    ];
    for (const [x, y] of inversePairs) {
      if ((a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x))) {
        return true;
      }
    }
    return false;
  }

  private generateGenericTranslation(sourceCode: string, srcLang: string, tgtLang: string): string {
    const srcC = LANGUAGE_CONSTRUCTS[srcLang];
    const tgtC = LANGUAGE_CONSTRUCTS[tgtLang];
    const lines = [`// Generic translation from ${srcLang} to ${tgtLang}`, ''];
    if (srcC && tgtC) {
      const codeLower = sourceCode.toLowerCase();
      const matched = Object.keys(srcC).filter(c => tokenize(c).some(t => codeLower.includes(t)) && tgtC[c]);
      if (matched.length > 0) {
        lines.push('// Concept mappings:');
        for (const c of matched) lines.push(`//   ${c}: ${srcLang} (${srcC[c]}) → ${tgtLang} (${tgtC[c]})`);
        lines.push('');
      }
    }
    for (const line of sourceCode.split('\n')) lines.push(`//   ${line}`);
    lines.push('', `// TODO: Rewrite using ${tgtLang} idioms`);
    return lines.join('\n');
  }

  private generateConceptualTransfer(problem: string, sourceDomain: string, targetDomain: string): string {
    const relevant = this.analogyKB.filter(e => {
      const sd = e.sourceDomain.toLowerCase(), td = e.targetDomain.toLowerCase();
      const s = sourceDomain.toLowerCase(), t = targetDomain.toLowerCase();
      return (sd === s && td === t) || (sd === t && td === s);
    });

    const lines = [`Conceptual transfer from ${sourceDomain} to ${targetDomain}:`, ''];
    if (relevant.length > 0) {
      lines.push('Related analogies:');
      for (const e of relevant.slice(0, 5)) {
        lines.push(`  • ${e.source} (${e.sourceDomain}) ↔ ${e.target} (${e.targetDomain}): ${e.explanation}`);
      }
    } else {
      lines.push('No direct cross-domain analogies found.');
      lines.push(`Consider: what structural elements of "${sourceDomain}" map to "${targetDomain}"?`);
    }
    lines.push('', `Original problem: ${problem}`);
    lines.push(`Approach: Identify core elements and find equivalents in ${targetDomain}.`);
    return lines.join('\n');
  }

  private reverseMappings(mappings: Record<string, string>): Record<string, string> {
    const reversed: Record<string, string> = {};
    for (const [k, v] of Object.entries(mappings)) {
      reversed[v] = k;
    }
    return reversed;
  }

  private describeFromProperties(concept: string): string {
    const conceptLower = concept.toLowerCase();
    const props = CONCEPT_PROPERTIES[conceptLower];
    if (props) {
      return `Key structural properties: ${props.join(', ')}.`;
    }

    // Attempt partial match
    for (const [key, val] of Object.entries(CONCEPT_PROPERTIES)) {
      if (conceptLower.includes(key) || key.includes(conceptLower)) {
        return `Related to "${key}" with properties: ${val.join(', ')}.`;
      }
    }

    return 'Try breaking it into simpler concepts and finding analogies for each part.';
  }
}
