/**
 * Tag constraint validation.
 *
 * Validates that elements use only allowed tags.
 */

import type { Model } from '../schema/model.js';
import type { Violation } from './index.js';
import { ActorTagSchema } from '../schema/actor.js';
import { SystemTagSchema } from '../schema/system.js';
import { ContainerTagSchema } from '../schema/container.js';
import { ComponentTagSchema } from '../schema/component.js';

/**
 * Validates tag constraints across the model.
 *
 * Rules:
 * - Actors: customer, internal, vendor, bot, team (at most one)
 * - Systems: external, deprecated, planned, critical
 * - Containers: deprecated, planned, critical
 * - Components: deprecated, planned
 *
 * @param model - The model to validate
 * @returns Array of violations
 */
export function validateTags(model: Model): Violation[] {
  const violations: Violation[] = [];

  // Validate actor tags
  for (const actor of model.actors) {
    if (actor.tag) {
      const result = ActorTagSchema.safeParse(actor.tag);
      if (!result.success) {
        violations.push({
          path: actor.id,
          rule: 'invalid-actor-tag',
          message: `Actor '${actor.id}' has invalid tag '${actor.tag}'. Allowed: customer, internal, vendor, bot, team`,
        });
      }
    }
  }

  // Validate system tags
  for (const system of model.systems) {
    if (system.tags) {
      for (const tag of system.tags) {
        const result = SystemTagSchema.safeParse(tag);
        if (!result.success) {
          violations.push({
            path: system.id,
            rule: 'invalid-system-tag',
            message: `System '${system.id}' has invalid tag '${tag}'. Allowed: external, deprecated, planned, critical`,
          });
        }
      }
    }

    // Validate container tags
    if (system.containers) {
      for (const container of system.containers) {
        if (container.tags) {
          for (const tag of container.tags) {
            const result = ContainerTagSchema.safeParse(tag);
            if (!result.success) {
              violations.push({
                path: `${system.id}.${container.id}`,
                rule: 'invalid-container-tag',
                message: `Container '${system.id}.${container.id}' has invalid tag '${tag}'. Allowed: deprecated, planned, critical`,
              });
            }
          }
        }

        // Validate component tags
        if (container.components) {
          for (const component of container.components) {
            if (component.tags) {
              for (const tag of component.tags) {
                const result = ComponentTagSchema.safeParse(tag);
                if (!result.success) {
                  violations.push({
                    path: `${system.id}.${container.id}.${component.id}`,
                    rule: 'invalid-component-tag',
                    message: `Component '${system.id}.${container.id}.${component.id}' has invalid tag '${tag}'. Allowed: deprecated, planned`,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return violations;
}
