/**
 * Relationship schema definitions.
 *
 * Relationships represent dependencies between elements.
 * Arrow points toward what you depend on.
 */

import { z } from 'zod';

/**
 * Base relationship with required fields.
 */
export const BaseRelationshipSchema = z.object({
  to_id: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/, 'Invalid id format'),
  label: z.string().min(1, 'Label is required'),
  technology: z.string().min(1, 'Technology is required'),
});

/**
 * Async relationship with explicit async flag.
 */
export const AsyncRelationshipSchema = BaseRelationshipSchema.extend({
  is_async: z.literal(true),
});

/**
 * Sync relationship (default).
 */
export const SyncRelationshipSchema = BaseRelationshipSchema.extend({
  is_async: z.literal(false).optional(),
});

/**
 * Generic relationship (sync or async).
 */
export const RelationshipSchema = z.union([
  AsyncRelationshipSchema,
  SyncRelationshipSchema,
]);

export type BaseRelationship = z.infer<typeof BaseRelationshipSchema>;
export type AsyncRelationship = z.infer<typeof AsyncRelationshipSchema>;
export type SyncRelationship = z.infer<typeof SyncRelationshipSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;

/**
 * System-level relationship.
 * Can only target other systems.
 */
export const SystemRelationshipSchema = RelationshipSchema;
export type SystemRelationship = z.infer<typeof SystemRelationshipSchema>;

/**
 * Container-level relationship.
 * Can target any container (cross-system allowed).
 */
export const ContainerRelationshipSchema = RelationshipSchema;
export type ContainerRelationship = z.infer<typeof ContainerRelationshipSchema>;

/**
 * Component-level relationship.
 * Can only target sibling components (same container).
 * Note: is_async not applicable at component level.
 */
export const ComponentRelationshipSchema = BaseRelationshipSchema;
export type ComponentRelationship = z.infer<typeof ComponentRelationshipSchema>;
