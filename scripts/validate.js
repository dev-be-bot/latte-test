#!/usr/bin/env node

/**
 * Latte Framework Pre-Publish Validation Script
 * 
 * Runs comprehensive validation tests against real websites
 * to ensure the framework is working correctly before publishing.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log(`
🧪 Latte Framework Validation
=============================

Running comprehensive validation tests against real websites...
This may take a few minutes as it tests real browser automation.

`);

// Run the validation test suite
const child = spawn('node', ['bin/latte.js', 'validation/validation.test.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('close', (code) => {
  console.log(`\n${'='.repeat(50)}`);
  
  if (code === 0) {
    console.log(`✅ VALIDATION PASSED!
    
All tests completed successfully. The framework is ready for publishing.

Next steps:
1. Update version in package.json if needed
2. Run: npm publish
3. Update GitHub release notes

Framework validated against:
- Basic text and HTML assertions
- Enhanced CSS selector support  
- Element existence validation
- Attribute checking
- Error handling
- Performance and timing
- Real website integration

`);
  } else {
    console.log(`❌ VALIDATION FAILED!
    
Some tests failed. Please review the output above and fix any issues
before publishing.

Common issues:
- Network connectivity problems
- Website changes (expected for real sites)
- Timeout issues
- Browser compatibility problems

`);
    process.exit(1);
  }
});

child.on('error', (error) => {
  console.error(`\n❌ Failed to run validation tests: ${error.message}`);
  process.exit(1);
});
