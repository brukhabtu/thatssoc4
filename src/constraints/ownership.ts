/**
 * Ownership constraint validation.
 *
 * Validates team ownership requirements.
 */

import type { Model } from '../schema/model.js';
import type { Violation } from './index.js';

/**
 * Validates ownership constraints across the model.
 *
 * Rules:
 * - Only #team actors can use .owns relationship
 * - .owns can only target systems
 * - Every system must have exactly one owner
 * - A system cannot be owned by multiple teams
 *
 * @param model - The model to validate
 * @returns Array of violations
 */
export function validateOwnership(model: Model): Violation[] {
  const violations: Violation[] = [];

  // Build a map of system IDs
  const systemIds = new Set(model.systems.map((s) => s.id));

  // Track ownership: system ID -> owning team ID
  const ownershipMap = new Map<string, string>();

  // Validate actor ownership
  for (const actor of model.actors) {
    if (actor.owns && actor.owns.length > 0) {
      // Only team actors can own systems
      if (actor.tag !== 'team') {
        violations.push({
          path: actor.id,
          rule: 'non-team-owns',
          message: `Actor '${actor.id}' uses .owns relationship but is not tagged as #team. Only team actors can own systems.`,
        });
        continue;
      }

      // Validate each owned system
      for (const systemId of actor.owns) {
        // Check if system exists
        if (!systemIds.has(systemId)) {
          violations.push({
            path: actor.id,
            rule: 'owns-non-existent',
            message: `Team '${actor.id}' owns non-existent system '${systemId}'`,
          });
          continue;
        }

        // Check for multiple owners
        const existingOwner = ownershipMap.get(systemId);
        if (existingOwner) {
          violations.push({
            path: actor.id,
            rule: 'multiple-owners',
            message: `System '${systemId}' is owned by multiple teams: '${existingOwner}' and '${actor.id}'. Each system must have exactly one owner.`,
          });
        } else {
          ownershipMap.set(systemId, actor.id);
        }
      }
    }
  }

  // Validate complete coverage - every system must have an owner
  for (const system of model.systems) {
    // External systems don't need owners
    if (system.tags?.includes('external')) {
      continue;
    }

    if (!ownershipMap.has(system.id)) {
      violations.push({
        path: system.id,
        rule: 'unowned-system',
        message: `System '${system.id}' has no owner. Every non-external system must be owned by exactly one team.`,
      });
    }
  }

  return violations;
}
