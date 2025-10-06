/**
 * Simple assertion library for Latte
 * Provides basic expect functionality with readable error messages
 */

class ExpectationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExpectationError';
  }
}

class Expectation {
  constructor(actual) {
    this.actual = actual;
    this.isNegated = false;
  }

  get not() {
    const negated = new Expectation(this.actual);
    negated.isNegated = !this.isNegated;
    return negated;
  }

  toBe(expected) {
    const passed = Object.is(this.actual, expected);
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} not to be ${this.formatValue(expected)}`
        : `Expected ${this.formatValue(this.actual)} to be ${this.formatValue(expected)}`;
      throw new ExpectationError(message);
    }
  }

  toEqual(expected) {
    const passed = this.deepEqual(this.actual, expected);
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} not to equal ${this.formatValue(expected)}`
        : `Expected ${this.formatValue(this.actual)} to equal ${this.formatValue(expected)}`;
      throw new ExpectationError(message);
    }
  }

  toContain(expected) {
    let passed = false;
    
    if (typeof this.actual === 'string') {
      passed = this.actual.includes(expected);
    } else if (Array.isArray(this.actual)) {
      passed = this.actual.includes(expected);
    } else if (this.actual && typeof this.actual.includes === 'function') {
      passed = this.actual.includes(expected);
    }

    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} not to contain ${this.formatValue(expected)}`
        : `Expected ${this.formatValue(this.actual)} to contain ${this.formatValue(expected)}`;
      throw new ExpectationError(message);
    }
  }

  toThrow(expectedMessage) {
    if (typeof this.actual !== 'function') {
      throw new ExpectationError('Expected value must be a function when using toThrow');
    }

    let threwError = false;
    let actualError = null;

    try {
      this.actual();
    } catch (error) {
      threwError = true;
      actualError = error;
    }

    const shouldThrow = !this.isNegated;

    if (shouldThrow && !threwError) {
      throw new ExpectationError('Expected function to throw an error, but it did not');
    }

    if (!shouldThrow && threwError) {
      throw new ExpectationError(`Expected function not to throw, but it threw: ${actualError.message}`);
    }

    if (expectedMessage && threwError) {
      const messageMatches = actualError.message.includes(expectedMessage);
      if (!messageMatches) {
        throw new ExpectationError(
          `Expected error message to contain "${expectedMessage}", but got "${actualError.message}"`
        );
      }
    }
  }

  toBeTruthy() {
    const passed = Boolean(this.actual);
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} to be falsy`
        : `Expected ${this.formatValue(this.actual)} to be truthy`;
      throw new ExpectationError(message);
    }
  }

  toBeFalsy() {
    const passed = !Boolean(this.actual);
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} to be truthy`
        : `Expected ${this.formatValue(this.actual)} to be falsy`;
      throw new ExpectationError(message);
    }
  }

  toBeNull() {
    const passed = this.actual === null;
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} not to be null`
        : `Expected ${this.formatValue(this.actual)} to be null`;
      throw new ExpectationError(message);
    }
  }

  toBeUndefined() {
    const passed = this.actual === undefined;
    const shouldPass = this.isNegated ? !passed : passed;

    if (!shouldPass) {
      const message = this.isNegated
        ? `Expected ${this.formatValue(this.actual)} not to be undefined`
        : `Expected ${this.formatValue(this.actual)} to be undefined`;
      throw new ExpectationError(message);
    }
  }

  // Helper methods
  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }
}

/**
 * Main expect function
 * @param {any} actual - The value to test
 * @returns {Expectation} - Expectation object with assertion methods
 */
export function expect(actual) {
  return new Expectation(actual);
}

export { ExpectationError };
