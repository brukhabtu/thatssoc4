/**
 * Model schema definitions.
 *
 * The complete model contains actors and systems.
 */

import { z } from 'zod';
import { ActorSchema } from './actor.js';
import { SystemSchema } from './system.js';

/**
 * Complete model schema.
 *
 * A model consists of:
 * - actors (people, teams, external systems)
 * - systems (high-level groupings)
 *
 * Containers are nested within systems.
 * Components are nested within containers.
 */
export const ModelSchema = z.object({
  actors: z.array(ActorSchema),
  systems: z.array(SystemSchema),
});

export type Model = z.infer<typeof ModelSchema>;
