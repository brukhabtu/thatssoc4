/**
 * Test the example model with validation and generation.
 */

import { exampleModel } from './simple-model.js';
import { validate, formatViolations } from '../src/validator.js';
import { generate } from '../src/generator.js';

console.log('=== Testing thatssoc4 ===\n');

// Validate the model
console.log('1. Validating model...');
const validationResult = validate(exampleModel);

if (validationResult.valid) {
  console.log('✓ Model is valid!\n');
} else {
  console.log('✗ Model has violations:\n');
  console.log(formatViolations(validationResult.violations));
  if (validationResult.schemaErrors) {
    console.log('Schema errors:');
    console.log(validationResult.schemaErrors);
  }
  process.exit(1);
}

// Generate DSL
console.log('2. Generating LikeC4 DSL...\n');
try {
  const dsl = generate(exampleModel);
  console.log('Generated DSL:');
  console.log('─'.repeat(80));
  console.log(dsl);
  console.log('─'.repeat(80));
  console.log('\n✓ Generation successful!');
} catch (error) {
  console.error('✗ Generation failed:');
  console.error(error);
  process.exit(1);
}
