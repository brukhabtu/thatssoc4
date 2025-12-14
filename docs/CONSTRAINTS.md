# Constraints

This document defines the rules enforced by thatssoc4. These constraints are implemented as validation functions in `src/constraints/` and as type guards in `src/schema/`.

---

## Element Hierarchy

```
Actor
  └── (external to all systems)

System
  └── Container
        └── Component
```

---

## Tag Constraints

Tags are validated by `src/constraints/tags.ts`.

### Actor Tags

| Tag | Description |
|-----|-------------|
| `customer` | End user of the product |
| `internal` | Internal employee/staff |
| `vendor` | Third-party provider |
| `bot` | Automated system/service |
| `team` | Owning team (requires `slack_channel` metadata) |

**Rule:** An actor may have at most one tag.

---

### System Tags

| Tag | Description |
|-----|-------------|
| `external` | System outside organisational control |
| `deprecated` | Being phased out |
| `planned` | Not yet built |
| `critical` | High business impact |

---

### Container Tags

| Tag | Description |
|-----|-------------|
| `deprecated` | Being phased out |
| `planned` | Not yet built |
| `critical` | High business impact |

**Note:** Containers cannot be `external` - if a system is external, all its containers are external by inheritance.

---

### Component Tags

| Tag | Description |
|-----|-------------|
| `deprecated` | Being phased out |
| `planned` | Not yet built |

**Note:** Components cannot be `critical` - criticality applies at deployment boundaries (container level and above).

---

## Link Constraints

Links are validated by `src/constraints/links.ts`.

### System Links

| Type | Required | Description |
|------|:--------:|-------------|
| `wiki` | No | Documentation wiki link |
| `runbook` | No | Operational runbook |

---

### Container Links

| Type | Required | Description |
|------|:--------:|-------------|
| `repository` | **Yes** | Git repository URL |
| `ci_pipeline` | No | CI/CD pipeline link |
| `runbook` | No | Operational runbook |

---

### Component Links

| Type | Required | Description |
|------|:--------:|-------------|
| `documentation` | No | Technical documentation |

---

## Metadata Constraints

Metadata is validated by the Zod schemas in `src/schema/`.

### Actor (with #team tag)

| Field | Required | Description |
|-------|:--------:|-------------|
| `slack_channel` | **Yes** | Team's Slack channel |

---

### System, Container, Component

No required metadata. Optional key-value pairs allowed.

---

## Relationship Constraints

Relationships are validated by `src/constraints/relationships.ts`.

### Relationship Kinds

| Kind | Meaning | Valid From | Valid To |
|------|---------|------------|----------|
| (default) `->` | Dependency | Any element | Same-level element |
| `.owns` | Responsibility | `#team` actor | System |

---

### Dependency Direction

**Rule:** Relationships represent dependencies. Arrow points toward what you depend on.

**Violation:** `reverse-dependency`

**Valid:**
- `frontend -> backend` (frontend depends on backend)
- `backend -> database` (backend depends on database)

**Invalid:**
- `backend -> frontend` (backend shouldn't know about frontend)
- `database -> backend` (database shouldn't know about callers)

---

### Level Constraints

| From | Can Relate To | Violation Code |
|------|---------------|----------------|
| System | Any system | `system-to-non-system` |
| Container | Any container (including cross-system) | `container-to-non-container` |
| Component | **Sibling components only** (same container) | `component-cross-container` |

**Rule:** Components cannot reference elements outside their container. Cross-container dependencies must be modelled at the container level.

---

### Required Fields

**Violation:** `relationship-missing-field`

| Field | Required |
|-------|:--------:|
| `to_id` | ✅ |
| `label` | ✅ |
| `technology` | ✅ |
| `is_async` | No (default: false) |

---

## Ownership Constraints

Ownership is validated by `src/constraints/ownership.ts`.

### Rules

| Rule | Violation Code | Description |
|------|----------------|-------------|
| Team-only owns | `non-team-owns` | Only `#team` actors can use `.owns` relationship |
| Systems only | `owns-non-system` | `.owns` can only target systems |
| Complete coverage | `unowned-system` | Every system must have exactly one `.owns` pointing to it |
| Single owner | `multiple-owners` | A system cannot be owned by multiple teams |

---

## Required Fields Summary

These are enforced by Zod schemas in `src/schema/`.

### Actor

| Field | Required | Conditional |
|-------|:--------:|:-----------:|
| `id` | ✅ | |
| `title` | ✅ | |
| `description` | ✅ | |
| `slack_channel` | | If `#team` |

---

### System

| Field | Required |
|-------|:--------:|
| `id` | ✅ |
| `title` | ✅ |
| `description` | ✅ |

---

### Container

| Field | Required |
|-------|:--------:|
| `id` | ✅ |
| `title` | ✅ |
| `description` | ✅ |
| `technology` | ✅ |
| `git_url` | ✅ |

---

### Component

| Field | Required |
|-------|:--------:|
| `id` | ✅ |
| `title` | ✅ |
| `description` | ✅ |
| `technology` | ✅ |

---

### Relationship

| Field | Required |
|-------|:--------:|
| `to_id` | ✅ |
| `label` | ✅ |
| `technology` | ✅ |
| `is_async` | No (default: false) |

---

## Violation Output Format

All constraint violations follow this structure:

```typescript
{
  path: string;     // Fully qualified element path
  rule: string;     // Machine-readable violation code
  message: string;  // Human-readable explanation
}
```

Example:

```json
{
  "path": "backend.userService.authModule",
  "rule": "component-cross-container",
  "message": "Component 'authModule' references 'orderService.paymentHandler' which is outside its container. Cross-container dependencies must be modelled at the container level."
}
```
