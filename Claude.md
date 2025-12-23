<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# MCP OpenAPI Query Server

> **Project entry point for AI assistants**
>
> This project is managed using OpenSpec. See `openspec/AGENTS.md` for spec-driven development guidelines.

## Quick Start

1. **Read project context**: `openspec/project.md`
2. **List current changes**: `openspec list`
3. **List capabilities**: `openspec list --specs`
4. **Explore the codebase**: Use `Task` tool with `Explore` agent for codebase questions

## Project Overview

**Purpose**: Develop an MCP (Model Context Protocol) server for loading and querying OpenAPI/Swagger documents, enabling AI models to understand and search API definitions.

**Tech Stack**:
- TypeScript 5.9.3
- Node.js >=18.0.0
- pnpm >=9.0.0 (enforced via preinstall hook)
- @modelcontextprotocol/sdk ^1.25.1
- @apidevtools/swagger-parser ^12.1.0

**Package Manager**: pnpm (required - npm/yarn commands are blocked)

**Quick Commands**:
```bash
pnpm install    # Install dependencies
pnpm build      # Build TypeScript
pnpm test       # Run unit tests
pnpm test:integration  # Run integration tests
pnpm start      # Start server
```

## Current Status

**Completed** (Phases 1-4):
- ✅ Requirements analysis
- ✅ System design (4-layer architecture)
- ✅ Implementation (6 MCP tools, loader, parser, server)
- ✅ Testing (68 unit tests, 21 integration tests)

**Current Phase**: Phase 5 - Manual testing and bug fixes

See `openspec/changes/archive/` for historical changes.

## Capabilities

The server provides 4 core capabilities (see `openspec/specs/`):

1. **mcp-server** - MCP protocol server (stdio, tool registry, routing)
2. **openapi-loader** - OpenAPI document loading (local/HTTP, JSON/YAML)
3. **openapi-parser** - Document parsing, indexing, and queries
4. **mcp-tools** - 6 query tools (get_api_info, list_endpoints, search_endpoints, get_endpoint_details, list_schemas, get_schema_details)

## OpenSpec Structure

```
openspec/
├── project.md       # Project context and conventions
├── specs/           # Current capabilities (what IS built)
│   ├── mcp-server/
│   ├── openapi-loader/
│   ├── openapi-parser/
│   └── mcp-tools/
├── changes/         # Active proposals (what SHOULD change)
│   └── migrate-to-openspec/
└── AGENTS.md        # AI assistant instructions
```

## Important Reminders

- **Package manager**: pnpm only (npm/yarn blocked by preinstall hook)
- **OpenAPI versions**: Supports 2.0, 3.0.x, 3.1.x
- **Protocol**: MCP stdio

## Legacy Documentation

Historical waterfall model documents (PLAN.md, WORKFLOW.md, PROGRESS.md) have been archived to `docs/archive/legacy/` for reference.
