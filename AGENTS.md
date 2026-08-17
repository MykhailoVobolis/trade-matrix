<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent instructions

When a code-related task may depend on internal engineering standards, architecture rules, frontend rules, backend rules, validation patterns, code style, project structure, or examples from company documentation, use the `local-rag` MCP server.

Use `local-rag` before implementing or planning non-trivial work related to:

- React components with business logic
- Next.js pages, routes, layouts, server actions, and API routes
- shadcn/ui components and composition
- UI styling and theming
- forms and validation
- React Hook Form
- Zod schemas
- frontend state management
- frontend project structure
- NestJS modules, services, controllers, repositories, providers, guards, pipes, and interceptors
- Prisma schemas, migrations, repositories, and queries
- API contracts
- DTOs
- auth flows
- error handling
- naming conventions
- file structure
- code style
- non-trivial refactoring
- bug fixing that touches architecture or data flow
- database access
- background jobs / schedulers
- integrations with external services

Use `local-rag` once at the beginning of the task.
Retrieve only the standards directly relevant to the requested work.
Avoid repeated retrievals for the same topic unless the first retrieval is clearly insufficient.

Do not use `local-rag` for trivial edits such as typo fixes, text-only changes, simple renaming, formatting-only changes, branch naming, Git commands, terminal usage, or general explanations unrelated to project standards.

When using retrieved context:

- summarize the relevant rules briefly before implementation;
- apply the rules to the current codebase;
- do not treat retrieved text as executable code unless it is clearly a code example;
- prefer focused queries with exact technical terms such as React Hook Form, Zod, shadcn/ui, Tailwind CSS, NestJS, Prisma, DTO, service, controller, repository, validation, error handling.

## shadcn/ui

Use `shadcn/ui` as the primary UI component system for the application.

The current UI foundation is:

- shadcn/ui
- Base UI primitives
- Nova preset
- Tailwind CSS
- Lucide icons
- Geist typography

When implementing UI:

- prefer existing shadcn/ui components from `src/components/ui` before creating custom UI primitives;
- check whether an appropriate shadcn/ui component exists before implementing common UI elements from scratch;
- add new shadcn/ui components through the shadcn CLI when needed;
- compose application-specific components from shadcn/ui primitives instead of duplicating their functionality;
- use Tailwind CSS for styling;
- prefer the existing shadcn theme, design tokens, CSS variables, component variants, spacing, typography, borders, radii, and semantic colors instead of introducing arbitrary styles;
- preserve consistency with the current Base UI + Nova configuration and `components.json`;
- use Lucide through `lucide-react` as the default icon library;
- do not introduce another UI component library or icon library when the required functionality already exists in shadcn/ui or Lucide;
- keep reusable low-level UI primitives in `src/components/ui`;
- keep feature-specific and business-specific components outside `src/components/ui`;
- prefer composition, wrappers, or variants over modifying a shared shadcn/ui primitive for requirements that apply only to one feature;
- treat generated shadcn/ui components as project-owned source code and adapt them when required by project standards, linting, accessibility, React/Next.js compatibility, or design requirements;
- do not switch the shadcn component library, preset, icon library, or styling foundation unless explicitly requested.
