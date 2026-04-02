/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Semantic Engine — Local Semantic Embedding for the AI Brain System          ║
 * ║                                                                              ║
 * ║  A fully self-contained semantic embedding engine that converts text         ║
 * ║  into dense vector representations for similarity search.                    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Text Embedding — 50-dim vectors via IDF-weighted word vectors           ║
 * ║    ✦ Similarity Search — Cosine similarity ranking of documents              ║
 * ║    ✦ Query Expansion — Synonym-based query variant generation                ║
 * ║    ✦ Disambiguation — Context-aware word sense selection                     ║
 * ║    ✦ Trigram Fallback — Character trigrams for unknown words                 ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline. ~200 pre-built word vectors        ║
 * ║  covering programming, web, database, AI/ML, and more.                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

/** Configuration for the semantic engine. */
export interface SemanticConfig {
  dimensions: number
  minSimilarity: number
}

/** A document with optional pre-computed embedding. */
export interface SemanticDocument {
  id: string
  text: string
  embedding?: number[]
}

/** Result of a similarity search. */
export interface SimilarityResult {
  id: string
  score: number
  text: string
}

/** A word and its dense vector representation. */
export interface WordVector {
  word: string
  vector: number[]
}

// ── Constants ──

const DEFAULT_DIMENSIONS = 50
const DEFAULT_MIN_SIMILARITY = 0.3

/** Stop words filtered during tokenization. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'that',
  'this', 'it', 'its', 'and', 'or', 'not', 'but', 'if', 'then',
  'so', 'up', 'out', 'no', 'just', 'also', 'very', 'what', 'how',
  'when', 'where', 'which', 'who', 'whom', 'why', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'their',
])

// ── Concept Cluster Definitions ──

/**
 * Each concept cluster occupies a designated slice of the 50-dim vector space.
 * A cluster base is a direction (set of dimension indices) that words in that
 * domain will be projected onto, producing semantically coherent neighborhoods.
 */
interface ClusterDef {
  name: string
  dims: number[]   // primary dimensions this cluster activates
  weight: number   // base magnitude
}

const CLUSTERS: ClusterDef[] = [
  { name: 'programming',     dims: [0, 1, 2, 3, 4],       weight: 1.0 },
  { name: 'web',             dims: [5, 6, 7, 8, 9],       weight: 1.0 },
  { name: 'database',        dims: [10, 11, 12, 13, 14],  weight: 1.0 },
  { name: 'ai_ml',           dims: [15, 16, 17, 18, 19],  weight: 1.0 },
  { name: 'algorithms',      dims: [20, 21, 22, 23, 24],  weight: 1.0 },
  { name: 'networking',      dims: [25, 26, 27, 28, 29],  weight: 1.0 },
  { name: 'security',        dims: [30, 31, 32, 33, 34],  weight: 1.0 },
  { name: 'devops',          dims: [35, 36, 37, 38, 39],  weight: 1.0 },
  { name: 'data_structures', dims: [40, 41, 42, 43, 44],  weight: 1.0 },
  { name: 'general',         dims: [45, 46, 47, 48, 49],  weight: 0.8 },
]

/** Cluster name → index for fast lookup. */
const CLUSTER_INDEX = new Map<string, number>(
  CLUSTERS.map((c, i) => [c.name, i])
)

// ── Vocabulary: Word → Cluster Memberships ──

/**
 * Each word is defined by its cluster memberships: [clusterName, strength].
 * The engine composes the final vector by summing weighted cluster bases.
 */
type WordDef = [string, number][]

const VOCABULARY: Record<string, WordDef> = {
  // ── Programming cluster ──
  function:     [['programming', 1.0], ['general', 0.3]],
  method:       [['programming', 0.9], ['general', 0.2]],
  class:        [['programming', 0.9], ['general', 0.3]],
  object:       [['programming', 0.8], ['general', 0.4]],
  variable:     [['programming', 1.0]],
  constant:     [['programming', 0.8], ['general', 0.2]],
  parameter:    [['programming', 0.9]],
  argument:     [['programming', 0.8], ['general', 0.2]],
  return:       [['programming', 0.9]],
  type:         [['programming', 0.8], ['general', 0.3]],
  interface:    [['programming', 0.9], ['web', 0.2]],
  module:       [['programming', 0.8], ['general', 0.2]],
  package:      [['programming', 0.7], ['devops', 0.3]],
  import:       [['programming', 0.9]],
  export:       [['programming', 0.9]],
  compile:      [['programming', 0.9], ['devops', 0.2]],
  runtime:      [['programming', 0.8], ['devops', 0.2]],
  debug:        [['programming', 0.9], ['devops', 0.2]],
  error:        [['programming', 0.7], ['general', 0.4]],
  exception:    [['programming', 0.9]],
  syntax:       [['programming', 1.0]],
  scope:        [['programming', 0.9], ['security', 0.2]],
  closure:      [['programming', 1.0]],
  callback:     [['programming', 0.9], ['web', 0.3]],
  promise:      [['programming', 0.8], ['web', 0.4]],
  async:        [['programming', 0.8], ['web', 0.4]],
  await:        [['programming', 0.8], ['web', 0.4]],
  iterator:     [['programming', 0.9], ['data_structures', 0.3]],
  generator:    [['programming', 0.9]],
  decorator:    [['programming', 0.9]],
  annotation:   [['programming', 0.9]],
  generic:      [['programming', 0.9]],
  template:     [['programming', 0.7], ['web', 0.4]],
  abstract:     [['programming', 0.9]],
  inheritance:  [['programming', 1.0]],
  polymorphism: [['programming', 1.0]],
  encapsulation:[['programming', 1.0], ['security', 0.2]],
  recursion:    [['programming', 0.8], ['algorithms', 0.5]],
  loop:         [['programming', 0.9], ['algorithms', 0.2]],
  condition:    [['programming', 0.8], ['algorithms', 0.2]],
  branch:       [['programming', 0.6], ['devops', 0.5]],
  string:       [['programming', 0.8], ['data_structures', 0.3]],
  integer:      [['programming', 0.8], ['data_structures', 0.2]],
  boolean:      [['programming', 0.9]],
  null:         [['programming', 0.9]],
  undefined:    [['programming', 0.9]],
  enum:         [['programming', 1.0]],
  struct:       [['programming', 0.9], ['data_structures', 0.3]],
  pointer:      [['programming', 0.9], ['data_structures', 0.2]],
  reference:    [['programming', 0.7], ['general', 0.3]],
  lambda:       [['programming', 1.0]],
  expression:   [['programming', 0.9]],
  statement:    [['programming', 0.8], ['general', 0.2]],

  // ── Web cluster ──
  html:         [['web', 1.0]],
  css:          [['web', 1.0]],
  javascript:   [['web', 0.8], ['programming', 0.5]],
  typescript:   [['web', 0.7], ['programming', 0.6]],
  react:        [['web', 1.0], ['programming', 0.3]],
  vue:          [['web', 1.0], ['programming', 0.2]],
  angular:      [['web', 1.0], ['programming', 0.2]],
  node:         [['web', 0.5], ['programming', 0.3], ['networking', 0.2], ['data_structures', 0.3]],
  express:      [['web', 0.9], ['networking', 0.3]],
  api:          [['web', 0.7], ['networking', 0.5]],
  rest:         [['web', 0.8], ['networking', 0.4]],
  graphql:      [['web', 0.8], ['database', 0.3]],
  http:         [['web', 0.7], ['networking', 0.6]],
  url:          [['web', 0.8], ['networking', 0.3]],
  dom:          [['web', 1.0]],
  browser:      [['web', 1.0]],
  server:       [['web', 0.5], ['networking', 0.6], ['devops', 0.3]],
  client:       [['web', 0.7], ['networking', 0.4]],
  request:      [['web', 0.6], ['networking', 0.5]],
  response:     [['web', 0.6], ['networking', 0.5]],
  cookie:       [['web', 0.9], ['security', 0.2]],
  session:      [['web', 0.7], ['security', 0.3]],
  webpack:      [['web', 0.9], ['devops', 0.3]],
  npm:          [['web', 0.7], ['devops', 0.5]],
  component:    [['web', 0.8], ['programming', 0.3]],
  router:       [['web', 0.8], ['networking', 0.4]],

  // ── Database cluster ──
  database:     [['database', 1.0]],
  sql:          [['database', 1.0]],
  query:        [['database', 0.8], ['general', 0.3]],
  table:        [['database', 0.9], ['data_structures', 0.2]],
  index:        [['database', 0.7], ['data_structures', 0.4]],
  schema:       [['database', 0.9], ['programming', 0.2]],
  migration:    [['database', 0.8], ['devops', 0.3]],
  transaction:  [['database', 0.9], ['security', 0.2]],
  join:         [['database', 0.9]],
  select:       [['database', 0.9]],
  insert:       [['database', 0.9]],
  update:       [['database', 0.8], ['general', 0.2]],
  delete:       [['database', 0.7], ['programming', 0.3]],
  primary:      [['database', 0.7], ['general', 0.3]],
  foreign:      [['database', 0.8]],
  constraint:   [['database', 0.8], ['programming', 0.2]],
  mongodb:      [['database', 1.0]],
  postgres:     [['database', 1.0]],
  mysql:        [['database', 1.0]],
  redis:        [['database', 0.8], ['networking', 0.3]],
  cache:        [['database', 0.5], ['web', 0.3], ['algorithms', 0.3]],
  nosql:        [['database', 1.0]],
  orm:          [['database', 0.8], ['programming', 0.4]],

  // ── AI/ML cluster ──
  neural:       [['ai_ml', 1.0]],
  network:      [['ai_ml', 0.5], ['networking', 0.6]],
  model:        [['ai_ml', 0.8], ['programming', 0.2]],
  training:     [['ai_ml', 1.0]],
  inference:    [['ai_ml', 0.9]],
  embedding:    [['ai_ml', 1.0]],
  vector:       [['ai_ml', 0.7], ['data_structures', 0.5]],
  tensor:       [['ai_ml', 1.0]],
  gradient:     [['ai_ml', 1.0]],
  loss:         [['ai_ml', 0.9], ['general', 0.1]],
  epoch:        [['ai_ml', 1.0]],
  batch:        [['ai_ml', 0.7], ['devops', 0.3]],
  layer:        [['ai_ml', 0.9], ['networking', 0.2]],
  activation:   [['ai_ml', 1.0]],
  transformer:  [['ai_ml', 1.0]],
  attention:    [['ai_ml', 0.9]],
  classification:[['ai_ml', 0.9], ['algorithms', 0.2]],
  regression:   [['ai_ml', 0.9]],
  clustering:   [['ai_ml', 0.8], ['algorithms', 0.4]],
  prediction:   [['ai_ml', 0.9]],
  accuracy:     [['ai_ml', 0.8], ['general', 0.2]],
  precision:    [['ai_ml', 0.8], ['general', 0.2]],
  recall:       [['ai_ml', 0.8], ['general', 0.2]],
  dataset:      [['ai_ml', 0.9], ['database', 0.2]],
  feature:      [['ai_ml', 0.7], ['programming', 0.3]],

  // ── Algorithms cluster ──
  algorithm:    [['algorithms', 1.0]],
  sort:         [['algorithms', 1.0]],
  search:       [['algorithms', 0.8], ['database', 0.3]],
  binary:       [['algorithms', 0.7], ['data_structures', 0.3]],
  linear:       [['algorithms', 0.6], ['ai_ml', 0.4]],
  complexity:   [['algorithms', 0.9]],
  optimization: [['algorithms', 0.8], ['ai_ml', 0.3]],
  heuristic:    [['algorithms', 0.9]],
  dynamic:      [['algorithms', 0.8], ['programming', 0.3]],
  greedy:       [['algorithms', 0.9]],
  divide:       [['algorithms', 0.8]],
  backtracking: [['algorithms', 0.9]],
  traversal:    [['algorithms', 0.8], ['data_structures', 0.4]],
  path:         [['algorithms', 0.6], ['networking', 0.3], ['general', 0.2]],
  graph:        [['algorithms', 0.7], ['data_structures', 0.6]],
  hash:         [['algorithms', 0.8], ['security', 0.4], ['data_structures', 0.3]],
  memoization:  [['algorithms', 0.9], ['programming', 0.2]],

  // ── Networking cluster ──
  tcp:          [['networking', 1.0]],
  udp:          [['networking', 1.0]],
  ip:           [['networking', 0.9]],
  dns:          [['networking', 1.0]],
  socket:       [['networking', 0.9], ['programming', 0.2]],
  port:         [['networking', 0.9]],
  protocol:     [['networking', 0.8], ['security', 0.2]],
  bandwidth:    [['networking', 0.9]],
  latency:      [['networking', 0.8], ['algorithms', 0.2]],
  packet:       [['networking', 1.0]],
  proxy:        [['networking', 0.8], ['security', 0.3]],
  firewall:     [['networking', 0.7], ['security', 0.6]],
  load:         [['networking', 0.6], ['devops', 0.5]],
  balancer:     [['networking', 0.7], ['devops', 0.5]],
  websocket:    [['networking', 0.8], ['web', 0.5]],
  mqtt:         [['networking', 0.9]],

  // ── Security cluster ──
  encrypt:      [['security', 1.0]],
  decrypt:      [['security', 1.0]],
  authentication:[['security', 0.9], ['web', 0.3]],
  authorization:[['security', 0.9]],
  token:        [['security', 0.7], ['web', 0.4]],
  jwt:          [['security', 0.8], ['web', 0.4]],
  oauth:        [['security', 0.8], ['web', 0.4]],
  ssl:          [['security', 0.9], ['networking', 0.3]],
  tls:          [['security', 0.9], ['networking', 0.3]],
  certificate:  [['security', 0.9]],
  password:     [['security', 0.9]],
  vulnerability:[['security', 1.0]],
  injection:    [['security', 0.9], ['database', 0.2]],
  xss:          [['security', 1.0], ['web', 0.3]],
  csrf:         [['security', 1.0], ['web', 0.3]],
  cors:         [['security', 0.7], ['web', 0.5]],
  sanitize:     [['security', 0.8], ['web', 0.2]],

  // ── DevOps cluster ──
  docker:       [['devops', 1.0]],
  container:    [['devops', 0.9], ['programming', 0.2]],
  kubernetes:   [['devops', 1.0]],
  deploy:       [['devops', 1.0]],
  pipeline:     [['devops', 0.9], ['programming', 0.2]],
  ci:           [['devops', 1.0]],
  cd:           [['devops', 1.0]],
  git:          [['devops', 0.8], ['programming', 0.3]],
  commit:       [['devops', 0.7], ['programming', 0.3], ['database', 0.2]],
  merge:        [['devops', 0.7], ['programming', 0.3], ['algorithms', 0.2]],
  terraform:    [['devops', 1.0]],
  ansible:      [['devops', 1.0]],
  monitoring:   [['devops', 0.8], ['networking', 0.3]],
  logging:      [['devops', 0.7], ['programming', 0.3]],
  scaling:      [['devops', 0.8], ['networking', 0.3]],
  microservice: [['devops', 0.7], ['web', 0.4], ['networking', 0.3]],
  cloud:        [['devops', 0.8], ['networking', 0.3]],
  aws:          [['devops', 0.9], ['networking', 0.3]],
  azure:        [['devops', 0.9]],

  // ── Data structures cluster ──
  array:        [['data_structures', 1.0], ['programming', 0.3]],
  list:         [['data_structures', 0.9], ['programming', 0.2]],
  map:          [['data_structures', 0.9], ['programming', 0.2]],
  set:          [['data_structures', 0.8], ['programming', 0.2]],
  stack:        [['data_structures', 1.0]],
  queue:        [['data_structures', 1.0], ['networking', 0.2]],
  tree:         [['data_structures', 1.0]],
  heap:         [['data_structures', 1.0]],
  linked:       [['data_structures', 0.9]],
  vertex:       [['data_structures', 0.8], ['algorithms', 0.4]],
  edge:         [['data_structures', 0.7], ['algorithms', 0.4]],
  matrix:       [['data_structures', 0.8], ['ai_ml', 0.4]],
  dictionary:   [['data_structures', 0.9]],
  tuple:        [['data_structures', 0.9], ['programming', 0.2]],
  buffer:       [['data_structures', 0.7], ['networking', 0.3]],
  stream:       [['data_structures', 0.6], ['programming', 0.3], ['networking', 0.2]],
  collection:   [['data_structures', 0.8], ['programming', 0.2]],
  deque:        [['data_structures', 1.0]],
  trie:         [['data_structures', 1.0], ['algorithms', 0.3]],

  // ── General cluster ──
  test:         [['general', 0.7], ['programming', 0.4]],
  documentation:[['general', 0.8], ['programming', 0.2]],
  refactor:     [['general', 0.5], ['programming', 0.6]],
  pattern:      [['general', 0.5], ['programming', 0.4], ['algorithms', 0.3]],
  design:       [['general', 0.6], ['programming', 0.4]],
  architecture: [['general', 0.5], ['programming', 0.3], ['devops', 0.3]],
  performance:  [['general', 0.5], ['algorithms', 0.4], ['networking', 0.2]],
  memory:       [['general', 0.4], ['programming', 0.3], ['data_structures', 0.3]],
  config:       [['general', 0.5], ['devops', 0.4], ['programming', 0.2]],
  environment:  [['general', 0.5], ['devops', 0.5]],
  dependency:   [['general', 0.5], ['devops', 0.4], ['programming', 0.3]],
  version:      [['general', 0.5], ['devops', 0.5]],
  release:      [['general', 0.4], ['devops', 0.6]],
  issue:        [['general', 0.6], ['programming', 0.3]],
  bug:          [['general', 0.5], ['programming', 0.5]],
  fix:          [['general', 0.5], ['programming', 0.5]],
  implement:    [['general', 0.4], ['programming', 0.6]],
  review:       [['general', 0.6], ['programming', 0.3]],
  build:        [['general', 0.4], ['devops', 0.6], ['programming', 0.2]],
  run:          [['general', 0.5], ['programming', 0.4], ['devops', 0.2]],
  execute:      [['general', 0.4], ['programming', 0.5]],
  input:        [['general', 0.6], ['programming', 0.3]],
  output:       [['general', 0.6], ['programming', 0.3]],
  file:         [['general', 0.6], ['programming', 0.3]],
  directory:    [['general', 0.5], ['devops', 0.3], ['programming', 0.2]],
  process:      [['general', 0.5], ['programming', 0.3], ['devops', 0.3]],
  thread:       [['general', 0.3], ['programming', 0.5], ['algorithms', 0.3]],
  event:        [['general', 0.4], ['programming', 0.4], ['web', 0.3]],
  handler:      [['general', 0.3], ['programming', 0.5], ['web', 0.3]],
  middleware:   [['general', 0.2], ['web', 0.6], ['programming', 0.3]],
  plugin:       [['general', 0.4], ['programming', 0.4], ['web', 0.2]],
  library:      [['general', 0.4], ['programming', 0.5]],
  framework:    [['general', 0.4], ['programming', 0.4], ['web', 0.3]],
  tool:         [['general', 0.6], ['programming', 0.3], ['devops', 0.2]],
  cli:          [['general', 0.4], ['programming', 0.3], ['devops', 0.3]],
  log:          [['general', 0.4], ['devops', 0.4], ['programming', 0.2]],
  parse:        [['general', 0.3], ['programming', 0.6]],
  serialize:    [['general', 0.3], ['programming', 0.6], ['networking', 0.2]],
  validate:     [['general', 0.4], ['programming', 0.4], ['security', 0.3]],
}

// ── Synonym Groups ──

/** Synonym groups for query expansion. Each group contains interchangeable terms. */
const SYNONYM_GROUPS: string[][] = [
  ['function', 'method', 'procedure', 'routine', 'subroutine'],
  ['array', 'list', 'collection', 'sequence'],
  ['error', 'exception', 'fault', 'failure', 'bug'],
  ['class', 'type', 'struct', 'record'],
  ['variable', 'field', 'property', 'attribute'],
  ['module', 'package', 'library', 'bundle'],
  ['loop', 'iteration', 'cycle', 'repetition'],
  ['condition', 'predicate', 'guard', 'check'],
  ['string', 'text', 'characters'],
  ['integer', 'number', 'numeric', 'int'],
  ['map', 'dictionary', 'hashmap', 'object'],
  ['callback', 'handler', 'listener', 'hook'],
  ['async', 'asynchronous', 'concurrent', 'parallel'],
  ['api', 'endpoint', 'service', 'interface'],
  ['database', 'datastore', 'storage', 'repository'],
  ['query', 'search', 'lookup', 'find'],
  ['deploy', 'release', 'publish', 'ship'],
  ['test', 'spec', 'assertion', 'verification'],
  ['encrypt', 'cipher', 'encode', 'protect'],
  ['authenticate', 'login', 'signin', 'verify'],
  ['container', 'docker', 'pod', 'instance'],
  ['cache', 'memoize', 'buffer', 'store'],
  ['tree', 'hierarchy', 'branch'],
  ['graph', 'network', 'mesh', 'topology'],
  ['sort', 'order', 'rank', 'arrange'],
  ['parse', 'tokenize', 'analyze', 'extract'],
  ['refactor', 'restructure', 'rewrite', 'improve'],
  ['config', 'configuration', 'settings', 'options', 'preferences'],
]

// ── Word Sense Disambiguation ──

/** Polysemous terms and their senses keyed by domain context words. */
const WORD_SENSES: Record<string, Record<string, string>> = {
  class: {
    programming: 'a blueprint for creating objects with shared methods and properties',
    web: 'a CSS class name used for styling HTML elements',
    general: 'a category or grouping of related items',
  },
  object: {
    programming: 'an instance of a class containing state and behavior',
    database: 'a stored entity or record in a data store',
    general: 'a discrete item or entity',
  },
  key: {
    database: 'a column or field used to uniquely identify a record',
    security: 'a cryptographic value used for encryption or authentication',
    data_structures: 'the lookup identifier in a key-value pair',
    general: 'a critical or essential element',
  },
  tree: {
    data_structures: 'a hierarchical data structure with nodes and edges',
    algorithms: 'a graph-based structure used in search and traversal algorithms',
    devops: 'a file system directory tree or project structure',
    general: 'a branching hierarchical organization',
  },
  port: {
    networking: 'a numbered endpoint for network communication (e.g. TCP port 80)',
    programming: 'to adapt software to run on a different platform',
    general: 'a connection point or interface',
  },
  node: {
    web: 'Node.js — a JavaScript runtime for server-side execution',
    data_structures: 'an element in a linked list, tree, or graph',
    networking: 'a device or endpoint in a network topology',
    general: 'a connection point in a system',
  },
  table: {
    database: 'a structured collection of rows and columns in a database',
    web: 'an HTML table element for tabular display',
    data_structures: 'a lookup table or hash table structure',
  },
  index: {
    database: 'a data structure that speeds up row lookup in a table',
    data_structures: 'a positional reference into an array or list',
    web: 'the main entry page of a website (index.html)',
    general: 'a reference or pointer to a specific location',
  },
  model: {
    ai_ml: 'a trained machine learning model that makes predictions',
    database: 'a data model or ORM entity representing a database table',
    programming: 'a representation of domain logic in MVC architecture',
  },
  token: {
    security: 'a credential string used for authentication (JWT, OAuth)',
    programming: 'a lexical unit produced by a tokenizer or parser',
    ai_ml: 'a sub-word unit used in language model processing',
  },
  branch: {
    devops: 'a parallel line of development in version control (git branch)',
    data_structures: 'a path from a node in a tree data structure',
    algorithms: 'a conditional execution path in code',
  },
  pipeline: {
    devops: 'a CI/CD automation workflow for build, test, and deploy',
    ai_ml: 'a sequence of data processing stages in machine learning',
    programming: 'a chain of processing operations applied sequentially',
  },
  hash: {
    security: 'a one-way cryptographic digest for password storage',
    data_structures: 'a computed index for hash table bucket placement',
    algorithms: 'a function that maps data to fixed-size values',
  },
  merge: {
    devops: 'combining git branches into a single branch',
    algorithms: 'the merge step in merge sort or combining sorted sequences',
    data_structures: 'combining two data structures into one',
  },
  layer: {
    ai_ml: 'a processing stage in a neural network (dense, conv, attention)',
    networking: 'a level in the OSI or TCP/IP network model',
    architecture: 'a tier in application architecture (presentation, logic, data)',
  },
}

// ── Helpers ──

/** Tokenize text into lowercase words, filtering stop words. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
}

/** Extract character trigrams from a word. */
function charTrigrams(word: string): string[] {
  const padded = `_${word}_`
  const trigrams: string[] = []
  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.push(padded.slice(i, i + 3))
  }
  return trigrams
}

/** Simple deterministic hash for a string → integer. */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return h
}

/** Normalize a vector to unit length in-place. Returns the same array. */
function normalizeVector(vec: number[]): number[] {
  let mag = 0
  for (let i = 0; i < vec.length; i++) {
    mag += vec[i] * vec[i]
  }
  mag = Math.sqrt(mag)
  if (mag > 0) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] /= mag
    }
  }
  return vec
}

/** Compute cosine similarity between two dense vectors. Returns 0–1 (clamped). */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return Math.max(0, Math.min(1, dot / denom))
}

// ── SemanticEngine Class ──

/**
 * Local semantic embedding engine.
 *
 * Converts text into dense 50-dimensional vectors using pre-built word vectors
 * organized around concept clusters, then uses cosine similarity for ranking.
 *
 * @example
 * ```ts
 * const engine = new SemanticEngine()
 * const score = engine.similarity('sort an array', 'order a list')
 * // ~0.85+ (high similarity)
 *
 * const docs = [
 *   { id: '1', text: 'How to query a SQL database' },
 *   { id: '2', text: 'React component lifecycle' },
 * ]
 * const results = engine.findSimilar('database query optimization', docs)
 * // [{ id: '1', score: 0.9, text: '...' }]
 * ```
 */
export class SemanticEngine {
  private readonly config: SemanticConfig
  private readonly wordVectors: Map<string, number[]> = new Map()
  private readonly idfCache: Map<string, number> = new Map()

  constructor(config?: Partial<SemanticConfig>) {
    this.config = {
      dimensions: config?.dimensions ?? DEFAULT_DIMENSIONS,
      minSimilarity: config?.minSimilarity ?? DEFAULT_MIN_SIMILARITY,
    }
    this.buildWordVectors()
  }

  // ── Vector Construction ──

  /** Build all word vectors from the vocabulary definitions. */
  private buildWordVectors(): void {
    for (const [word, memberships] of Object.entries(VOCABULARY)) {
      this.wordVectors.set(word, this.compositeVector(memberships))
    }
  }

  /** Compose a vector from weighted cluster memberships. */
  private compositeVector(memberships: WordDef): number[] {
    const vec = new Array<number>(this.config.dimensions).fill(0)

    for (const [clusterName, strength] of memberships) {
      const ci = CLUSTER_INDEX.get(clusterName)
      if (ci === undefined) continue
      const cluster = CLUSTERS[ci]

      for (const dim of cluster.dims) {
        if (dim < this.config.dimensions) {
          // Primary activation: strong signal on cluster dims
          vec[dim] += strength * cluster.weight * 0.8
        }
      }

      // Small cross-cluster bleed for richer representations
      const bleedDim = (cluster.dims[0] + 7) % this.config.dimensions
      vec[bleedDim] += strength * 0.15
    }

    return normalizeVector(vec)
  }

  /** Generate a vector for an unknown word via character trigram hashing. */
  private trigramVector(word: string): number[] {
    const vec = new Array<number>(this.config.dimensions).fill(0)
    const trigrams = charTrigrams(word.toLowerCase())

    for (const tri of trigrams) {
      const h = hashString(tri)
      // Distribute trigram across multiple dimensions
      const dim1 = Math.abs(h) % this.config.dimensions
      const dim2 = Math.abs(h * 31) % this.config.dimensions
      const dim3 = Math.abs(h * 127) % this.config.dimensions
      vec[dim1] += 0.3
      vec[dim2] += 0.2
      vec[dim3] += 0.1
    }

    return normalizeVector(vec)
  }

  /** Get the vector for a word, falling back to trigram hashing. */
  private getWordVector(word: string): number[] {
    const cached = this.wordVectors.get(word)
    if (cached) return cached

    // Try lowercase
    const lower = word.toLowerCase()
    const lowerCached = this.wordVectors.get(lower)
    if (lowerCached) return lowerCached

    // Trigram fallback for unknown words
    const triVec = this.trigramVector(lower)
    this.wordVectors.set(lower, triVec)
    return triVec
  }

  // ── IDF Computation ──

  /** Compute IDF weight for a word given a pseudo document frequency. */
  private computeIdf(word: string, tokens: string[]): number {
    // Use a simple heuristic: IDF based on word frequency in the token set
    // Words that appear many times get lower IDF; rare words get higher IDF
    let count = 0
    for (const t of tokens) {
      if (t === word) count++
    }
    const totalTokens = tokens.length || 1
    // Smoothed IDF-like weight: more frequent in local text → lower weight
    return Math.log((totalTokens + 1) / (count + 1)) + 1
  }

  // ── Public API ──

  /**
   * Convert text to a dense embedding vector.
   *
   * Uses IDF-weighted averaging of word vectors. Unknown words are handled
   * via character trigram fallback. The result is normalized to unit length.
   */
  embed(text: string): number[] {
    const tokens = tokenize(text)
    if (tokens.length === 0) {
      return new Array<number>(this.config.dimensions).fill(0)
    }

    const vec = new Array<number>(this.config.dimensions).fill(0)
    let totalWeight = 0

    for (const token of tokens) {
      const wordVec = this.getWordVector(token)
      const idf = this.computeIdf(token, tokens)

      for (let d = 0; d < this.config.dimensions; d++) {
        vec[d] += wordVec[d] * idf
      }
      totalWeight += idf
    }

    // Weighted average
    if (totalWeight > 0) {
      for (let d = 0; d < this.config.dimensions; d++) {
        vec[d] /= totalWeight
      }
    }

    return normalizeVector(vec)
  }

  /** Compute cosine similarity between two texts. Returns 0–1. */
  similarity(a: string, b: string): number {
    const vecA = this.embed(a)
    const vecB = this.embed(b)
    return cosineSimilarity(vecA, vecB)
  }

  /**
   * Find documents most similar to a query, ranked by cosine similarity.
   *
   * @param query The search query text.
   * @param documents The documents to search through.
   * @param limit Maximum number of results (default: 10).
   * @returns Similarity results above the configured minSimilarity threshold.
   */
  findSimilar(
    query: string,
    documents: SemanticDocument[],
    limit = 10,
  ): SimilarityResult[] {
    const queryVec = this.embed(query)
    const results: SimilarityResult[] = []

    for (const doc of documents) {
      const docVec = doc.embedding ?? this.embed(doc.text)
      const score = cosineSimilarity(queryVec, docVec)

      if (score >= this.config.minSimilarity) {
        results.push({ id: doc.id, score, text: doc.text })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  /**
   * Generate synonym-expanded query variants.
   *
   * For each word in the query that belongs to a synonym group, generates
   * alternative queries with that word replaced by each synonym.
   */
  expandQuery(query: string): string[] {
    const tokens = tokenize(query)
    const variants = new Set<string>([query.toLowerCase().trim()])

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      for (const group of SYNONYM_GROUPS) {
        if (!group.includes(token)) continue

        for (const synonym of group) {
          if (synonym === token) continue
          const expanded = [...tokens]
          expanded[i] = synonym
          variants.add(expanded.join(' '))
        }
      }
    }

    return Array.from(variants)
  }

  /**
   * Disambiguate a polysemous word given surrounding context.
   *
   * Analyzes context tokens to determine which concept cluster is most
   * relevant, then returns the appropriate word sense definition.
   */
  disambiguate(word: string, context: string): string {
    const lower = word.toLowerCase()
    const senses = WORD_SENSES[lower]
    if (!senses) return `${lower}: general-purpose term`

    const contextTokens = tokenize(context)

    // Score each sense by how many context words belong to its cluster
    let bestSense = 'general'
    let bestScore = -1

    for (const senseName of Object.keys(senses)) {
      let score = 0
      for (const ct of contextTokens) {
        const memberships = VOCABULARY[ct]
        if (!memberships) continue
        for (const [cluster, strength] of memberships) {
          if (cluster === senseName) {
            score += strength
          }
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestSense = senseName
      }
    }

    return senses[bestSense] ?? senses['general'] ?? `${lower}: context-dependent term`
  }

  /** Return the number of words in the vocabulary. */
  getVocabularySize(): number {
    return this.wordVectors.size
  }

  /** Add a custom word with a pre-computed vector to the vocabulary. */
  addWord(word: string, vector: number[]): void {
    const normalized = normalizeVector([...vector])
    this.wordVectors.set(word.toLowerCase(), normalized)
  }
}
