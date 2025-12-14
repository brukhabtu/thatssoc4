/**
 * Link constraint validation.
 *
 * Validates required and allowed links per element type.
 */

import type { Model } from '../schema/model.js';
import type { Violation } from './index.js';

/**
 * Validates link constraints across the model.
 *
 * Rules:
 * - Containers: repository link is REQUIRED
 * - Systems: wiki, runbook links are optional
 * - Containers: ci_pipeline, runbook links are optional
 * - Components: documentation link is optional
 *
 * @param model - The model to validate
 * @returns Array of violations
 */
export function validateLinks(model: Model): Violation[] {
  const violations: Violation[] = [];

  // Validate system links
  for (const system of model.systems) {
    // Validate container links
    if (system.containers) {
      for (const container of system.containers) {
        // Repository link is REQUIRED for containers
        // Note: git_url field is already required by schema, but we validate
        // that it's properly set
        if (!container.git_url) {
          violations.push({
            path: `${system.id}.${container.id}`,
            rule: 'missing-repository-link',
            message: `Container '${system.id}.${container.id}' is missing required git_url field`,
          });
        }
      }
    }
  }

  return violations;
}
