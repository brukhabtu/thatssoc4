/**
 * Validator for LikeC4 models.
 *
 * Validates models against thatssoc4 constraints.
 */

import type { Model } from './schema/model.js';
import { ModelSchema } from './schema/model.js';
import { validateConstraints, type Violation } from './constraints/index.js';

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether the model is valid */
  valid: boolean;
  /** List of violations, empty if valid */
  violations: Violation[];
  /** Optional schema validation errors */
  schemaErrors?: string;
}

/**
 * Validates a model against thatssoc4 constraints.
 *
 * This function performs two levels of validation:
 * 1. Schema validation (via Zod) - ensures structural correctness
 * 2. Constraint validation - ensures semantic rules are met
 *
 * @param model - The model to validate
 * @returns Validation result with any violations found
 *
 * @example
 * ```ts
 * const model = {
 *   actors: [...],
 *   systems: [...]
 * };
 *
 * const result = validate(model);
 * if (!result.valid) {
 *   console.error('Validation failed:');
 *   result.violations.forEach(v => {
 *     console.error(`  ${v.path}: ${v.message}`);
 *   });
 * }
 * ```
 */
export function validate(model: unknown): ValidationResult {
  // First, validate the schema
  const parseResult = ModelSchema.safeParse(model);

  if (!parseResult.success) {
    return {
      valid: false,
      violations: [],
      schemaErrors: JSON.stringify(parseResult.error.errors, null, 2),
    };
  }

  // Then validate constraints
  const violations = validateConstraints(parseResult.data);

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Type guard to check if a value is a valid Model.
 *
 * @param value - Value to check
 * @returns True if value is a valid Model
 */
export function isValidModel(value: unknown): value is Model {
  return ModelSchema.safeParse(value).success;
}

/**
 * Formats violations into a human-readable string.
 *
 * @param violations - Violations to format
 * @returns Formatted string
 */
export function formatViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return 'No violations found.';
  }

  const lines = [`Found ${violations.length} violation(s):\n`];

  for (const violation of violations) {
    lines.push(`  [${violation.rule}] ${violation.path}`);
    lines.push(`    ${violation.message}\n`);
  }

  return lines.join('\n');
}
