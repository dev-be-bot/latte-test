#!/usr/bin/env node

// Suppress module warnings immediately
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code, ...args) {
  if (code === 'MODULE_TYPELESS_PACKAGE_JSON') return;
  return originalEmitWarning.call(this, warning, type, code, ...args);
};

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Latte CLI Runner
 * Runs each test file in an isolated Node.js process to avoid module conflicts
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
    console.log('☕ Latte Test Framework v2.0.4\n');
    console.log('Discovering and executing test files...\n');

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

      // Run all test files in isolated processes
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
    
    return new Promise((resolve) => {
      // Determine the right loader based on file extension
      const ext = testFile.split('.').pop();
      const isTypeScript = ext === 'ts' || ext === 'tsx';
      
      // Create inline runner script that executes in a fresh process
      const fileUrl = pathToFileURL(testFile).href;
      const runnerScript = `
import { clearTests, runTests } from 'latte-test';

async function runIsolatedTest() {
  try {
    clearTests();
    await import('${fileUrl}');
    const results = await runTests();
    console.log('__LATTE_RESULTS_START__');
    console.log(JSON.stringify(results));
    console.log('__LATTE_RESULTS_END__');
    process.exit(0);
  } catch (error) {
    console.error('Test execution error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runIsolatedTest();
`;

      // Build command args
      const args = [];
      
      if (isTypeScript) {
        // Use node with tsx import for TypeScript files
        args.push('--import', 'tsx/esm', '--no-warnings');
      } else {
        args.push('--no-warnings=MODULE_TYPELESS_PACKAGE_JSON');
      }
      
      args.push('--input-type=module', '--eval', runnerScript);
      
      const child = spawn('node', args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: process.env
      });
      
      let stdout = '';
      let stderr = '';
      let inResults = false;
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Parse output line by line to extract results
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes('__LATTE_RESULTS_START__')) {
            inResults = true;
          } else if (line.includes('__LATTE_RESULTS_END__')) {
            inResults = false;
          } else if (!inResults && line.trim()) {
            // Print test output in real-time (not the results JSON)
            console.log(line);
          }
        }
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        try {
          // Extract JSON results from stdout
          const resultsMatch = stdout.match(/__LATTE_RESULTS_START__\s*({.*?})\s*__LATTE_RESULTS_END__/s);
          
          if (resultsMatch && resultsMatch[1]) {
            const results = JSON.parse(resultsMatch[1]);
            this.totalResults.passed += results.passed;
            this.totalResults.failed += results.failed;
            this.totalResults.total += (results.passed + results.failed);
          } else if (code !== 0) {
            // Test file crashed or had error
            console.error(`✗ Test execution failed`);
            this.totalResults.failed++;
            this.totalResults.total++;
          }
        } catch (error) {
          console.error(`\n✗ Error parsing results from ${fileName}: ${error.message}`);
          this.totalResults.failed++;
          this.totalResults.total++;
        }
        
        resolve();
      });
      
      child.on('error', (error) => {
        console.error(`\n✗ Failed to spawn test process: ${error.message}`);
        this.totalResults.failed++;
        this.totalResults.total++;
        resolve();
      });
    });
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