/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Recovery & State Checkpointing                                        ║
 * ║                                                                              ║
 * ║  Barrel exports for the recovery module:                                     ║
 * ║    • types       – Checkpoint, RecoveryPolicy, GracefulDegradation, etc.     ║
 * ║    • checkpoint  – MemoryCheckpointStore, CheckpointManager                  ║
 * ║    • degradation – ServiceRegistry                                           ║
 * ║    • deadLetter  – DeadLetterQueue                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export * from './types.js'
export * from './checkpoint.js'
export * from './degradation.js'
export * from './deadLetter.js'
