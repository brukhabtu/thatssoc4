/**
 * Constraint validation functions for thatssoc4.
 * 
 * These functions validate semantic rules that cannot be expressed
 * in the type system alone.
 */

export * from './tags.js';
export * from './links.js';
export * from './relationships.js';
export * from './ownership.js';

import type { Model } from '../schema/model.js';
import { validateTags } from './tags.js';
import { validateLinks } from './links.js';
import { validateRelationships } from './relationships.js';
import { validateOwnership } from './ownership.js';

/**
 * Represents a constraint violation.
 */
export interface Violation {
  /** Fully qualified element path (e.g., "backend.userService.authModule") */
  path: string;
  /** Machine-readable violation code */
  rule: string;
  /** Human-readable explanation */
  message: string;
}

/**
 * Validates a model against all constraints.
 * 
 * @param model - The model to validate
 * @returns Array of violations, empty if valid
 */
export function validateConstraints(model: Model): Violation[] {
  return [
    ...validateTags(model),
    ...validateLinks(model),
    ...validateRelationships(model),
    ...validateOwnership(model),
  ];
}
