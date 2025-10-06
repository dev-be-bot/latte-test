#!/usr/bin/env node

// Suppress module warnings immediately
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code, ...args) {
  if (code === 'MODULE_TYPELESS_PACKAGE_JSON') return;
  return originalEmitWarning.call(this, warning, type, code, ...args);
};

// Register tsx loader for TSX support (async function)
async function registerTsx() {
  try {
    await import('tsx/esm');
  } catch (error) {
    // tsx not available, TSX files will fail
  }
}

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Latte CLI Runner
 * Discovers and runs all .latte.js test files
 */
class LatteCLI {
  constructor() {
    this.testFiles = [];
    this.totalResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async run() {
    console.log('☕ Latte Test Framework v1.1.1\n');
    console.log('Discovering and executing test files...\n');

    // Register tsx loader for TSX support
    await registerTsx();

    try {
      // Find all test files
      await this.discoverTests();
      
      if (this.testFiles.length === 0) {
        console.log('No test files found in the current directory.\n');
        console.log('Supported file patterns:');
        console.log('  • *.latte.{js,ts,tsx} (recommended)');
        console.log('  • *.test.{js,ts,tsx}');
        console.log('  • *.spec.{js,ts,tsx}');
        console.log('\nExamples: login.latte.js, cart.test.ts, auth.spec.tsx');
        console.log('Note: TypeScript files require: npm install tsx');
        console.log('\nFor documentation and examples: https://github.com/dev-be-bot/latte-test');
        return;
      }

      console.log(`Found ${this.testFiles.length} test file${this.testFiles.length === 1 ? '' : 's'}:\n`);
      this.testFiles.forEach(file => {
        const relativePath = file.replace(process.cwd(), '.').replace(/\\/g, '/');
        console.log(`  ${relativePath}`);
      });
      console.log('');

      // Run all test files
      for (const testFile of this.testFiles) {
        await this.runTestFile(testFile);
      }

      // Show final summary
      this.showFinalSummary();

    } catch (error) {
      console.error('❌ Error running tests:', error.message);
      process.exit(1);
    }
  }

  async discoverTests() {
    const cwd = process.cwd();
    
    // Priority search order: common test folders first, then full project
    const searchPaths = [
      join(cwd, 'tests'),     // tests/
      join(cwd, 'test'),      // test/
      join(cwd, '__tests__'), // __tests__/
      join(cwd, 'e2e'),       // e2e/
      cwd                     // root + all subdirs (fallback)
    ];
    
    const foundFiles = new Set(); // Prevent duplicates
    
    for (const searchPath of searchPaths) {
      try {
        const stats = await stat(searchPath);
        if (stats.isDirectory()) {
          if (searchPath !== cwd) {
            console.log(`Scanning ${searchPath.split(/[/\\]/).pop()}/ directory...`);
          }
          await this.findTestFiles(searchPath, foundFiles);
        }
      } catch (error) {
        // Folder doesn't exist, skip
      }
    }
    
    // Convert Set back to Array
    this.testFiles = Array.from(foundFiles);
  }

  async findTestFiles(dir, foundFiles = new Set()) {
    try {
      const entries = await readdir(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          await this.findTestFiles(fullPath, foundFiles);
        } else if (this.isTestFile(entry)) {
          foundFiles.add(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
      if (error.code !== 'EACCES') {
        throw error;
      }
    }
  }

  /**
   * Check if a file is a test file based on supported patterns
   * @returns {boolean} - True if it's a test file
   */
  isTestFile(filename) {
    const testPatterns = [
      /\.latte\.js$/,     // login.latte.js
      /\.latte\.ts$/,     // login.latte.ts  
      /\.latte\.tsx$/,    // login.latte.tsx
      /\.test\.js$/,      // login.test.js
      /\.test\.ts$/,      // login.test.ts
      /\.test\.tsx$/,     // login.test.tsx
      /\.spec\.js$/,      // login.spec.js
      /\.spec\.ts$/,      // login.spec.ts
      /\.spec\.tsx$/      // login.spec.tsx
    ];
    
    return testPatterns.some(pattern => pattern.test(filename));
  }

  async runTestFile(testFile) {
    const fileName = testFile.split(/[/\\]/).pop();
    console.log(`\n▶ Executing ${fileName}`);
    
    try {
      // Clear any previous test registrations  
      const { clearTests, runTests } = await import('latte-test');
      clearTests();
      
      // Try direct import for all files (TS works, let's see if TSX can too)
      await import(pathToFileURL(testFile));
      
      // Run the registered tests
      const results = await runTests();
      
      // Update totals
      this.totalResults.passed += results.passed;
      this.totalResults.failed += results.failed;
      this.totalResults.total += (results.passed + results.failed);
      
      console.log('');
      
    } catch (error) {
      const fileName = testFile.split(/[/\\]/).pop();
      console.error(`\n✗ Error in ${fileName}: ${error.message}`);
      this.totalResults.failed++;
      this.totalResults.total++;
    }
  }

  showFinalSummary() {
    console.log('\n' + '─'.repeat(50));
    console.log('Test Execution Summary');
    console.log('─'.repeat(50));
    console.log(`Total: ${this.totalResults.total}`);
    console.log(`Passed: \x1b[32m${this.totalResults.passed}\x1b[0m`);
    console.log(`Failed: \x1b[31m${this.totalResults.failed}\x1b[0m`);
    console.log('─'.repeat(50));
    
    if (this.totalResults.failed > 0) {
      console.log('\n\x1b[31m✗ Test suite failed\x1b[0m');
      process.exit(1);
    } else {
      console.log('\n\x1b[32m✓ All tests passed\x1b[0m');
    }
  }

}

// Run the CLI if this file is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cli = new LatteCLI();
  cli.run();
}
