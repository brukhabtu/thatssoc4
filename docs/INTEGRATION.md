# Integration with @likec4/core

thatssoc4 is built **on top of** @likec4/core, leveraging its robust type system and ecosystem while adding opinionated constraints for C4 methodology compliance.

## How thatssoc4 Uses @likec4/core

### 1. Type System

We use @likec4/core's element and relationship types as our foundation:

```typescript
import type { ElementKind, Tag } from '@likec4/core';

// Our constraints build on top of these types
const ALLOWED_ELEMENT_KINDS: ElementKind[] = ['actor', 'system', 'container', 'component'];
const ALLOWED_TAGS: Tag[] = ['customer', 'internal', 'vendor', 'bot', 'team', ...];
```

### 2. DSL Generation

thatssoc4 generates valid LikeC4 DSL that can be:
- Parsed by @likec4/core
- Used with the LikeC4 CLI
- Visualized in VS Code with the LikeC4 extension
- Integrated into CI/CD pipelines

```typescript
import { generate } from 'thatssoc4';

const dsl = generate(myModel);
// Write to .c4 file for use with @likec4/core tools
```

### 3. Model Validation

Future versions will use @likec4/core's parsing capabilities to validate existing `.c4` files:

```typescript
import { parse } from '@likec4/core';
import { validateConstraints } from 'thatssoc4';

// Parse existing .c4 file
const model = await parse('./architecture.c4');

// Apply our constraints
const violations = validateConstraints(model);
```

## Using thatssoc4 with @likec4 Ecosystem

### With LikeC4 CLI

1. Generate DSL with thatssoc4:
```typescript
import { generate } from 'thatssoc4';
import { writeFileSync } from 'fs';

const dsl = generate(myModel);
writeFileSync('./architecture/model.c4', dsl);
```

2. Use with LikeC4 CLI:
```bash
# Preview diagrams
likec4 preview ./architecture

# Build static site
likec4 build ./architecture -o dist

# Export to PNG/SVG
likec4 export ./architecture -o diagrams/
```

### With VS Code Extension

1. Generate `.c4` files using thatssoc4
2. Open in VS Code with LikeC4 extension installed
3. Get syntax highlighting, validation, and live preview

### With @likec4/core Directly

```typescript
import { Builder } from '@likec4/core/builder';
import { generate } from 'thatssoc4';

// Generate DSL from thatssoc4
const dsl = generate(myModel);

// Parse with @likec4/core for programmatic access
import { parseLikeC4 } from '@likec4/core';

const model = parseLikeC4(dsl);

// Use @likec4/core's model API
const backend = model.element('backend');
console.log(backend.incoming()); // Get relationships
console.log(backend.children());  // Get nested elements
```

## What thatssoc4 Adds

While @likec4/core provides the foundation, thatssoc4 adds:

### 1. **Opinionated Constraints**
- Only 4 element types (Actor, System, Container, Component)
- Strict relationship level rules
- Mandatory ownership tracking
- Required git_url for containers

### 2. **Type-Safe Input**
- Zod schemas for runtime validation
- TypeScript interfaces for compile-time safety
- Prevents invalid models before DSL generation

### 3. **Semantic Validation**
- Ownership coverage (every system has exactly one owner)
- Level-appropriate relationships (components can only relate to siblings)
- Tag constraints (deprecated, critical, external, etc.)
- Link requirements (repository for containers)

### 4. **C4 Methodology Compliance**
- Enforces Simon Brown's C4 levels
- Prevents common anti-patterns
- Maintains clear dependency direction
- Ensures documentation completeness

## Integration Example

```typescript
import { generate, validate } from 'thatssoc4';
import type { Model } from 'thatssoc4';

// Define your architecture using thatssoc4's typed schema
const model: Model = {
  actors: [
    {
      id: 'platformTeam',
      title: 'Platform Team',
      description: 'Infrastructure team',
      tag: 'team',
      slack_channel: '#platform',
      owns: ['backend']
    }
  ],
  systems: [
    {
      id: 'backend',
      title: 'Backend Services',
      description: 'Core services',
      containers: [
        {
          id: 'api',
          title: 'API',
          description: 'REST API',
          technology: 'Node.js',
          git_url: 'https://github.com/org/api'
        }
      ]
    }
  ]
};

// Validate with thatssoc4's constraints
const result = validate(model);
if (!result.valid) {
  console.error('Violations:', result.violations);
  process.exit(1);
}

// Generate LikeC4 DSL
const dsl = generate(model);

// Now use with @likec4 ecosystem:
// - Save to .c4 file
// - Use with CLI
// - Open in VS Code
// - Parse with @likec4/core for programmatic access
```

## Architecture Decision

We chose **DSL generation** over using Builder API directly because:

1. **Runtime Flexibility**: Builder API requires literal string IDs for type inference, which doesn't work with runtime data
2. **Ecosystem Compatibility**: DSL can be used across all @likec4 tools
3. **Human Readability**: Generated DSL can be version-controlled and reviewed
4. **Tool Chain Integration**: Works seamlessly with existing LikeC4 tooling

The generated DSL is fully compatible with @likec4/core's parser, so you get the best of both worlds: type-safe generation with opinionated constraints, and full @likec4 ecosystem integration.
