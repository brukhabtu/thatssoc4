# @likec4/core Integration Summary

## Overview

**thatssoc4** is now properly positioned as a **constraint validation and DSL generation layer** built on top of @likec4/core, rather than reimplementing functionality.

## What We Use from @likec4/core

### 1. Type System Foundation
```typescript
import type { ElementKind, Tag, Fqn } from '@likec4/core';
import type { LikeC4Model, ElementModel, RelationshipModel } from '@likec4/core/model';
```

Our schemas reference these types, ensuring compatibility with the @likec4 ecosystem.

### 2. Builder API (for examples and documentation)
```typescript
import { Builder } from '@likec4/core/builder';

const model = Builder
  .specification({ ... })
  .model((m, compose) => { ... })
  .toLikeC4Model();
```

While the Builder API requires literal string IDs (incompatible with runtime data generation), we use it in our integration examples to demonstrate how users can work with @likec4/core.

### 3. Model API (for querying and analysis)
```typescript
// Query elements
model.element('backend')
model.elements()
model.relationships()

// Traverse hierarchy
element.children()
element.parent()
element.ancestors()

// Filter and analyze
elements.filter(el => el.tags?.includes('critical'))
```

Users can parse our generated DSL with @likec4/core and use these powerful APIs.

### 4. Ecosystem Integration

Our generated DSL works with:
- **@likec4/cli** - Preview, build, export diagrams
- **VS Code extension** - Live preview, syntax highlighting
- **@likec4/core parser** - Programmatic access to models

## What thatssoc4 Adds

### 1. Opinionated C4 Constraints

**Ownership Coverage**
```typescript
// ✅ Enforced: Every non-external system must have exactly one owner
{
  id: 'platformTeam',
  tag: 'team',
  owns: ['backend']  // Explicit ownership
}
```

**Level-Appropriate Relationships**
```typescript
// ✅ Components can only relate to siblings
{
  id: 'authModule',
  relationships: [
    { to_id: 'userRepository' }  // Same container ✓
  ]
}

// ❌ Violation: component-cross-container
{
  id: 'authModule',
  relationships: [
    { to_id: 'database' }  // Different container ✗
  ]
}
```

**Required Fields**
```typescript
// ✅ Containers must have git_url
{
  id: 'api',
  title: 'API Gateway',
  technology: 'Node.js',  // Required
  git_url: 'https://github.com/...'  // Required
}
```

### 2. Type-Safe Input Validation

**Compile-time + Runtime**
```typescript
import { Model } from 'thatssoc4';
import { validate } from 'thatssoc4';

// TypeScript catches structural errors
const model: Model = { ... };

// Zod catches runtime validation errors
const result = validate(model);
```

### 3. Semantic Validation

Beyond structure, we validate:
- Dependency direction (arrows point to dependencies)
- Tag constraints per element type
- Link requirements (repository for containers)
- Relationship technology specification

### 4. DSL Generation

**From runtime data to valid LikeC4 DSL**
```typescript
import { generate } from 'thatssoc4';

const dsl = generate(model);
// Produces valid LikeC4 DSL that can be:
// - Saved to .c4 files
// - Parsed by @likec4/core
// - Used with CLI and VS Code
// - Version controlled
```

## Integration Workflow

```
┌─────────────────────────────────────────────┐
│         Define Architecture Model            │
│         (TypeScript with thatssoc4)          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      Validate with thatssoc4 Constraints    │
│   - Ownership coverage                       │
│   - Level-appropriate relationships          │
│   - Required fields                          │
│   - Tag constraints                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Generate LikeC4 DSL                  │
│       (thatssoc4 generator)                  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Save to .c4 File                    │
└──────────────────┬──────────────────────────┘
                   │
                   ├──────────────┬──────────────┬───────────────┐
                   ▼              ▼              ▼               ▼
         ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────┐
         │ @likec4/cli │  │   VS Code   │  │  Parse   │  │   CI    │
         │   preview   │  │  Extension  │  │   with   │  │  /CD    │
         │    build    │  │             │  │  @likec4 │  │  Check  │
         │   export    │  │             │  │   /core  │  │         │
         └─────────────┘  └─────────────┘  └──────────┘  └─────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │ Use Model API  │
                                         │  - Query       │
                                         │  - Traverse    │
                                         │  - Analyze     │
                                         └────────────────┘
```

## Why This Approach?

### 1. **Complementary Roles**
- **@likec4/core**: Foundation, tooling, ecosystem
- **thatssoc4**: Constraints, validation, C4 compliance

### 2. **Best Tool for the Job**
- **DSL Generation** works better than Builder API for runtime data
- **Builder API** requires literal strings (great for hand-written code, not runtime)
- **Generated DSL** is human-readable, version-controllable, and universally compatible

### 3. **Full Ecosystem Access**
- Users get everything @likec4/core provides
- Plus opinionated constraints that enforce best practices
- No lock-in - generated DSL is standard LikeC4

## Example Integration

See [examples/integration-example.ts](../examples/integration-example.ts) for a complete demonstration showing:

1. Define model with thatssoc4 types
2. Validate with our constraints
3. Generate DSL
4. Build model with @likec4/core
5. Use model API for analysis

Run it:
```bash
npx tsx examples/integration-example.ts
```

## Key Takeaway

**thatssoc4** doesn't replace @likec4/core - it enhances it with:
- Type-safe input definitions
- Opinionated C4 methodology constraints
- Automatic DSL generation
- Semantic validation rules

The output integrates seamlessly with the entire @likec4 ecosystem.
