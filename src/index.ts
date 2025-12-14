/**
 * thatssoc4
 *
 * A TypeScript toolkit for generating and validating LikeC4 architecture
 * diagrams that adhere to Simon Brown's C4 methodology.
 *
 * Built on top of @likec4/core for full ecosystem integration.
 *
 * @packageDocumentation
 */

// Schema exports
export * from './schema/index.js';

// Constraint exports
export * from './constraints/index.js';

// Generator and validator
export { generate } from './generator.js';
export { validate, isValidModel, formatViolations } from './validator.js';
