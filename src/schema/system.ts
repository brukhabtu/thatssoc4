/**
 * System schema definitions.
 *
 * Systems are high-level groupings of functionality.
 */

import { z } from 'zod';
import { SystemRelationshipSchema } from './relationship.js';
import { ContainerSchema } from './container.js';

/**
 * Allowed system tags.
 */
export const SystemTagSchema = z.enum([
  'external',
  'deprecated',
  'planned',
  'critical',
]);

export type SystemTag = z.infer<typeof SystemTagSchema>;

/**
 * System link types.
 */
export const SystemLinkTypeSchema = z.enum(['wiki', 'runbook']);

export type SystemLinkType = z.infer<typeof SystemLinkTypeSchema>;

/**
 * System link.
 */
export const SystemLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: SystemLinkTypeSchema,
});

export type SystemLink = z.infer<typeof SystemLinkSchema>;

/**
 * System schema.
 *
 * Systems must have:
 * - id, title, description
 * - Can relate to other systems
 * - Can contain containers
 */
export const SystemSchema = z.object({
  id: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/, 'Invalid id format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(SystemTagSchema).optional(),
  links: z.array(SystemLinkSchema).optional(),
  metadata: z.record(z.string()).optional(),
  relationships: z.array(SystemRelationshipSchema).optional(),
  containers: z.array(ContainerSchema).optional(),
});

export type System = z.infer<typeof SystemSchema>;
