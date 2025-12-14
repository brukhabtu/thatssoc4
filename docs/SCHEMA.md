# Schema

This document defines the TypeScript interfaces and data structures used by thatssoc4. These live in `src/schema/` and are enforced at both compile-time (via TypeScript) and runtime (via Zod).

---

## Actor

```typescript
// src/schema/actor.ts

type ActorTag = 'customer' | 'internal' | 'vendor' | 'bot' | 'team';

interface Actor {
  id: string;
  title: string;
  description: string;
  tag?: ActorTag;
  
  // Required if tag === 'team'
  slack_channel?: string;
  
  // Only valid if tag === 'team'
  owns?: string[];  // System ids
}
```

---

## System

```typescript
// src/schema/system.ts

type SystemTag = 'external' | 'deprecated' | 'planned' | 'critical';

type SystemLinkType = 'wiki' | 'runbook';

interface SystemLink {
  url: string;
  type: SystemLinkType;
}

interface System {
  id: string;
  title: string;
  description: string;
  
  tags?: SystemTag[];
  links?: SystemLink[];
  metadata?: Record<string, string>;
  
  relationships?: SystemRelationship[];
  containers?: Container[];
}

interface SystemRelationship {
  to_id: string;      // Must be a system id
  label: string;
  technology: string;
  is_async?: boolean;
}
```

---

## Container

```typescript
// src/schema/container.ts

type ContainerTag = 'deprecated' | 'planned' | 'critical';

type ContainerShape = 'rectangle' | 'storage' | 'queue' | 'browser' | 'mobile';

type ContainerLinkType = 'ci_pipeline' | 'runbook';

interface ContainerLink {
  url: string;
  type: ContainerLinkType;
}

interface Container {
  id: string;
  title: string;
  description: string;
  technology: string;
  git_url: string;    // Required - repository link
  
  tags?: ContainerTag[];
  shape?: ContainerShape;
  links?: ContainerLink[];
  metadata?: Record<string, string>;
  
  relationships?: ContainerRelationship[];
  components?: Component[];
}

interface ContainerRelationship {
  to_id: string;      // Can be any container id (cross-system allowed)
  label: string;
  technology: string;
  is_async?: boolean;
}
```

---

## Component

```typescript
// src/schema/component.ts

type ComponentTag = 'deprecated' | 'planned';

type ComponentLinkType = 'documentation';

interface ComponentLink {
  url: string;
  type: ComponentLinkType;
}

interface Component {
  id: string;
  title: string;
  description: string;
  technology: string;
  
  tags?: ComponentTag[];
  links?: ComponentLink[];
  metadata?: Record<string, string>;
  
  relationships?: ComponentRelationship[];
}

interface ComponentRelationship {
  to_id: string;      // Must be a sibling component id (same container)
  label: string;
  technology: string;
  // Note: is_async not applicable at component level
}
```

---

## Relationship

```typescript
// src/schema/relationship.ts

interface BaseRelationship {
  to_id: string;
  label: string;
  technology: string;
}

interface AsyncRelationship extends BaseRelationship {
  is_async: true;
}

interface SyncRelationship extends BaseRelationship {
  is_async?: false;
}

type Relationship = AsyncRelationship | SyncRelationship;
```

---

## Complete Model

```typescript
// src/schema/model.ts

interface Model {
  actors: Actor[];
  systems: System[];
}
```

Note: Containers are nested within systems, and components are nested within containers. This enforces the hierarchy structurally.

---

## Example Input

```typescript
const model: Model = {
  actors: [
    {
      id: 'platformTeam',
      title: 'Platform Team',
      description: 'Core infrastructure and personalisation team',
      tag: 'team',
      slack_channel: '#platform-eng',
      owns: ['backend']
    },
    {
      id: 'clientTeam',
      title: 'Client Team',
      description: 'Mobile and web application team',
      tag: 'team',
      slack_channel: '#client-eng',
      owns: ['frontend']
    },
    {
      id: 'customer',
      title: 'Customer',
      description: 'End user placing bets on the platform',
      tag: 'customer'
    }
  ],
  
  systems: [
    {
      id: 'frontend',
      title: 'Frontend',
      description: 'Web and mobile betting applications',
      links: [
        { url: 'https://wiki.internal/frontend', type: 'wiki' }
      ],
      relationships: [
        {
          to_id: 'backend',
          label: 'fetches user and betting data',
          technology: 'GraphQL'
        }
      ]
    },
    {
      id: 'backend',
      title: 'Backend',
      description: 'Core platform services for betting operations',
      tags: ['critical'],
      links: [
        { url: 'https://wiki.internal/backend', type: 'wiki' },
        { url: 'https://runbooks.internal/backend', type: 'runbook' }
      ],
      relationships: [
        {
          to_id: 'paymentGateway',
          label: 'processes payments',
          technology: 'REST'
        }
      ],
      containers: [
        {
          id: 'apiGateway',
          title: 'API Gateway',
          description: 'Federated GraphQL gateway',
          technology: 'Apollo Router',
          git_url: 'https://github.com/org/api-gateway',
          links: [
            { url: 'https://ci.internal/api-gateway', type: 'ci_pipeline' }
          ],
          relationships: [
            {
              to_id: 'userService',
              label: 'routes user queries',
              technology: 'GraphQL Federation'
            }
          ]
        },
        {
          id: 'userService',
          title: 'User Service',
          description: 'Manages user accounts and authentication',
          technology: 'Node.js',
          git_url: 'https://github.com/org/user-service',
          relationships: [
            {
              to_id: 'database',
              label: 'stores user data',
              technology: 'PostgreSQL'
            }
          ],
          components: [
            {
              id: 'authModule',
              title: 'Auth Module',
              description: 'Handles authentication and token management',
              technology: 'Passport.js',
              relationships: [
                {
                  to_id: 'userRepository',
                  label: 'validates credentials',
                  technology: 'In-process'
                }
              ]
            },
            {
              id: 'userRepository',
              title: 'User Repository',
              description: 'Data access layer for user entities',
              technology: 'Knex.js'
            }
          ]
        },
        {
          id: 'database',
          title: 'Database',
          description: 'Primary relational data store',
          technology: 'PostgreSQL 15',
          git_url: 'https://github.com/org/db-migrations',
          shape: 'storage'
        },
        {
          id: 'eventBus',
          title: 'Event Bus',
          description: 'Async event streaming',
          technology: 'Kafka',
          git_url: 'https://github.com/org/kafka-config',
          shape: 'queue'
        }
      ]
    },
    {
      id: 'paymentGateway',
      title: 'Payment Gateway',
      description: 'Third-party payment processing',
      tags: ['external']
    }
  ]
};
```

---

## Validation Rules

The following validations are performed at runtime via Zod:

### Structural Validations

| Rule | Error |
|------|-------|
| All required fields present | `Required` |
| `id` matches pattern `[a-z][a-zA-Z0-9_]*` | `Invalid id format` |
| Tags from allowed set | `Invalid enum value` |
| Link types from allowed set | `Invalid enum value` |

### Conditional Validations

| Rule | Error |
|------|-------|
| `#team` actor has `slack_channel` | `slack_channel required for team actors` |
| Only `#team` actors have `owns` | `owns only valid for team actors` |

### Semantic Validations

These are handled by constraint functions in `src/constraints/`:

| Rule | Violation Code |
|------|----------------|
| `to_id` references existing element | `unknown-reference` |
| System relationships target systems | `system-to-non-system` |
| Container relationships target containers | `container-to-non-container` |
| Component relationships target siblings | `component-cross-container` |
| All relationships have `technology` | `relationship-missing-field` |
| Every system has exactly one owner | `unowned-system` / `multiple-owners` |
