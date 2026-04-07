/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Workflow Templates                                                          ║
 * ║                                                                              ║
 * ║  Pre-built workflow definitions for common automation scenarios:             ║
 * ║    • Code review pipeline                                                   ║
 * ║    • Deployment pipeline                                                    ║
 * ║    • Data processing pipeline                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { WorkflowDefinition } from './types.js'

/**
 * Creates a code review workflow that analyses a pull request:
 *  1. Fetch the diff
 *  2. Run a static analysis tool
 *  3. Request an LLM review
 *  4. Post a summary notification
 */
export function createCodeReviewWorkflow(): WorkflowDefinition {
  return {
    id: 'code-review',
    name: 'Code Review Pipeline',
    description: 'Automated code review: fetch diff → analyse → LLM review → notify',
    version: '1.0.0',
    variables: {
      repository: '',
      pullRequestId: '',
    },
    triggers: [
      { type: 'event', config: { event: 'pull_request.opened' } },
      { type: 'manual', config: {} },
    ],
    steps: [
      {
        id: 'fetch-diff',
        name: 'Fetch PR Diff',
        type: 'action',
        action: {
          type: 'tool_call',
          config: { tool: 'git_diff', repo: '{{repository}}', pr: '{{pullRequestId}}' },
        },
        dependencies: [],
      },
      {
        id: 'static-analysis',
        name: 'Run Static Analysis',
        type: 'action',
        action: {
          type: 'tool_call',
          config: { tool: 'eslint', target: '{{repository}}' },
        },
        timeout: 60_000,
        retries: 1,
        dependencies: ['fetch-diff'],
      },
      {
        id: 'llm-review',
        name: 'LLM Code Review',
        type: 'action',
        action: {
          type: 'llm_request',
          config: { prompt: 'Review the following diff:\n{{fetch-diff}}', model: 'default' },
        },
        timeout: 120_000,
        dependencies: ['fetch-diff'],
      },
      {
        id: 'post-review',
        name: 'Post Review Summary',
        type: 'action',
        action: {
          type: 'notify',
          config: {
            channel: 'pull_request',
            message: 'Review complete for PR {{pullRequestId}}',
          },
        },
        dependencies: ['static-analysis', 'llm-review'],
      },
    ],
  }
}

/**
 * Creates a deployment workflow:
 *  1. Run tests
 *  2. Build artefact
 *  3. Check readiness (condition)
 *  4. Deploy
 *  5. Post-deploy health check
 */
export function createDeploymentWorkflow(): WorkflowDefinition {
  return {
    id: 'deployment',
    name: 'Deployment Pipeline',
    description: 'Build, test, and deploy with health-check gates',
    version: '1.0.0',
    variables: {
      environment: 'staging',
      branch: 'main',
    },
    triggers: [
      { type: 'manual', config: {} },
      { type: 'webhook', config: { path: '/deploy' } },
    ],
    steps: [
      {
        id: 'run-tests',
        name: 'Run Test Suite',
        type: 'action',
        action: { type: 'tool_call', config: { tool: 'test_runner', branch: '{{branch}}' } },
        timeout: 300_000,
        retries: 2,
        dependencies: [],
      },
      {
        id: 'build',
        name: 'Build Artefact',
        type: 'action',
        action: { type: 'tool_call', config: { tool: 'build', branch: '{{branch}}' } },
        timeout: 180_000,
        dependencies: ['run-tests'],
      },
      {
        id: 'check-ready',
        name: 'Check Deploy Readiness',
        type: 'condition',
        condition: { field: 'environment', operator: 'neq', value: '' },
        dependencies: ['build'],
      },
      {
        id: 'deploy',
        name: 'Deploy to Environment',
        type: 'action',
        action: {
          type: 'http_request',
          config: { url: 'https://deploy.example.com/{{environment}}', method: 'POST' },
        },
        timeout: 120_000,
        dependencies: ['check-ready'],
      },
      {
        id: 'health-check',
        name: 'Post-Deploy Health Check',
        type: 'action',
        action: {
          type: 'http_request',
          config: { url: 'https://{{environment}}.example.com/health', method: 'GET' },
        },
        timeout: 30_000,
        retries: 3,
        dependencies: ['deploy'],
      },
    ],
  }
}

/**
 * Creates a data processing pipeline:
 *  1. Fetch data
 *  2. Validate
 *  3. Transform (parallel transforms)
 *  4. Aggregate
 *  5. Notify completion
 */
export function createDataPipelineWorkflow(): WorkflowDefinition {
  return {
    id: 'data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'Fetch → validate → transform → aggregate → notify',
    version: '1.0.0',
    variables: {
      sourceUrl: '',
      outputFormat: 'json',
    },
    triggers: [
      { type: 'schedule', config: { cron: '0 2 * * *' } },
      { type: 'manual', config: {} },
    ],
    steps: [
      {
        id: 'fetch-data',
        name: 'Fetch Source Data',
        type: 'action',
        action: {
          type: 'http_request',
          config: { url: '{{sourceUrl}}', method: 'GET' },
        },
        timeout: 60_000,
        retries: 2,
        dependencies: [],
      },
      {
        id: 'validate',
        name: 'Validate Data',
        type: 'condition',
        condition: { field: 'sourceUrl', operator: 'neq', value: '' },
        dependencies: ['fetch-data'],
      },
      {
        id: 'transform',
        name: 'Transform Data',
        type: 'action',
        action: {
          type: 'transform',
          config: { format: '{{outputFormat}}', source: '{{fetch-data}}' },
        },
        dependencies: ['validate'],
      },
      {
        id: 'aggregate',
        name: 'Aggregate Results',
        type: 'action',
        action: {
          type: 'transform',
          config: { operation: 'aggregate', input: '{{transform}}' },
        },
        dependencies: ['transform'],
      },
      {
        id: 'notify',
        name: 'Send Completion Notification',
        type: 'action',
        action: {
          type: 'notify',
          config: { channel: 'email', message: 'Data pipeline completed successfully' },
        },
        dependencies: ['aggregate'],
      },
    ],
  }
}
