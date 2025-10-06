#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat } from 'fs/promises';
import { pathToFileURL } from 'url';

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
    console.log('☕ Latte Test Framework v1.0.6\n');
    console.log('Discovering and executing test files...\n');

    try {
      // Find all test files
      await this.discoverTests();
      
      if (this.testFiles.length === 0) {
        console.log('No test files found in the current directory.\n');
        console.log('Supported file patterns:');
        console.log('  • *.latte.{js,jsx,ts,tsx} (recommended)');
        console.log('  • *.test.{js,jsx,ts,tsx}');
        console.log('  • *.spec.{js,jsx,ts,tsx}');
        console.log('\nExamples: login.latte.js, cart.test.jsx, auth.spec.tsx');
        console.log('Note: TypeScript/JSX files require: npm install tsx');
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
      /\.latte\.jsx$/,    // login.latte.jsx
      /\.latte\.ts$/,     // login.latte.ts  
      /\.latte\.tsx$/,    // login.latte.tsx
      /\.test\.js$/,      // login.test.js
      /\.test\.jsx$/,     // login.test.jsx
      /\.test\.ts$/,      // login.test.ts
      /\.test\.tsx$/,     // login.test.tsx
      /\.spec\.js$/,      // login.spec.js
      /\.spec\.jsx$/,     // login.spec.jsx
      /\.spec\.ts$/,      // login.spec.ts
      /\.spec\.tsx$/      // login.spec.tsx
    ];
    
    return testPatterns.some(pattern => pattern.test(filename));
  }

  async runTestFile(testFile) {
    const fileName = testFile.split(/[/\\]/).pop();
    console.log(`\n▶ Executing ${fileName}`);
    
    try {
      // Suppress module type warnings
      const originalWarn = process.emitWarning;
      process.emitWarning = (warning, type) => {
        if (type === 'MODULE_TYPELESS_PACKAGE_JSON') return;
        originalWarn.call(process, warning, type);
      };
      
      // Clear any previous test registrations
      const { clearTests, runTests } = await import('../src/index.js');
      clearTests();
      
      // Handle JSX/TSX files by running them with tsx
      if (testFile.endsWith('.jsx') || testFile.endsWith('.tsx')) {
        const { execSync } = await import('node:child_process');
        try {
          // Run with tsx in the same process context
          execSync(`npx tsx "${testFile}"`, { 
            stdio: 'inherit',
            cwd: process.cwd()
          });
          
          // For now, assume success if no error thrown
          this.totalResults.passed += 1;
          this.totalResults.total += 1;
        } catch (error) {
          this.totalResults.failed += 1;
          this.totalResults.total += 1;
          throw error;
        }
      } else {
        // For JS/TS files, import directly
        await import(pathToFileURL(testFile));
        
        // Run the registered tests
        const results = await runTests();
        
        // Update totals
        this.totalResults.passed += results.passed;
        this.totalResults.failed += results.failed;
        this.totalResults.total += (results.passed + results.failed);
      }
      
      // Restore original warning handler
      process.emitWarning = originalWarn;
      
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
