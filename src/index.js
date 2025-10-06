import { BrowserApp } from './browser-app.js';
import { TestRunner } from './runner.js';

// Global test registry
const tests = [];
const groups = [];
let currentGroup = null;

/**
 * Main latte function - defines a test
 * @param {string} description - Test description
 * @param {Function} testFn - Test function that receives an app instance
 * @param {Object} options - Browser options (headless, timeout, etc.)
 */
export function latte(description, testFn, options = {}) {
  const test = {
    description,
    testFn,
    group: currentGroup,
    options
  };
  
  tests.push(test);
}

/**
 * Optional grouping function
 * @param {string} name - Group name
 * @param {Function} groupFn - Function containing latte tests
 */
export function group(name, groupFn) {
  const previousGroup = currentGroup;
  currentGroup = name;
  
  groups.push({ name, tests: [] });
  groupFn();
  
  currentGroup = previousGroup;
}

/**
 * Run all registered tests
 * @returns {Promise<{passed: number, failed: number, results: Array}>}
 */
export async function runTests() {
  const runner = new TestRunner();
  return await runner.runAll(tests);
}

/**
 * Get all registered tests (for CLI runner)
 */
export function getTests() {
  return tests;
}

/**
 * Clear all tests (useful for testing the framework itself)
 */
export function clearTests() {
  tests.length = 0;
  groups.length = 0;
  currentGroup = null;
}

// Export the browser app class for advanced usage
export { BrowserApp };

// Re-export expect for convenience
export { expect } from './expect.js';
