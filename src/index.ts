/**
 * thatssoc4
 * 
 * A TypeScript toolkit for generating and validating LikeC4 architecture
 * diagrams that adhere to Simon Brown's C4 methodology.
 * 
 * @packageDocumentation
 */

// Schema exports
export * from './schema/index.js';

// Constraint exports
export * from './constraints/index.js';

// Generator and validator
export { generate } from './generator.js';
export { validate } from './validator.js';
