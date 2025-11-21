# n8n Monorepo Package Summary

This document provides a comprehensive overview of all packages in the n8n monorepo.

## Core Packages

### n8n-workflow (`packages/workflow`)
Foundational workflow base code and types. Defines workflow structure, expressions, node types, and execution context.

### n8n-core (`packages/core`)
Core workflow execution engine. Handles credential management, node registration, authentication, and provides CLI tools for static files, translations, and metadata generation.

### n8n (CLI) (`packages/cli`)
Express server, REST API, and CLI commands. Features multi-database support (SQLite/PostgreSQL/MySQL), authentication (JWT, SAML, LDAP, OpenID), webhooks, and workflow storage.

### n8n-nodes-base (`packages/nodes-base`)
400+ built-in integration nodes covering databases, cloud services, CRM, communication, project management, and more.

---

## Backend Infrastructure

| Package | Purpose |
|---------|---------|
| `@n8n/api-types` | Shared TypeScript interfaces for frontend/backend |
| `@n8n/config` | Centralized configuration management |
| `@n8n/db` | Database access layer and migrations (TypeORM) |
| `@n8n/backend-common` | Shared backend utilities and Winston logging |
| `@n8n/backend-test-utils` | Testing utilities and mocks |
| `@n8n/decorators` | TypeScript decorators for route handling |
| `@n8n/di` | Dependency Injection container |
| `@n8n/errors` | Standardized error classes |
| `@n8n/permissions` | Permission and access control schemas |
| `@n8n/constants` | Global constants |

---

## AI/ML Packages

### @n8n/n8n-nodes-langchain (`packages/@n8n/nodes-langchain`)
100+ LangChain-based AI nodes including:
- Multiple LLM providers (OpenAI, Anthropic, Cohere, Ollama, Mistral)
- Vector databases (Pinecone, Weaviate, Milvus, Qdrant)
- Agents, chains, embeddings, memory, retrievers, tools

### @n8n/ai-workflow-builder (`packages/@n8n/ai-workflow-builder.ee`)
Enterprise AI workflow builder using LangGraph for AI-powered workflow generation.

### @n8n/task-runner (`packages/@n8n/task-runner`)
Standalone task execution runtime with worker process management.

---

## Frontend Packages

### n8n-editor-ui (`packages/frontend/editor-ui`)
Main Vue 3 workflow editor application with Vue Flow for node graph visualization, CodeMirror for code editing, and Pinia for state management.

| Package | Purpose |
|---------|---------|
| `@n8n/design-system` | Vue component library with TailwindCSS and Storybook |
| `@n8n/i18n` | Internationalization support |
| `@n8n/stores` | Pinia state management stores |
| `@n8n/composables` | Reusable Vue composition functions |
| `@n8n/chat` | Chat interface components |
| `@n8n/rest-api-client` | Typed REST API client |

---

## Development & Configuration

| Package | Purpose |
|---------|---------|
| `@n8n/typescript-config` | Shared TypeScript configuration |
| `@n8n/eslint-config` | Shared ESLint configuration (base, frontend, node) |
| `@n8n/stylelint-config` | Shared Stylelint configuration |
| `@n8n/vitest-config` | Shared Vitest configuration |
| `@n8n/utils` | General utility functions |
| `@n8n/json-schema-to-zod` | JSON Schema to Zod conversion |

---

## Specialized Packages

| Package | Purpose |
|---------|---------|
| `@n8n/client-oauth2` | OAuth 2.0 client implementation |
| `@n8n/codemirror-lang` | CodeMirror language support for n8n expressions |
| `@n8n/codemirror-lang-sql` | SQL language support for CodeMirror |
| `@n8n/imap` | IMAP email protocol implementation |
| `@n8n/extension-sdk` | SDK for building n8n extensions |

---

## Node Development Tools

| Package | CLI Command | Purpose |
|---------|-------------|---------|
| `n8n-node-dev` | `n8n-node-dev` | CLI for simplifying node development |
| `@n8n/node-cli` | `n8n-node` | Official CLI for community nodes |
| `@n8n/create-node` | `create-node` | Quick start for new community nodes |

---

## Quality & Analysis

| Package | Purpose |
|---------|---------|
| `@n8n/scan-community-package` | Static code analyzer for community packages |
| `@n8n/eslint-plugin-community-nodes` | ESLint plugin with n8n-specific rules |
| `@n8n/n8n-benchmark` | Performance benchmarking CLI |

---

## Testing Infrastructure

- **`packages/testing/playwright`** - E2E testing with Playwright
- **`packages/testing/containers`** - Docker container setup for testing

---

## Extensions

- **`packages/extensions/insights`** - n8n Insights extension for analytics

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Node.js, Express, TypeScript, TypeORM |
| Frontend | Vue 3, Vite, Pinia, Element Plus |
| Testing | Jest, Vitest, Playwright |
| Code Quality | Biome, ESLint, Stylelint |
| AI/ML | LangChain, OpenAI, multiple LLM providers |
| Build | pnpm workspaces, Turbo |
