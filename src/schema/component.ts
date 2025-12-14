/**
 * Component schema definitions.
 *
 * Components are internal implementation details within containers.
 */

import { z } from 'zod';
import { ComponentRelationshipSchema } from './relationship.js';

/**
 * Allowed component tags.
 */
export const ComponentTagSchema = z.enum(['deprecated', 'planned']);

export type ComponentTag = z.infer<typeof ComponentTagSchema>;

/**
 * Component link types.
 */
export const ComponentLinkTypeSchema = z.enum(['documentation']);

export type ComponentLinkType = z.infer<typeof ComponentLinkTypeSchema>;

/**
 * Component link.
 */
export const ComponentLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: ComponentLinkTypeSchema,
});

export type ComponentLink = z.infer<typeof ComponentLinkSchema>;

/**
 * Component schema.
 *
 * Components must have:
 * - id, title, description, technology
 * - Can only relate to sibling components
 */
export const ComponentSchema = z.object({
  id: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/, 'Invalid id format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technology: z.string().min(1, 'Technology is required'),
  tags: z.array(ComponentTagSchema).optional(),
  links: z.array(ComponentLinkSchema).optional(),
  metadata: z.record(z.string()).optional(),
  relationships: z.array(ComponentRelationshipSchema).optional(),
});

export type Component = z.infer<typeof ComponentSchema>;
