// TypeScript declarations for latte-test

export interface App {
  open(url: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  click(selector: string): Promise<void>;
  see(text: string): Promise<void>;
  seeElement(selector: string): Promise<void>;
  seeAttribute(selector: string, attribute: string, expectedValue: string): Promise<void>;
  wait(milliseconds: number): Promise<void>;
  screenshot(filename?: string): Promise<void>;
  close(): Promise<void>;
  getContent(): Promise<string>;
  getCurrentUrl(): Promise<string>;
  getLogs(): string[];
}

export interface ExpectMatchers<T> {
  toBe(expected: T): void;
  toContain(expected: any): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toThrow(expected?: string | RegExp): void;
  not: ExpectMatchers<T>;
}

export declare function latte(description: string, testFunction: (app: App) => Promise<void>): void;
export declare function group(description: string, groupFunction: () => void): void;
export declare function runTests(): Promise<{passed: number, failed: number, results: Array<any>}>;
export declare function expect<T>(actual: T): ExpectMatchers<T>;
