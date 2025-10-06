import { BrowserApp } from './browser-app.js';

/**
 * TestRunner - Executes latte tests and provides formatted output
 */
export class TestRunner {
  constructor() {
    this.results = [];
  }

  /**
   * Run all tests
   * @param {Array} tests - Array of test objects
   * @returns {Promise<{passed: number, failed: number, results: Array}>}
   */
  async runAll(tests) {
    console.log('🧪 Running Latte tests...\n');
    
    this.results = [];
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const result = await this.runSingle(test);
      this.results.push(result);
      
      if (result.passed) {
        passed++;
        console.log(`✅ ${result.description}`);
      } else {
        failed++;
        console.log(`❌ ${result.description}`);
        console.log(`   ${result.error}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('💥 Some tests failed');
    }

    return {
      passed,
      failed,
      results: this.results
    };
  }

  /**
   * Run a single test
   * @param {Object} test - Test object with description and testFn
   * @returns {Promise<{description: string, passed: boolean, error?: string, duration: number}>}
   */
  async runSingle(test) {
    const startTime = Date.now();
    let app = null;
    
    try {
      // Create browser app instance with test options
      app = new BrowserApp(test.options || {});
      
      // Run the test function
      await test.testFn(app);
      
      // Cleanup browser
      await app.cleanup();
      
      const duration = Date.now() - startTime;
      
      return {
        description: test.description,
        passed: true,
        duration,
        group: test.group
      };
    } catch (error) {
      // Cleanup browser if needed
      if (app) {
        await app.cleanup();
      }
      
      const duration = Date.now() - startTime;
      
      return {
        description: test.description,
        passed: false,
        error: error.message,
        duration,
        group: test.group
      };
    }
  }

  /**
   * Get formatted results summary
   */
  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0
    };
  }

  /**
   * Get detailed results for debugging
   */
  getDetailedResults() {
    return this.results.map(result => ({
      ...result,
      status: result.passed ? 'PASS' : 'FAIL'
    }));
  }
}
