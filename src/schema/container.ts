/**
 * Container schema definitions.
 *
 * Containers are deployable units within systems.
 */

import { z } from 'zod';
import { ContainerRelationshipSchema } from './relationship.js';
import { ComponentSchema } from './component.js';

/**
 * Allowed container tags.
 */
export const ContainerTagSchema = z.enum(['deprecated', 'planned', 'critical']);

export type ContainerTag = z.infer<typeof ContainerTagSchema>;

/**
 * Container shapes for visual representation.
 */
export const ContainerShapeSchema = z.enum([
  'rectangle',
  'storage',
  'queue',
  'browser',
  'mobile',
]);

export type ContainerShape = z.infer<typeof ContainerShapeSchema>;

/**
 * Container link types.
 */
export const ContainerLinkTypeSchema = z.enum(['ci_pipeline', 'runbook']);

export type ContainerLinkType = z.infer<typeof ContainerLinkTypeSchema>;

/**
 * Container link.
 */
export const ContainerLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: ContainerLinkTypeSchema,
});

export type ContainerLink = z.infer<typeof ContainerLinkSchema>;

/**
 * Container schema.
 *
 * Containers must have:
 * - id, title, description, technology
 * - git_url (repository link is required)
 * - Can relate to any container (cross-system allowed)
 * - Can contain components
 */
export const ContainerSchema = z.object({
  id: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/, 'Invalid id format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technology: z.string().min(1, 'Technology is required'),
  git_url: z.string().url('Invalid git_url'),
  tags: z.array(ContainerTagSchema).optional(),
  shape: ContainerShapeSchema.optional(),
  links: z.array(ContainerLinkSchema).optional(),
  metadata: z.record(z.string()).optional(),
  relationships: z.array(ContainerRelationshipSchema).optional(),
  components: z.array(ComponentSchema).optional(),
});

export type Container = z.infer<typeof ContainerSchema>;
