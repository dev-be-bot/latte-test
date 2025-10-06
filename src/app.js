/**
 * LatteApp - Simulates a web application for testing
 * Provides methods to simulate user interactions without a real browser
 */
export class LatteApp {
  constructor() {
    this.currentUrl = '';
    this.state = new Map();
    this.elements = new Map();
    this.content = '';
    this.logs = [];
  }

  /**
   * Simulate opening a page
   * @param {string} url - The URL to open
   */
  async open(url) {
    this.currentUrl = url;
    this.log(`Opening: ${url}`);
    
    // Simulate page loading delay
    await this.delay(10);
    
    // Initialize basic page state based on URL
    this.initializePage(url);
  }

  /**
   * Simulate typing into an input field
   * @param {string} selector - CSS selector for the input
   * @param {string} value - Value to type
   */
  async type(selector, value) {
    this.log(`Typing "${value}" into ${selector}`);
    
    // Simulate typing delay
    await this.delay(5);
    
    // Store the value in our simulated element state
    this.elements.set(selector, { type: 'input', value });
    
    // Update app state based on common patterns
    this.updateStateFromInput(selector, value);
  }

  /**
   * Simulate clicking an element
   * @param {string} selector - CSS selector for the element to click
   */
  async click(selector) {
    this.log(`Clicking: ${selector}`);
    
    // Simulate click delay
    await this.delay(5);
    
    // Handle common click patterns
    await this.handleClick(selector);
  }

  /**
   * Assert that content is visible/present
   * @param {string} text - Text that should be present
   */
  async see(text) {
    this.log(`Looking for: "${text}"`);
    
    // Check if text exists in current content or state
    const found = this.content.includes(text) || 
                  Array.from(this.state.values()).some(val => 
                    typeof val === 'string' && val.includes(text)
                  );
    
    if (!found) {
      throw new Error(`Expected to see "${text}" but it was not found`);
    }
    
    this.log(`✓ Found: "${text}"`);
  }

  /**
   * Get current page content (for debugging)
   */
  getContent() {
    return this.content;
  }

  /**
   * Get current app state (for debugging)
   */
  getState() {
    return Object.fromEntries(this.state);
  }

  /**
   * Get interaction logs (for debugging)
   */
  getLogs() {
    return this.logs;
  }

  // Private helper methods

  initializePage(url) {
    // Simulate different page types based on URL
    if (url.includes('/login')) {
      this.content = 'Login Page - Enter your credentials';
      this.state.set('page', 'login');
    } else if (url.includes('/dashboard')) {
      this.content = 'Dashboard - Welcome to your account';
      this.state.set('page', 'dashboard');
    } else if (url.includes('/cart')) {
      this.content = 'Shopping Cart - Your items';
      this.state.set('page', 'cart');
      this.state.set('items', []);
    } else if (url.includes('/reset-password') || url.includes('/forgot-password')) {
      this.content = 'Reset Password - Enter your email';
      this.state.set('page', 'reset-password');
    } else if (url.includes('/register')) {
      this.content = 'Register - Create your account';
      this.state.set('page', 'register');
    } else if (url.includes('/checkout')) {
      this.content = 'Checkout - Complete your order';
      this.state.set('page', 'checkout');
    } else {
      this.content = 'Home Page';
      this.state.set('page', 'home');
    }
  }

  updateStateFromInput(selector, value) {
    // Common input patterns
    if (selector.includes('username') || selector.includes('#username')) {
      this.state.set('username', value);
    } else if (selector.includes('password') || selector.includes('#password')) {
      this.state.set('password', value);
    } else if (selector.includes('email') || selector.includes('#email')) {
      this.state.set('email', value);
    }
  }

  async handleClick(selector) {
    // Common click patterns
    if (selector.includes('login') || selector.includes('#login-button')) {
      await this.handleLogin();
    } else if (selector.includes('logout') || selector.includes('#logout')) {
      await this.handleLogout();
    } else if (selector.includes('register') || selector.includes('#register-button')) {
      await this.handleRegister();
    } else if (selector.includes('send-reset') || selector.includes('#send-reset')) {
      await this.handlePasswordReset();
    } else if (selector.includes('submit') || selector.includes('#submit')) {
      await this.handleSubmit();
    } else if (selector.includes('add-to-cart')) {
      await this.handleAddToCart();
    }
  }

  async handleLogin() {
    const username = this.state.get('username');
    const password = this.state.get('password');
    
    // Simulate login logic
    if (username === 'user' && password === '1234') {
      this.state.set('loggedIn', true);
      this.state.set('currentUser', username);
      this.content = `Welcome back, ${username}!`;
      this.log('✓ Login successful');
    } else if (username && password) {
      this.content = 'Invalid credentials';
      this.log('✗ Login failed - invalid credentials');
    } else {
      this.content = 'Please enter username and password';
      this.log('✗ Login failed - missing credentials');
    }
  }

  async handleLogout() {
    this.state.set('loggedIn', false);
    this.state.delete('currentUser');
    this.content = 'You have been logged out';
    this.log('✓ Logout successful');
  }

  async handleSubmit() {
    this.content = 'Form submitted successfully';
    this.log('✓ Form submitted');
  }

  async handleAddToCart() {
    const items = this.state.get('items') || [];
    items.push({ id: Date.now(), name: 'Product' });
    this.state.set('items', items);
    this.content = `Item added to cart (${items.length} items)`;
    this.log('✓ Item added to cart');
  }

  async handleRegister() {
    const username = this.state.get('username');
    const password = this.state.get('password');
    const email = this.state.get('email');
    
    // Simulate registration logic
    if (!username || !password) {
      this.content = 'Please enter username and password';
      this.log('✗ Registration failed - missing credentials');
    } else {
      this.state.set('registered', true);
      this.state.set('currentUser', username);
      this.content = 'Registration successful';
      this.log('✓ Registration successful');
    }
  }

  async handlePasswordReset() {
    const email = this.state.get('email');
    
    if (email) {
      this.content = 'Reset email sent';
      this.log('✓ Password reset email sent');
    } else {
      this.content = 'Please enter your email';
      this.log('✗ Password reset failed - no email');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }
}
