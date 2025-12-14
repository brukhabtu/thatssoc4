# thatssoc4

A TypeScript toolkit for generating and validating LikeC4 architecture diagrams that adhere to Simon Brown's C4 methodology.

**Built on top of [@likec4/core](https://github.com/likec4/likec4)** - leveraging its ecosystem while adding opinionated constraints.

---

## Quick Start

```typescript
import { generate, validate } from 'thatssoc4';

// Define your architecture with type safety
const model = {
  actors: [
    {
      id: 'platformTeam',
      title: 'Platform Team',
      tag: 'team',
      slack_channel: '#platform',
      owns: ['backend']  // Ownership is explicit
    }
  ],
  systems: [
    {
      id: 'backend',
      title: 'Backend Services',
      tags: ['critical'],
      containers: [/* ... */]
    }
  ]
};

// Validate constraints
const result = validate(model);
if (!result.valid) {
  console.error(result.violations);
  process.exit(1);
}

// Generate LikeC4 DSL
const dsl = generate(model);

// Use with @likec4/core ecosystem:
// - LikeC4 CLI
// - VS Code extension
// - Programmatic model API
```

See [USAGE.md](USAGE.md) for complete guide.

---

## Why This Exists

Architecture documentation has a tendency to drift. Diagrams get out of sync, ownership becomes unclear, and the boundaries between systems blur over time. This toolkit addresses that by encoding architectural constraints directly into a type-safe system that can validate both new and existing models.

**Integration with @likec4/core**: We generate valid LikeC4 DSL that works seamlessly with the entire @likec4 ecosystem. Our role is constraint validation and enforcement - @likec4/core provides the foundation and tooling. See [docs/INTEGRATION.md](docs/INTEGRATION.md) for details.

---

## Philosophy

The constraints here aren't arbitrary - they emerged from thinking carefully about what makes architecture documentation actually useful:

- **Four element types only:** Actor, System, Container, Component. No proliferation of custom element kinds.
- **Tags for categorisation, not element types:** External systems, team ownership, lifecycle status - these are attributes, not fundamentally different things.
- **Relationships as dependencies:** Arrows point toward what you depend on. This keeps the mental model clean.
- **Ownership as a first-class relationship:** Teams own systems via `.owns`. Ownership should be visible in the diagram, not buried in metadata.
- **Level-appropriate detail:** Components can't reach outside their container. If they need to, that's a container-level concern.

---

## Project Structure

```
thatssoc4/
├── src/
│   ├── schema/                 # TypeScript interfaces
│   │   ├── actor.ts
│   │   ├── system.ts
│   │   ├── container.ts
│   │   ├── component.ts
│   │   └── relationship.ts
│   ├── constraints/            # Validation rules
│   │   ├── tags.ts
│   │   ├── links.ts
│   │   ├── relationships.ts
│   │   └── ownership.ts
│   ├── generator.ts            # DSL generation from typed input
│   └── validator.ts            # Validation of existing .c4 files
├── templates/                  # Jinja templates (reference implementation)
│   ├── base/
│   │   └── specification.j2
│   └── elements/
│       ├── actor.j2
│       ├── system.j2
│       ├── container.j2
│       └── component.j2
├── docs/
│   ├── ARCHITECTURE.md         # Implementation design
│   ├── CONSTRAINTS.md          # Rules and validation logic
│   └── SCHEMA.md               # Input data structures
└── package.json
```

---

## Core Capabilities

### Generation

Create LikeC4 models from typed TypeScript objects. The type system catches structural errors at compile time, while runtime validation enforces our semantic constraints.

### Validation

Parse existing `.c4` files using `@likec4/core` and validate them against our constraints. Integrate with CI/CD to catch violations before they land.

### Traversal

Leverage LikeC4's model API to query relationships, ownership, and dependencies programmatically.

---

## Element Summary

| Element | Required Fields | Required Links | Allowed Tags |
|---------|-----------------|----------------|--------------|
| Actor | id, title, description | - | customer, internal, vendor, bot, team |
| System | id, title, description | - | external, deprecated, planned, critical |
| Container | id, title, description, technology, git_url | repository | deprecated, planned, critical |
| Component | id, title, description, technology | - | deprecated, planned |

---

## Relationship Rules

### Dependencies

All relationships (except `.owns`) represent dependencies:

```
A -> B  means  "A depends on B"
```

**Never** model reverse awareness. If frontend calls backend, model it as:

```
frontend -> backend 'fetches data'
```

**Not** as:

```
backend -> frontend 'serves data to'
```

### Level Constraints

| From | Can Relate To |
|------|---------------|
| System | Any system |
| Container | Any container (cross-system allowed) |
| Component | Sibling components only |

### Ownership

Teams express ownership via the `.owns` relationship:

```likec4
platformTeam = actor 'Platform Team' {
  #team
  .owns backend
  .owns frontend
}
```

---

## Tags

### Actor Tags

| Tag | Use Case |
|-----|----------|
| `customer` | End users of the product |
| `internal` | Internal staff |
| `vendor` | Third-party providers |
| `bot` | Automated systems |
| `team` | Owning team (requires slack_channel) |

### Lifecycle Tags

| Tag | Applies To | Use Case |
|-----|------------|----------|
| `deprecated` | System, Container, Component | Being phased out |
| `planned` | System, Container, Component | Not yet built |

### Operational Tags

| Tag | Applies To | Use Case |
|-----|------------|----------|
| `external` | System | Outside organisational control |
| `critical` | System, Container | High business impact |

### Behaviour Tags

| Tag | Applies To | Use Case |
|-----|------------|----------|
| `async` | Relationship | Asynchronous communication |

---

## Examples

- **[examples/simple-model.ts](examples/simple-model.ts)** - Complete model definition
- **[examples/test-example.ts](examples/test-example.ts)** - Validation and DSL generation
- **[examples/integration-example.ts](examples/integration-example.ts)** - Full @likec4/core integration

Run examples:
```bash
npx tsx examples/test-example.ts
npx tsx examples/integration-example.ts
```

---

## Documentation

- **[USAGE.md](USAGE.md)** - Complete usage guide with examples
- **[docs/INTEGRATION.md](docs/INTEGRATION.md)** - @likec4/core integration details
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Implementation design
- [docs/CONSTRAINTS.md](docs/CONSTRAINTS.md) - Complete validation rules
- [docs/SCHEMA.md](docs/SCHEMA.md) - TypeScript interface reference

---

## Design Decisions

### Why TypeScript over pure Jinja?

Jinja templates can generate DSL, but they can't validate existing models. By building on `@likec4/core`, we get:

- **Bidirectional capability:** Generate new models and validate existing ones
- **Type safety:** Catch structural errors at compile time
- **Traversal:** Query the model programmatically for reporting, analysis, or integration
- **Ecosystem integration:** Works with LikeC4's CLI, MCP server, and Vite plugin

### Why no relationship kinds for protocols?

We considered defining relationship kinds like `rest`, `graphql`, `kafka`. Instead, we use:

- **`technology` field** for the protocol/implementation
- **`#async` tag** for the only meaningful visual distinction

The label does semantic work ("fetches user"), technology does implementation work ("GraphQL").

### Why can't components relate cross-container?

Components are internal implementation details. If component A needs to talk to something in container B, that's a container-level concern. This keeps component diagrams focused and prevents leaky abstractions.

### Why ownership as a relationship?

Embedding ownership as metadata (`owned_by: teamA`) hides a crucial piece of information. Making teams explicitly declare what they own via `.owns` makes ownership visible in diagrams and queryable in the model.

---

## Contributing

When extending this toolkit:

1. Maintain the four-level hierarchy
2. Use tags for categorisation, not new element types
3. Keep relationships as dependencies
4. Add constraint validation functions for new rules
5. Document changes in CONSTRAINTS.md and update TypeScript interfaces
