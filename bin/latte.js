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
    console.log('☕ Latte - Lightweight Flow-Based Testing Framework\n');

    try {
      // Find all test files
      await this.discoverTests();
      
      if (this.testFiles.length === 0) {
        console.log('📝 No test files found. Create test files with supported extensions:');
        console.log('   .latte.js/.latte.ts/.latte.tsx (recommended)');
        console.log('   .test.js/.test.ts/.test.tsx');
        console.log('   .spec.js/.spec.ts/.spec.tsx');
        console.log('   Example: login.latte.js, cart.test.ts, auth.spec.tsx');
        console.log('   Note: .ts/.tsx files require "tsx" package: npm install tsx\n');
        this.showExampleUsage();
        return;
      }

      console.log(`🔍 Found ${this.testFiles.length} test file(s):`);
      this.testFiles.forEach(file => console.log(`   ${file}`));
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
    
    for (const searchPath of searchPaths) {
      try {
        const stats = await stat(searchPath);
        if (stats.isDirectory()) {
          if (searchPath !== cwd) {
            console.log(`📁 Searching ${searchPath.split(/[/\\]/).pop()}/ folder...`);
          }
          await this.findTestFiles(searchPath);
        }
      } catch (error) {
        // Folder doesn't exist, skip
      }
    }
  }

  async findTestFiles(dir) {
    try {
      const entries = await readdir(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          await this.findTestFiles(fullPath);
        } else if (this.isTestFile(entry)) {
          this.testFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors and continue
    }
  }

  /**
   * Check if a file is a test file based on supported patterns
   * @param {string} filename - The filename to check
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
    console.log(`📄 Running ${testFile.split(/[/\\]/).pop()}:`);
    
    try {
      // Clear any previous test registrations
      const { clearTests, runTests } = await import('../src/index.js');
      clearTests();
      
      // Handle TypeScript/TSX files using tsx loader
      if (testFile.endsWith('.ts') || testFile.endsWith('.tsx')) {
        // Register tsx loader for TypeScript support
        try {
          await import('tsx/esm');
        } catch (tsxError) {
          console.error(`❌ TypeScript support requires 'tsx' package. Install with: npm install tsx`);
          throw tsxError;
        }
      }
      
      // Import the test file (this will register tests)
      await import(pathToFileURL(testFile));
      
      // Run the registered tests
      const results = await runTests();
      
      // Update totals
      this.totalResults.passed += results.passed;
      this.totalResults.failed += results.failed;
      this.totalResults.total += (results.passed + results.failed);
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error in ${testFile}:`, error.message);
      this.totalResults.failed++;
      this.totalResults.total++;
    }
  }

  showFinalSummary() {
    console.log('='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalResults.total}`);
    console.log(`✅ Passed: ${this.totalResults.passed}`);
    console.log(`❌ Failed: ${this.totalResults.failed}`);
    
    if (this.totalResults.total > 0) {
      const passRate = (this.totalResults.passed / this.totalResults.total * 100).toFixed(1);
      console.log(`📈 Pass Rate: ${passRate}%`);
    }
    
    console.log('');
    
    if (this.totalResults.failed === 0) {
      console.log('🎉 All tests passed! Great job!');
    } else {
      console.log('💥 Some tests failed. Check the output above for details.');
      process.exit(1);
    }
  }

  showExampleUsage() {
    console.log('📚 Example test files:');
    console.log('');
    console.log('🟡 JavaScript (login.latte.js):');
    console.log('```javascript');
    console.log('import { latte, expect } from "latte-testing";');
    console.log('');
    console.log('latte("user can log in", async (app) => {');
    console.log('  await app.open("/login");');
    console.log('  await app.type("#username", "user");');
    console.log('  await app.type("#password", "1234");');
    console.log('  await app.click("#login-button");');
    console.log('  await app.see("Welcome back, user!");');
    console.log('});');
    console.log('```');
    console.log('');
    console.log('🔵 TypeScript (auth.test.ts):');
    console.log('```typescript');
    console.log('import { latte, expect } from "latte-testing";');
    console.log('');
    console.log('latte("password reset works", async (app) => {');
    console.log('  await app.open("/reset-password");');
    console.log('  await app.type("#email", "user@example.com");');
    console.log('  await app.click("#send-reset");');
    console.log('  await app.see("Reset email sent");');
    console.log('});');
    console.log('```');
    console.log('');
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cli = new LatteCLI();
  cli.run();
}
