# Usage Guide

## Quick Start

```typescript
import { generate, validate } from 'thatssoc4';
import type { Model } from 'thatssoc4';

// Define your architecture
const model: Model = {
  actors: [
    {
      id: 'platformTeam',
      title: 'Platform Team',
      description: 'Core infrastructure team',
      tag: 'team',
      slack_channel: '#platform',
      owns: ['backend']  // Teams own systems
    }
  ],
  systems: [
    {
      id: 'backend',
      title: 'Backend Services',
      description: 'Core backend services',
      tags: ['critical'],
      containers: [
        {
          id: 'api',
          title: 'API Gateway',
          description: 'GraphQL API',
          technology: 'Apollo Server',
          git_url: 'https://github.com/org/api',  // Required!
          relationships: [
            {
              to_id: 'database',
              label: 'stores data in',
              technology: 'PostgreSQL'
            }
          ]
        },
        {
          id: 'database',
          title: 'Database',
          description: 'Primary database',
          technology: 'PostgreSQL',
          git_url: 'https://github.com/org/migrations',
          shape: 'storage'
        }
      ]
    }
  ]
};

// Validate before generating
const validation = validate(model);
if (!validation.valid) {
  console.error('Validation errors:', validation.violations);
  process.exit(1);
}

// Generate LikeC4 DSL
const dsl = generate(model);

// Save to file for use with @likec4 tools
import { writeFileSync } from 'fs';
writeFileSync('./architecture.c4', dsl);
```

## Using with @likec4 Tools

### With LikeC4 CLI

```bash
# Install LikeC4 CLI
npm install -g @likec4/cli

# Preview your architecture
likec4 preview ./architecture.c4

# Build static site
likec4 build ./architecture.c4 -o dist/

# Export diagrams
likec4 export ./architecture.c4 -o diagrams/
```

### With VS Code Extension

1. Install the [LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)
2. Open your generated `.c4` file
3. Get live preview, syntax highlighting, and validation

## Element Types

### Actor

```typescript
{
  id: 'customer',
  title: 'Customer',
  description: 'End user',
  tag: 'customer',  // customer | internal | vendor | bot | team
}
```

Team actors must specify `slack_channel` and can own systems:

```typescript
{
  id: 'platformTeam',
  title: 'Platform Team',
  description: 'Infrastructure team',
  tag: 'team',
  slack_channel: '#platform',
  owns: ['backend', 'frontend']  // Systems this team owns
}
```

### System

```typescript
{
  id: 'backend',
  title: 'Backend Services',
  description: 'Core services',
  tags: ['critical'],  // external | deprecated | planned | critical
  links: [
    { url: 'https://wiki.example.com/backend', type: 'wiki' },
    { url: 'https://runbook.example.com/backend', type: 'runbook' }
  ],
  containers: [...]  // Nested containers
}
```

### Container

```typescript
{
  id: 'api',
  title: 'API Gateway',
  description: 'GraphQL API',
  technology: 'Apollo Server',  // Required!
  git_url: 'https://github.com/org/api',  // Required!
  shape: 'browser',  // Optional: rectangle | storage | queue | browser | mobile
  tags: ['critical'],  // deprecated | planned | critical
  links: [
    { url: 'https://ci.example.com/api', type: 'ci_pipeline' },
    { url: 'https://runbook.example.com/api', type: 'runbook' }
  ],
  components: [...],  // Nested components
  relationships: [...] // To other containers
}
```

### Component

```typescript
{
  id: 'authModule',
  title: 'Authentication Module',
  description: 'Handles auth',
  technology: 'Passport.js',  // Required!
  tags: ['deprecated'],  // deprecated | planned
  relationships: [
    {
      to_id: 'userRepository',  // Must be sibling component!
      label: 'uses',
      technology: 'in-process'
    }
  ]
}
```

## Relationships

### Dependency Direction

Arrows point **toward** what you depend on:

```typescript
// ✅ Correct - frontend depends on backend
{
  to_id: 'backend',
  label: 'fetches data from',
  technology: 'GraphQL'
}

// ❌ Wrong - don't model reverse awareness
{
  to_id: 'frontend',
  label: 'serves data to',
  technology: 'GraphQL'
}
```

### Level Rules

- **System relationships** → Can only target other systems
- **Container relationships** → Can target any container (cross-system allowed)
- **Component relationships** → Can only target sibling components (same container)

### Async Relationships

```typescript
{
  to_id: 'eventBus',
  label: 'publishes events to',
  technology: 'Kafka',
  is_async: true  // Adds #async tag
}
```

## Ownership

Every non-external system **must** have exactly one owning team:

```typescript
// Define teams
{
  id: 'platformTeam',
  tag: 'team',
  slack_channel: '#platform',
  owns: ['backend', 'infrastructure']
}

// External systems don't need owners
{
  id: 'paymentGateway',
  title: 'Payment Gateway',
  description: 'Third-party payment processor',
  tags: ['external']  // No owner required
}
```

## Validation

```typescript
import { validate, formatViolations } from 'thatssoc4';

const result = validate(model);

if (!result.valid) {
  console.error(formatViolations(result.violations));
  /* Output:
   * Found 2 violation(s):
   *
   *   [unowned-system] frontend
   *     System 'frontend' has no owner. Every non-external system must
   *     be owned by exactly one team.
   *
   *   [component-cross-container] backend.api.authModule
   *     Component 'authModule' references 'userService.repository' which
   *     is outside its container. Cross-container dependencies must be
   *     modelled at the container level.
   */
}
```

## Complete Example

See [`examples/simple-model.ts`](../examples/simple-model.ts) for a complete working example.

## Integration with @likec4/core

See [INTEGRATION.md](../docs/INTEGRATION.md) for details on how thatssoc4 integrates with the @likec4 ecosystem.
