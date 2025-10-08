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
    console.log('☕ Latte Test Framework v2.6.0\n');

    try {
      // Parse command line arguments
      const args = process.argv.slice(2);
      const filterPattern = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];
      const specificFile = args.find(arg => !arg.startsWith('--'));

      // If a specific file is provided, run only that file
      if (specificFile) {
        await this.runTestFile(specificFile);
        this.showFinalSummary();
        return;
      }

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
        console.log('\nUsage:');
        console.log('  npx latte                    # Run all tests');
        console.log('  npx latte login.test.js      # Run specific file');
        console.log('  npx latte --filter=login     # Run tests matching pattern');
        return;
      }

      // Filter test files if pattern is provided
      let filesToRun = this.testFiles;
      if (filterPattern) {
        filesToRun = this.testFiles.filter(file => 
          file.toLowerCase().includes(filterPattern.toLowerCase())
        );
        
        if (filesToRun.length === 0) {
          console.log(`No test files found matching pattern: "${filterPattern}"`);
          console.log('\nAvailable test files:');
          this.testFiles.forEach(file => {
            const relativePath = file.replace(process.cwd(), '.').replace(/\\/g, '/');
            console.log(`  ${relativePath}`);
          });
          return;
        }
        
        console.log(`Running ${filesToRun.length} test file(s) matching "${filterPattern}":\n`);
        filesToRun.forEach(file => {
          const relativePath = file.replace(process.cwd(), '.').replace(/\\/g, '/');
          console.log(`  ${relativePath}`);
        });
        console.log('');
      }

      // Run test files in isolated processes
      for (const testFile of filesToRun) {
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
    return new Promise((resolve) => {
      const command = 'npx';
      const args = ['tsx',  '--no-warnings', testFile];
      
      const child = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd(),
        shell: true,
        env: { 
          ...process.env, 
          FORCE_COLOR: '1',
          NODE_OPTIONS: '--no-warnings=MODULE_TYPELESS_PACKAGE_JSON'
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        // Check for actual test failures in output
        const hasTestFailures = stdout.includes('💥 Some tests failed') || 
                               stderr.includes('Error:') || 
                               stderr.includes('AssertionError');
        
        if (hasTestFailures || code !== 0) {
          this.totalResults.failed++;
          this.totalResults.total++;
        } else {
          this.totalResults.passed++;
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
    console.log('\n' + '─'.repeat(30));
    console.log(`📊 ${this.totalResults.passed} passed, ${this.totalResults.failed} failed`);
    
    if (this.totalResults.failed > 0) {
      console.log('❌ Tests failed');
      process.exit(1);
    } else {
      console.log('✅ All tests passed');
    }
  }

}

// Run the CLI if this file is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cli = new LatteCLI();
  cli.run();
}