# Architecture

This document outlines the implementation design for thatssoc4.

---

## Overview

The toolkit is built in TypeScript, leveraging `@likec4/core` for model parsing, traversal, and manipulation. We layer our opinionated constraints on top, providing both generation and validation capabilities.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@likec4/core` | Model parsing, traversal, Builder API |
| `zod` | Runtime schema validation |
| `typescript` | Type safety and interfaces |

---

## Module Structure

### `src/schema/`

TypeScript interfaces and Zod schemas defining the shape of our constrained model. These are stricter than what LikeC4 allows natively.

```
schema/
├── index.ts            # Re-exports all schemas
├── actor.ts            # Actor interface and allowed tags
├── system.ts           # System interface and allowed tags
├── container.ts        # Container interface with required fields
├── component.ts        # Component interface with sibling constraint
├── relationship.ts     # Relationship interface with technology requirement
└── model.ts            # Complete model composition
```

**Key design:**
- Each schema file exports both a TypeScript interface and a Zod schema
- Zod schemas enable runtime validation of input data
- Interfaces enable compile-time type checking

---

### `src/constraints/`

Pure functions that validate semantic rules that can't be expressed in the type system alone.

```
constraints/
├── index.ts            # Combines all constraint validators
├── tags.ts             # Validates allowed tags per element type
├── links.ts            # Validates required and allowed link types
├── relationships.ts    # Validates dependency direction and level constraints
└── ownership.ts        # Validates team ownership requirements
```

**Key design:**
- Each constraint function takes a model and returns a list of violations
- Violations include element path, rule name, and human-readable message
- Constraints are composable - run all or a subset

---

### `src/generator.ts`

Transforms typed input data into LikeC4 DSL strings.

**Responsibilities:**
- Accept validated schema objects
- Output properly formatted `.c4` content
- Handle nesting (containers within systems, components within containers)
- Apply correct relationship syntax (`.owns` vs `->`)

**Key design:**
- Uses template literals for DSL generation
- Indentation handled via helper functions
- Output is deterministic (same input = same output)

---

### `src/validator.ts`

Parses existing `.c4` files and validates them against our constraints.

**Responsibilities:**
- Use `@likec4/core` to parse DSL into model objects
- Transform LikeC4 model into our schema types
- Run constraint validators
- Report violations with file locations

**Key design:**
- Integrates with LikeC4's parsing pipeline
- Maps LikeC4's element/relationship types to our constrained types
- Produces structured output suitable for CI/CD integration

---

## Data Flow

### Generation Flow

```
Input (TypeScript objects)
    │
    ▼
┌─────────────────┐
│  Zod Validation │  ← Runtime schema check
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Constraints   │  ← Semantic rule validation
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Generator    │  ← DSL string generation
└─────────────────┘
    │
    ▼
Output (.c4 file content)
```

### Validation Flow

```
Input (.c4 file)
    │
    ▼
┌─────────────────┐
│ @likec4/core    │  ← Parse DSL to model
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Transform     │  ← Map to our schema types
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Constraints   │  ← Semantic rule validation
└─────────────────┘
    │
    ▼
Output (Violation report)
```

---

## Constraint Validation Design

Each constraint function follows a consistent signature:

```typescript
type Violation = {
  path: string;        // e.g., "backend.userService.authModule"
  rule: string;        // e.g., "component-sibling-only"
  message: string;     // Human-readable explanation
};

type ConstraintFn = (model: Model) => Violation[];
```

Constraints are combined via a runner:

```typescript
const allConstraints = [
  validateTags,
  validateLinks,
  validateRelationships,
  validateOwnership,
];

function validate(model: Model): Violation[] {
  return allConstraints.flatMap(fn => fn(model));
}
```

---

## Integration Points

### CLI Usage

```bash
# Validate existing files
likec4-toolkit validate ./architecture/**/*.c4

# Generate from YAML input
likec4-toolkit generate ./model.yaml -o ./architecture/
```

### Programmatic Usage

```typescript
import { validate, generate } from 'likec4-toolkit';
import { parse } from '@likec4/core';

// Validate existing model
const model = await parse('./architecture');
const violations = validate(model);

// Generate new model
const dsl = generate(myTypedInput);
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Validate architecture
  run: npx likec4-toolkit validate ./architecture/**/*.c4 --format json
```

---

## Error Handling

### Parse Errors

LikeC4 parse errors are passed through with file location information.

### Validation Errors

Our constraint violations include:
- **path:** Fully qualified element path
- **rule:** Machine-readable rule identifier
- **message:** Human-readable explanation with fix suggestion

### Generation Errors

Schema validation errors from Zod include:
- **path:** JSON path to invalid field
- **expected:** What was expected
- **received:** What was provided

---

## Extension Points

### Adding New Tags

1. Add tag to allowed list in `src/schema/{element}.ts`
2. Add styling in `templates/base/specification.j2`
3. Update CONSTRAINTS.md documentation

### Adding New Constraints

1. Create constraint function in `src/constraints/`
2. Add to constraint runner in `src/constraints/index.ts`
3. Add tests for new constraint
4. Update CONSTRAINTS.md documentation

### Supporting New Element Properties

1. Update interface in `src/schema/{element}.ts`
2. Update Zod schema in same file
3. Update generator to output new property
4. Update validator to check new property
5. Update SCHEMA.md documentation

---

## Testing Strategy

### Unit Tests

- Schema validation with valid/invalid inputs
- Individual constraint functions
- Generator output formatting

### Integration Tests

- Full generation pipeline
- Full validation pipeline
- Round-trip (generate then validate)

### Fixture Tests

- Known-good `.c4` files that should pass
- Known-bad `.c4` files with expected violations
