/**
 * Relationship constraint validation.
 *
 * Validates dependency direction and level constraints.
 */

import type { Model } from '../schema/model.js';
import type { Violation } from './index.js';

/**
 * Validates relationship constraints across the model.
 *
 * Rules:
 * - System relationships can only target other systems
 * - Container relationships can target any container (cross-system allowed)
 * - Component relationships can only target sibling components (same container)
 * - All relationships must have technology specified
 * - Relationships represent dependencies (arrow points to what you depend on)
 *
 * @param model - The model to validate
 * @returns Array of violations
 */
export function validateRelationships(model: Model): Violation[] {
  const violations: Violation[] = [];

  // Build a map of all element IDs to their types and paths
  const elementMap = new Map<
    string,
    { type: 'system' | 'container' | 'component'; path: string; parent?: string }
  >();

  // Map system IDs
  for (const system of model.systems) {
    elementMap.set(system.id, {
      type: 'system',
      path: system.id,
    });

    // Map container IDs
    if (system.containers) {
      for (const container of system.containers) {
        elementMap.set(container.id, {
          type: 'container',
          path: `${system.id}.${container.id}`,
          parent: system.id,
        });

        // Map component IDs
        if (container.components) {
          for (const component of container.components) {
            elementMap.set(component.id, {
              type: 'component',
              path: `${system.id}.${container.id}.${component.id}`,
              parent: container.id,
            });
          }
        }
      }
    }
  }

  // Validate system relationships
  for (const system of model.systems) {
    if (system.relationships) {
      for (const rel of system.relationships) {
        // Check if target exists
        const target = elementMap.get(rel.to_id);
        if (!target) {
          violations.push({
            path: system.id,
            rule: 'unknown-reference',
            message: `System '${system.id}' has relationship to unknown element '${rel.to_id}'`,
          });
          continue;
        }

        // System can only relate to other systems
        if (target.type !== 'system') {
          violations.push({
            path: system.id,
            rule: 'system-to-non-system',
            message: `System '${system.id}' has relationship to '${rel.to_id}' which is not a system. Systems can only relate to other systems.`,
          });
        }

        // Validate technology is specified
        if (!rel.technology) {
          violations.push({
            path: system.id,
            rule: 'relationship-missing-field',
            message: `System '${system.id}' has relationship to '${rel.to_id}' without technology specified`,
          });
        }
      }
    }

    // Validate container relationships
    if (system.containers) {
      for (const container of system.containers) {
        if (container.relationships) {
          for (const rel of container.relationships) {
            // Check if target exists
            const target = elementMap.get(rel.to_id);
            if (!target) {
              violations.push({
                path: `${system.id}.${container.id}`,
                rule: 'unknown-reference',
                message: `Container '${system.id}.${container.id}' has relationship to unknown element '${rel.to_id}'`,
              });
              continue;
            }

            // Container can only relate to other containers
            if (target.type !== 'container') {
              violations.push({
                path: `${system.id}.${container.id}`,
                rule: 'container-to-non-container',
                message: `Container '${system.id}.${container.id}' has relationship to '${rel.to_id}' which is not a container. Containers can only relate to other containers.`,
              });
            }

            // Validate technology is specified
            if (!rel.technology) {
              violations.push({
                path: `${system.id}.${container.id}`,
                rule: 'relationship-missing-field',
                message: `Container '${system.id}.${container.id}' has relationship to '${rel.to_id}' without technology specified`,
              });
            }
          }
        }

        // Validate component relationships
        if (container.components) {
          for (const component of container.components) {
            if (component.relationships) {
              for (const rel of component.relationships) {
                // Check if target exists
                const target = elementMap.get(rel.to_id);
                if (!target) {
                  violations.push({
                    path: `${system.id}.${container.id}.${component.id}`,
                    rule: 'unknown-reference',
                    message: `Component '${system.id}.${container.id}.${component.id}' has relationship to unknown element '${rel.to_id}'`,
                  });
                  continue;
                }

                // Component can only relate to other components
                if (target.type !== 'component') {
                  violations.push({
                    path: `${system.id}.${container.id}.${component.id}`,
                    rule: 'component-to-non-component',
                    message: `Component '${system.id}.${container.id}.${component.id}' has relationship to '${rel.to_id}' which is not a component. Components can only relate to other components.`,
                  });
                  continue;
                }

                // Component can only relate to siblings (same container)
                if (target.parent !== container.id) {
                  violations.push({
                    path: `${system.id}.${container.id}.${component.id}`,
                    rule: 'component-cross-container',
                    message: `Component '${system.id}.${container.id}.${component.id}' has relationship to '${rel.to_id}' which is outside its container. Cross-container dependencies must be modelled at the container level.`,
                  });
                }

                // Validate technology is specified
                if (!rel.technology) {
                  violations.push({
                    path: `${system.id}.${container.id}.${component.id}`,
                    rule: 'relationship-missing-field',
                    message: `Component '${system.id}.${container.id}.${component.id}' has relationship to '${rel.to_id}' without technology specified`,
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
