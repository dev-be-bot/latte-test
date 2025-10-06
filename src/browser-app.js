import puppeteer from 'puppeteer';

/**
 * BrowserApp - Real browser implementation using Puppeteer
 * Provides the same API as LatteApp but runs against real websites
 */
export class BrowserApp {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.logs = [];
    this.options = {
      headless: options.headless !== false, // Default to headless
      timeout: options.timeout || 5000,
      ...options
    };
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ 
        headless: this.options.headless,
        timeout: this.options.timeout 
      });
      this.page = await this.browser.newPage();
      
      // Set default timeout
      this.page.setDefaultTimeout(this.options.timeout);
      
      this.log('Browser initialized');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.log('Browser closed');
    }
  }

  /**
   * Navigate to a URL (real browser navigation)
   * @param {string} url - The URL to navigate to
   */
  async open(url) {
    await this.init();
    this.log(`Opening: ${url}`);
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      this.log(`✓ Opened: ${url}`);
    } catch (error) {
      this.log(`✗ Failed to open: ${url} - ${error.message}`);
      throw new Error(`Failed to open ${url}: ${error.message}`);
    }
  }

  /**
   * Type text into an element
   * @param {string} selector - CSS selector for the element
   * @param {string} value - Text to type
   */
  async type(selector, value) {
    this.log(`Typing "${value}" into ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, { timeout: this.options.timeout });
      await this.page.focus(selector);
      await this.page.keyboard.type(value);
      this.log(`✓ Typed "${value}" into ${selector}`);
    } catch (error) {
      this.log(`✗ Failed to type into ${selector} - ${error.message}`);
      throw new Error(`Failed to type into ${selector}: ${error.message}`);
    }
  }

  /**
   * Click an element
   * @param {string} selector - CSS selector for the element to click
   */
  async click(selector) {
    this.log(`Clicking: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, { timeout: this.options.timeout });
      await this.page.click(selector);
      this.log(`✓ Clicked: ${selector}`);
    } catch (error) {
      this.log(`✗ Failed to click ${selector} - ${error.message}`);
      throw new Error(`Failed to click ${selector}: ${error.message}`);
    }
  }

  /**
   * Assert that text is visible on the page
   * @param {string} text - Text that should be present
   */
  async see(text) {
    this.log(`Looking for: "${text}"`);
    
    try {
      // Wait for the text to appear on the page
      await this.page.waitForFunction(
        (searchText) => document.body.innerText.includes(searchText),
        { timeout: this.options.timeout },
        text
      );
      this.log(`✓ Found: "${text}"`);
    } catch (error) {
      // Get current page content for better error messages
      const content = await this.page.evaluate(() => document.body.innerText);
      this.log(`✗ Text "${text}" not found on page`);
      throw new Error(`Expected to see "${text}" but it was not found on the page`);
    }
  }

  /**
   * Get current page content (for debugging)
   */
  async getContent() {
    if (!this.page) return '';
    try {
      return await this.page.evaluate(() => document.body.innerText);
    } catch (error) {
      return '';
    }
  }

  /**
   * Get current page URL (for debugging)
   */
  async getCurrentUrl() {
    if (!this.page) return '';
    try {
      return this.page.url();
    } catch (error) {
      return '';
    }
  }

  /**
   * Take a screenshot (for debugging)
   * @param {string} path - Path to save screenshot
   */
  async screenshot(path) {
    if (!this.page) return;
    try {
      await this.page.screenshot({ path });
      this.log(`✓ Screenshot saved: ${path}`);
    } catch (error) {
      this.log(`✗ Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Wait for a specific amount of time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    this.log(`Waiting ${ms}ms`);
    await this.page.waitForTimeout(ms);
  }

  /**
   * Get interaction logs (for debugging)
   */
  getLogs() {
    return this.logs;
  }

  log(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }
}
