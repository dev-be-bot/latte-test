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
   * @param {string} selector - CSS selector, data-test-id, aria-label, or element identifier
   * @param {string} value - Text to type
   */
  async type(selector, value) {
    const resolvedSelector = await this.findElement(selector);
    this.log(`Typing "${value}" into ${selector}`);
    
    try {
      await this.page.focus(resolvedSelector);
      await this.page.keyboard.type(value);
      this.log(`✓ Typed "${value}" into ${selector}`);
    } catch (error) {
      this.log(`✗ Failed to type into ${selector} - ${error.message}`);
      throw new Error(`Failed to type into ${selector}: ${error.message}`);
    }
  }

  /**
   * Click an element
   * @param {string} selector - CSS selector, data-test-id, aria-label, or element identifier
   */
  async click(selector) {
    const resolvedSelector = await this.findElement(selector);
    this.log(`Clicking: ${selector}`);
    
    try {
      await this.page.click(resolvedSelector);
      this.log(`✓ Clicked: ${selector}`);
    } catch (error) {
      this.log(`✗ Failed to click ${selector} - ${error.message}`);
      throw new Error(`Failed to click ${selector}: ${error.message}`);
    }
  }

  /**
   * Assert that text/content is visible on the page
   * @param {string} text - Text, HTML, or selector that should be present
   */
  async see(text) {
    this.log(`Looking for: "${text}"`);
    
    try {
      // Enhanced search strategy - try multiple approaches
      await this.page.waitForFunction(
        (searchText) => {
          // Strategy 1: Check if it's a CSS selector
          if (searchText.startsWith('.') || searchText.startsWith('#') || searchText.includes('[')) {
            try {
              return document.querySelector(searchText) !== null;
            } catch (e) {
              // Not a valid selector, continue to text search
            }
          }
          
          // Strategy 2: Check visible text content (most common)
          if (document.body.innerText.includes(searchText)) {
            return true;
          }
          
          // Strategy 3: Check HTML content (for tags like <h6>Log In</h6>)
          if (document.body.innerHTML.includes(searchText)) {
            return true;
          }
          
          // Strategy 4: Check for ARIA labels and attributes
          const elementsWithAria = document.querySelectorAll('[aria-label*="' + searchText + '"], [aria-labelledby*="' + searchText + '"], [title*="' + searchText + '"]');
          if (elementsWithAria.length > 0) {
            return true;
          }
          
          // Strategy 5: Check for text in all text nodes (case-insensitive)
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchText.toLowerCase())) {
              return true;
            }
          }
          
          return false;
        },
        { timeout: this.options.timeout },
        text
      );
      this.log(`✓ Found: "${text}"`);
    } catch (error) {
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
   * Set the browser resolution (viewport size)
   * @param {number} width - Resolution width in pixels
   * @param {number} height - Resolution height in pixels
   */
  async resolution(width, height) {
    await this.init();
    this.log(`Setting resolution to ${width}x${height}`);
    
    try {
      await this.page.setViewport({ width, height });
      this.log(`✓ Resolution set to ${width}x${height}`);
    } catch (error) {
      this.log(`✗ Failed to set resolution: ${error.message}`);
      throw new Error(`Failed to set resolution to ${width}x${height}: ${error.message}`);
    }
  }

  /**
   * Get the current resolution (viewport dimensions)
   * @returns {Promise<{width: number, height: number}>} Current resolution
   */
  async getResolution() {
    if (!this.page) {
      throw new Error('Browser not initialized. Call open() first.');
    }
    
    try {
      const viewport = this.page.viewport();
      this.log(`Current resolution: ${viewport.width}x${viewport.height}`);
      return viewport;
    } catch (error) {
      this.log(`✗ Failed to get resolution: ${error.message}`);
      throw new Error(`Failed to get resolution: ${error.message}`);
    }
  }

  /**
   * Wait for a specific amount of time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    this.log(`Waiting ${ms}ms`);
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert that an element with the given selector exists
   * @param {string} selector - CSS selector to check
   */
  async seeElement(selector) {
    this.log(`Looking for element: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, { timeout: this.options.timeout });
      this.log(`✓ Found element: ${selector}`);
    } catch (error) {
      this.log(`✗ Element "${selector}" not found`);
      throw new Error(`Expected to see element "${selector}" but it was not found on the page`);
    }
  }

  /**
   * Assert that an element has a specific attribute value
   * @param {string} selector - CSS selector for the element
   * @param {string} attribute - Attribute name (e.g., 'aria-label', 'title', 'class')
   * @param {string} expectedValue - Expected attribute value
   */
  async seeAttribute(selector, attribute, expectedValue) {
    this.log(`Checking ${selector} has ${attribute}="${expectedValue}"`);
    
    try {
      await this.page.waitForFunction(
        (sel, attr, expected) => {
          const element = document.querySelector(sel);
          if (!element) return false;
          const actualValue = element.getAttribute(attr);
          return actualValue && actualValue.includes(expected);
        },
        { timeout: this.options.timeout },
        selector,
        attribute,
        expectedValue
      );
      this.log(`✓ Found ${selector} with ${attribute}="${expectedValue}"`);
    } catch (error) {
      this.log(`✗ Element "${selector}" does not have ${attribute}="${expectedValue}"`);
      throw new Error(`Expected element "${selector}" to have ${attribute}="${expectedValue}"`);
    }
  }

  /**
   * Get interaction logs (for debugging)
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Smart element finder that tries multiple selector strategies
   * @param {string} selector - The selector to find
   * @returns {string} - Working CSS selector
   */
  async findElement(selector) {
    // If it's already a CSS selector (contains special chars), try it first
    if (selector.includes('[') || selector.includes('.') || selector.includes('#') || selector.includes(' ') || selector.includes('>')) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 });
        return selector;
      } catch (error) {
        // If the CSS selector fails, fall through to try other strategies
      }
    }
    
    // Try multiple selector strategies in order of preference
    const strategies = [
      // Semantic HTML first (most reliable)
      selector === 'submit' || selector === 'Confirm' ? 'button[type="submit"]' : null,
      
      // Testing attributes
      `[data-testid="${selector}"]`,            // data-testid (React Testing Library)
      `[data-test-id="${selector}"]`,           // data-test-id (alternative format)
      `[data-cy="${selector}"]`,                // data-cy (Cypress)
      
      // Form attributes
      `[name="${selector}"]`,                   // name attribute (forms)
      `#${selector}`,                           // id attribute
      
      // Accessibility attributes
      `[aria-label="${selector}"]`,             // aria-label (accessibility)
      `[aria-labelledby="${selector}"]`,        // aria-labelledby
      
      // General attributes
      `[placeholder="${selector}"]`,            // placeholder text
      `[title="${selector}"]`,                  // title attribute
      `.${selector}`,                           // class name
      `[role="${selector}"]`,                   // ARIA role
      selector                                  // fallback to original
    ].filter(Boolean); // Remove null values
    
    // Try each strategy until one works
    for (const strategy of strategies) {
      try {
        // Wait for element to exist AND be enabled (not disabled)
        await this.page.waitForSelector(`${strategy}:not([disabled])`, { timeout: 2000 });
        return strategy;
      } catch (error) {
        // If that fails, try just waiting for existence (might be disabled initially)
        try {
          await this.page.waitForSelector(strategy, { timeout: 1000 });
          return strategy;
        } catch (error2) {
          // Continue to next strategy
        }
      }
    }
    
    // Try a more flexible approach - maybe the element loads dynamically
    try {
      await this.page.waitForSelector(`[data-testid="${selector}"]`, { timeout: 8000 });
      return `[data-testid="${selector}"]`;
    } catch (error) {
      // Also try by aria-label if it matches
      try {
        await this.page.waitForSelector(`[aria-label="${selector}"]`, { timeout: 3000 });
        return `[aria-label="${selector}"]`;
      } catch (error2) {
        // Final attempt failed
      }
    }
    
    // If nothing worked, throw an error with helpful information
    throw new Error(`Element "${selector}" not found. Searched using data-testid, name, aria-label, id, and other common selectors.`);
  }

  log(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }
}
