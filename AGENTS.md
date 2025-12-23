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

# MCP OpenAPI Query Server - Quick Reference

> This project uses **OpenSpec** for spec-driven development.
>
> **Primary documentation**: See `openspec/AGENTS.md` for full instructions.

## Quick Start

| Command | Purpose |
|---------|---------|
| `openspec list` | List active changes |
| `openspec list --specs` | List all capabilities |
| `openspec show <item>` | View change or spec details |
| `openspec validate <id> --strict` | Validate a change |
| `openspec archive <change-id>` | Archive a completed change |

## Project Context

- **Purpose**: MCP server for querying OpenAPI/Swagger documents
- **Package manager**: pnpm (enforced)
- **Tech stack**: TypeScript, Node.js, MCP SDK, swagger-parser
- **Capabilities**: mcp-server, openapi-loader, openapi-parser, mcp-tools

## Key Files

| File | Purpose |
|------|---------|
| `openspec/project.md` | Project conventions and context |
| `openspec/AGENTS.md` | OpenSpec instructions for AI |
| `Claude.md` | Project entry point |
| `openspec/specs/*/spec.md` | Capability requirements |
| `openspec/specs/*/design.md` | Technical decisions |

## When to Use OpenSpec

**Create a change proposal** when:
- Adding features or functionality
- Making breaking changes
- Changing architecture
- Optimizing performance (behavioral changes)
- Updating security patterns

**Skip proposal** for:
- Bug fixes (restoring intended behavior)
- Typos, formatting, comments
- Non-breaking dependency updates
- Configuration changes
- Tests for existing behavior

## Legacy Documents

Historical waterfall model documentation is archived in `docs/archive/legacy/`.
