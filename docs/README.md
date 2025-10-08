# ☕ Latte — Lightweight Flow-Based Testing Framework

Latte is a super simple testing framework designed to test **real websites** (like login, cart, or other user flows) in a readable, beginner-friendly way using **real browser automation**.

## 🌟 Features

- **Real Browser Testing**: Uses Puppeteer + Chromium to test actual websites
- **Smart Element Selection**: Auto-tries semantic HTML, data-testid, aria-label, name, id, class - no brittle selectors!
- **Production-Ready**: Successfully tested on complex staging environments with dynamic forms
- **Enhanced Assertions**: 5 different ways to find content - text, HTML, selectors, ARIA, elements
- **Test Hooks**: Readable `startBy`/`finishBy` hooks for setup and cleanup using the same API
- **Responsive Testing**: Set browser resolution for mobile, tablet, and desktop testing
- **Flexible Test Running**: Run all tests, specific files, or filter by pattern
- **Accessibility Testing**: Built-in support for ARIA attributes and accessibility validation
- **Test Any Website**: localhost, staging, production, public sites - all work
- **Zero Configuration**: Tests run automatically when imported - no setup required
- **Readable**: Tests look like plain English, easy to understand
- **Clean Output**: Focused, minimal output - see failures clearly without noise
- **Smart Discovery**: Automatically finds test files with intelligent prioritization
- **TypeScript/TSX Support**: Full TypeScript support with automatic compilation
- **Regression detection**: If a deployment breaks a flow, the test fails automatically
- **Lightweight**: Just Puppeteer + simple API
- **Headless by default**: Fast execution, optional browser window for debugging

## 🚀 Quick Start

### Installation

```bash
# In any Node.js project
npm install latte-test

# Optional: For TypeScript/.tsx support
npm install tsx
```

Latte automatically installs Puppeteer, which downloads Chromium (~170MB) for browser automation.

### Quick Start (30 seconds)

1. **Create a test file anywhere** (no special folder required):
```javascript
// login.test.js
import { latte } from "latte-test";

latte("my website works", async (app) => {
  await app.open("https://example.com");
  await app.see("Example Domain");
});
```

2. **Run tests:**
```bash
npx latte
```

3. **Watch Latte test your real website!** ✨

**That's it!** No configuration, no manual test runner calls - tests run automatically when imported.

### Write Your First Test

Create a test file with any supported naming pattern:
- `.latte.js/.latte.ts/.latte.tsx` (recommended - Latte branding)
- `.test.js/.test.ts/.test.tsx` (standard convention)
- `.spec.js/.spec.ts/.spec.tsx` (specification style)

**Examples:**
- `login.latte.js` - Latte test in JavaScript
- `auth.latte.ts` - Latte test in TypeScript  
- `component.latte.tsx` - Latte test in TypeScript + JSX
- `cart.test.js` - Standard test naming
- `api.spec.ts` - Specification style

**Note**: `.ts` and `.tsx` files require the `tsx` package: `npm install tsx`

Example (`login.test.js`):

```javascript
import { latte } from "latte-test";

// Test your production website
latte("user can log in to my site", async (app) => {
  await app.open("https://mysite.com/login");
  await app.type("#email", "test@example.com");
  await app.type("#password", "mypassword");
  await app.click("#login-button");
  await app.see("Welcome back!");
});

// Test your localhost during development
latte("localhost login works", async (app) => {
  await app.open("http://localhost:3000/login");
  await app.type("#email", "dev@test.com");
  await app.click("#submit");
  await app.see("Dashboard");
});
```

### Run Tests

```bash
# Run all tests
npx latte

# Run a specific test file
npx latte login.test.js

# Run tests matching a pattern
npx latte --filter=login
```

Output:
```
☕ Latte Test Framework v2.5.0

✅ user can log in to my site
✅ localhost login works

──────────────────────────────
📊 2 passed, 0 failed
✅ All tests passed
```

**What just happened?**
- Latte launched real Chromium browser (headless)
- Made actual HTTP requests to your websites
- Interacted with real DOM elements
- Validated actual page content
- Detected real issues if any exist

### When Tests Fail

When a test fails, you get clear, actionable feedback:

```
☕ Latte Test Framework v2.1.1

❌ login with invalid credentials should fail
   Expected to see "Products" but it was not found on the page

──────────────────────────────
📊 0 passed, 1 failed
❌ Tests failed
```

**Clean, focused output** - no verbose logs, just what you need to fix the issue.

## 🎯 Enhanced Assertions

Latte now supports **5 different ways** to find and validate content on your pages:

### 1. **Text Content** (Most Common)
```javascript
await app.see("Welcome back!");        // Find visible text
await app.see("Login successful");     // Case-sensitive by default
await app.see("log in");              // Case-insensitive search
```

### 2. **HTML Content** 
```javascript
await app.see("<h1>Dashboard</h1>");   // Find HTML tags
await app.see("<button>Submit</button>"); // Exact HTML match
await app.see("class='btn-primary'");  // Find HTML attributes
```

### 3. **CSS Selectors**
```javascript
await app.see("#login-button");        // Find by ID
await app.see(".error-message");       // Find by class
await app.see("input[type='email']");  // Find by attribute
await app.see("form button");          // Find nested elements
```

### 4. **Element Existence**
```javascript
await app.seeElement("#submit-btn");   // Check if element exists
await app.seeElement(".modal");        // Wait for modal to appear
await app.seeElement("input[required]"); // Find required inputs
```

### 5. **Accessibility & Attributes**
```javascript
// Check ARIA labels and attributes
await app.seeAttribute("button", "aria-label", "Close dialog");
await app.seeAttribute("input", "placeholder", "Enter email");
await app.seeAttribute("img", "alt", "Company logo");

// Accessibility testing made easy
await app.see("Close dialog");         // Finds aria-label content
await app.see("Company logo");         // Finds alt text
```

### 🔍 **Smart Search Strategy**
Latte automatically tries multiple approaches when you use `app.see()`:
1. CSS selector detection (if starts with `.`, `#`, or contains `[`)
2. Visible text search (most common use case)
3. HTML content search (for tags and attributes)
4. ARIA attributes search (aria-label, title, etc.)
5. Case-insensitive text search (fallback)

## 🎯 Smart Element Selection

Latte now includes **intelligent element finding** that tries multiple selector strategies automatically. No more brittle tests!
### **Supported Selector Types**

When you use `app.click()` or `app.type()`, Latte tries these strategies in order:

1. **semantic HTML** (most reliable) - `button[type="submit"]` for "Confirm", "Submit"
2. **data-testid** (React Testing Library) - `[data-testid="login-button"]`
3. **data-test-id** (alternative format) - `[data-test-id="login-button"]`
4. **data-cy** (Cypress) - `[data-cy="login-button"]`
5. **name attribute** (forms) - `[name="login-button"]`
6. **id attribute** - `#login-button`
7. **aria-label** (accessibility) - `[aria-label="login-button"]`
8. **aria-labelledby** - `[aria-labelledby="login-button"]`
9. **placeholder text** - `[placeholder="login-button"]`
10. **title attribute** - `[title="login-button"]`
11. **class name** - `.login-button`
12. **ARIA role** - `[role="login-button"]`

### **Usage Examples**

```javascript
// All of these work the same way - Latte finds the best match:
await app.click("Confirm");          // Finds button[type="submit"] - most reliable!
await app.click("submit-btn");       // Tries data-testid first, then others
await app.type("email-input", "user@example.com");  // Smart field detection
await app.click("Close dialog");     // Finds by aria-label
await app.type("username", "john");  // Finds by name attribute

// Real-world example that works:
await app.click("email");           // Finds name="email", id="email", or aria-label="email"
await app.type("email", "user@example.com");
await app.click("Confirm");         // Finds button[type="submit"] automatically
```

## 🔍 Element Discovery & Debugging

### **Finding the Right Selectors**

When tests fail with "Element not found" or "Expected to see X but it was not found", use these debugging strategies:

#### **1. Take Screenshots**
```javascript
latte("debug login", async (app) => {
  await app.open("https://mysite.com");
  await app.screenshot("before-login.png");  // See initial state
  
  await app.click("email");
  await app.type("email", "user@example.com");
  await app.screenshot("after-email.png");   // See after typing
  
  await app.click("submit");
  await app.wait(3000);
  await app.screenshot("after-submit.png");  // See result page
});
```

#### **2. Inspect Page Content**
```javascript
latte("debug content", async (app) => {
  await app.open("https://mysite.com");
  
  // Get all page text to see what's actually there
  const content = await app.getContent();
  console.log("Page content:", content);
  
  // Look for partial matches
  await app.see("Dashboard");     // ❌ Might fail
  await app.see("Personal Dashboard"); // ✅ Exact match
  await app.see("dashboard");     // ✅ Case-insensitive
});
```

#### **3. Test Element Existence**
```javascript
latte("debug elements", async (app) => {
  await app.open("https://mysite.com");
  
  // Check if elements exist before interacting
  try {
    await app.seeElement('button[type="submit"]');
    console.log("✅ Submit button found");
  } catch (error) {
    console.log("❌ No submit button found");
  }
});
```

#### **4. Common Text Issues**
```javascript
// ❌ Common failures and ✅ solutions:

// Issue: Extra whitespace or different text
await app.see("Dashboard");       // ❌ Fails if text is "Personal Dashboard"
await app.see("Personal Dashboard"); // ✅ Exact match
await app.see("dashboard");       // ✅ Case-insensitive partial match

// Issue: Dynamic content
await app.see("Welcome John");    // ❌ Fails if name changes
await app.see("Welcome");         // ✅ Partial match works
```

### **Best Practices**

#### ✅ **Recommended: Use data-test-id**
```javascript
// HTML
<button data-test-id="submit-btn">Submit</button>
<input data-test-id="email-field" type="email" />

// Test
await app.click("submit-btn");
await app.type("email-field", "user@example.com");
```

#### ✅ **Good: Use ARIA labels**
```javascript
// HTML
<button aria-label="Close modal">×</button>
<input aria-label="Email address" type="email" />

// Test  
await app.click("Close modal");
await app.type("Email address", "user@example.com");
```

#### ✅ **Acceptable: Use semantic attributes**
```javascript
// HTML
<input name="username" placeholder="Enter username" />
<button id="login-btn">Login</button>

// Test
await app.type("username", "john");
await app.click("login-btn");
```

## 📖 Core Concepts

### 1. Latte Test

```javascript
latte("description", async (app) => {
  // test logic here
});
```

- **description**: A short human-readable description of the test
- **app**: A real browser instance to perform user actions

### 2. App Actions

| Action | Description |
|--------|-------------|
| `app.open(url)` | Navigate to any URL (real browser navigation) |
| `app.type(selector, value)` | **Smart!** Type text - supports data-test-id, aria-label, name, id, class |
| `app.click(selector)` | **Smart!** Click element - supports data-test-id, aria-label, name, id, class |
| `app.see(text)` | **Enhanced!** Assert text, HTML, selectors, or ARIA content |
| `app.seeElement(selector)` | **New!** Assert that an element exists |
| `app.seeAttribute(selector, attr, value)` | **New!** Assert element attributes |
| `app.resolution(width, height)` | **New!** Set browser resolution for responsive testing |
| `app.getResolution()` | **New!** Get current browser resolution |
| `app.wait(ms)` | Wait for a specific amount of time |

### 3. Test Options

| Option | Description |
|--------|-------------|
| `startBy: async (app) => {}` | **New!** Setup hook - runs before the test |
| `finishBy: async (app) => {}` | **New!** Cleanup hook - runs after the test |
| `timeout: 10000` | Custom timeout in milliseconds (default: 5000) |

### 4. Assertions

```javascript
import { expect } from "latte-test";

expect(value).toBe(expected);
expect(value).not.toBe(expected);
expect(value).toEqual(expected);
expect(value).toContain(substring);
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(fn).toThrow("Error message");
```

## 🎯 Test Hooks (Setup & Teardown)

Latte supports **readable test hooks** that let you set up and clean up your tests using the same familiar `await app.method()` syntax.

### **startBy & finishBy**

Use `startBy` to prepare your test environment and `finishBy` to clean up afterward:

```javascript
latte("user can view dashboard", async (app) => {
  // Main test - already logged in from startBy
  await app.see("Welcome back, John!");
  await app.click("profile");
  await app.see("User Profile");
}, {
  startBy: async (app) => {
    // Set up the test - runs before the main test
    await app.open("https://myapp.com/login");
    await app.type("email", "john@test.com");
    await app.type("password", "secure123");
    await app.click("login");
    await app.see("Dashboard");
  },
  finishBy: async (app) => {
    // Clean up - runs after the main test
    await app.screenshot("test-complete.png");
    await app.click("logout");
  }
});
```

### **Hook Features**

- **Same API**: Hooks use the same `await app.click()` pattern as your tests
- **Readable**: `startBy` and `finishBy` read like plain English instructions
- **Reliable**: `finishBy` runs even if the test fails (for cleanup)
- **Optional**: Only use hooks when you need them

### **Common Hook Patterns**

#### **Login Setup**
```javascript
latte("user can edit profile", async (app) => {
  await app.click("edit-profile");
  await app.type("name", "John Updated");
  await app.click("save");
  await app.see("Profile updated");
}, {
  startBy: async (app) => {
    await app.open("https://myapp.com/login");
    await app.type("email", "user@test.com");
    await app.click("login");
    await app.see("Dashboard");
  }
});
```

#### **Resolution Testing**
```javascript
latte("mobile navigation works", async (app) => {
  await app.open("https://mysite.com");
  await app.click("menu-toggle");
  await app.see("Mobile Menu");
}, {
  startBy: async (app) => {
    await app.resolution(375, 667); // iPhone size
  },
  finishBy: async (app) => {
    await app.screenshot("mobile-test.png");
  }
});
```

#### **Data Preparation**
```javascript
latte("user can complete checkout", async (app) => {
  await app.click("checkout");
  await app.type("card-number", "4111111111111111");
  await app.click("complete-order");
  await app.see("Order confirmed");
}, {
  startBy: async (app) => {
    await app.open("https://mystore.com/products");
    await app.click("add-to-cart");
    await app.see("Added to cart");
  },
  finishBy: async (app) => {
    await app.screenshot("order-complete.png");
  }
});
```

### **Reusable Hooks (Multiple Tests)**

For test suites where multiple tests need the same setup, define reusable hook functions:

```javascript
// Define login setup once - reuse across all tests
const loginSetup = async (app) => {
  await app.open("https://myapp.com/login");
  await app.type("email", "user@test.com");
  await app.type("password", "secure123");
  await app.click("login");
  await app.see("Dashboard");
};

// Define cleanup once
const takeScreenshot = async (app) => {
  await app.screenshot("test-complete.png");
};

// Use in multiple tests
latte("user can view profile", async (app) => {
  // Already logged in from loginSetup
  await app.click("profile");
  await app.see("User Profile");
}, { 
  startBy: loginSetup,
  finishBy: takeScreenshot 
});

latte("user can edit settings", async (app) => {
  // Already logged in from loginSetup
  await app.click("settings");
  await app.see("Account Settings");
}, { 
  startBy: loginSetup,
  finishBy: takeScreenshot 
});

latte("user can view orders", async (app) => {
  // Already logged in from loginSetup
  await app.click("orders");
  await app.see("Order History");
}, { 
  startBy: loginSetup 
});
```

**Benefits:**
- **DRY Code**: Write setup once, use everywhere
- **Maintainable**: Change login flow in one place
- **Flexible**: Mix different setups for different tests
- **Clean**: Each test clearly shows what setup it uses

## 📝 Examples

### Real Website Testing

```javascript
import { latte, group } from "latte-test";

group("Production Tests", () => {
  latte("SauceDemo login works", async (app) => {
    await app.open("https://www.saucedemo.com/");
    await app.type("#user-name", "standard_user");
    await app.type("#password", "secret_sauce");
    await app.click("#login-button");
    await app.see("Products");
  });

  latte("smart selector example", async (app) => {
    await app.open("https://mysite.com/login");
    
    // Smart selectors - Latte tries multiple strategies automatically
    await app.type("email", "test@example.com");     // Tries data-test-id, name, id, etc.
    await app.type("password", "mypassword");        // Finds password field intelligently
    await app.click("login-button");                 // Auto-finds login button
    
    // Enhanced assertions
    await app.see("Dashboard");                      // Text search
    await app.seeElement("user-menu");              // Element existence
    await app.seeAttribute("button", "aria-label", "User menu"); // Accessibility
  });
});

// Tests run automatically - no need to call runTests()!
```

### Development Testing

```javascript
import { latte } from "latte-test";

// Test your localhost during development
latte("localhost signup flow", async (app) => {
  await app.open("http://localhost:3000/signup");
  await app.type("#name", "John Doe");
  await app.type("#email", "john@example.com");
  await app.click("#create-account");
  await app.see("Account created successfully");
});
```

### Accessibility Testing

```javascript
import { latte } from "latte-test";

latte("accessibility compliance check", async (app) => {
  await app.open("https://mysite.com");
  
  // Check ARIA labels
  await app.seeAttribute("button", "aria-label", "Close modal");
  await app.seeAttribute("input", "aria-required", "true");
  
  // Check alt text for images
  await app.seeAttribute("img", "alt", "Company logo");
  
  // Check form labels
  await app.seeAttribute("input[type='email']", "aria-labelledby", "email-label");
  
  // Find content by accessibility attributes
  await app.see("Close modal");  // Finds aria-label content
  await app.see("Required field"); // Finds aria-description content
});
```

### Responsive Testing

```javascript
import { latte } from "latte-test";

latte("responsive design test", async (app) => {
  // Test desktop resolution
  await app.resolution(1920, 1080);
  
  // Verify resolution was set
  const desktopRes = await app.getResolution();
  console.log(`Desktop: ${desktopRes.width}x${desktopRes.height}`);
  
  await app.open("https://mysite.com");
  await app.screenshot("desktop-view.png");
  
  // Test mobile resolution
  await app.resolution(375, 667);
  
  const mobileRes = await app.getResolution();
  console.log(`Mobile: ${mobileRes.width}x${mobileRes.height}`);
  
  await app.screenshot("mobile-view.png");
  
  // Verify mobile navigation works
  await app.click("menu-toggle");
  await app.see("Navigation Menu");
});

latte("tablet layout test", async (app) => {
  // Set tablet resolution (iPad)
  await app.resolution(768, 1024);
  
  await app.open("https://mystore.com");
  await app.screenshot("tablet-layout.png");
  
  // Test tablet-specific interactions
  await app.click("product-grid");
  await app.see("Product Details");
});
```

### Using Expect Assertions

```javascript
import { latte, expect } from "latte-test";

latte("math works correctly", async (app) => {
  expect(2 + 2).toBe(4);
  expect("hello world").toContain("world");
  expect([1, 2, 3]).toContain(2);
  expect(true).toBeTruthy();
  expect(() => {
    throw new Error("Oops!");
  }).toThrow("Oops!");
});
```

## 🏗️ Smart Test Discovery

**Latte finds tests with intelligent prioritization:**

### **🚀 Recommended (Fast):**
```
your-project/
├── package.json
└── tests/                  # ⚡ Searched first (fastest)
    ├── login.test.js
    ├── cart.latte.ts
    └── auth.spec.tsx
```

### **🔍 Also Supported:**
```
your-project/
├── package.json
├── test/                   # ✅ Common folder
├── __tests__/              # ✅ React/Jest style  
├── e2e/                    # ✅ End-to-end tests
├── login.test.js           # ✅ Root level
└── src/
    └── components.test.tsx # ✅ Alongside source
```

**Search Priority:** `tests/` → `test/` → `__tests__/` → `e2e/` → everywhere else

**Run `npx latte` and it finds them all!** 🔍

## 🌐 Browser Options

Latte runs in **headless mode by default** (no visible browser window) for fast execution. You can customize this:

### 🔧 Default (Headless)
```javascript
latte("runs invisibly", async (app) => {
  await app.open("https://mysite.com");
  await app.type("#email", "test@example.com");
  await app.click("#submit");
  await app.see("Success!");
}); // Runs in background, no window visible
```

### 👀 Show Browser Window
```javascript
latte("watch the test run", async (app) => {
  await app.open("https://mysite.com");
  await app.type("#email", "test@example.com");
  await app.click("#submit");
  await app.see("Success!");
}, { 
  headless: false,    // Show Chromium window
  timeout: 10000      // Custom timeout (default: 5000ms)
});
```

### 🎯 When to Use Each Mode:

- **Headless (default)**: CI/CD, automated testing, production monitoring
- **Visible browser**: Development, debugging, demos, watching tests run

## 🧪 Framework Validation

Latte includes a comprehensive validation suite to ensure reliability:

```bash
# Run validation tests (for framework development)
npm run validate
```

The validation suite tests:
- ✅ Core functionality against real websites
- ✅ Smart selector strategies  
- ✅ Error handling and edge cases
- ✅ Performance and timing
- ✅ Cross-browser compatibility

## 📘 TypeScript Support

Latte works seamlessly with TypeScript! Just use `.ts` or `.tsx` extensions:

```typescript
// auth.test.ts
import { latte, expect } from "latte-test";

interface User {
  username: string;
  email: string;
}

latte("user registration works", async (app) => {
  await app.open("/register");
  await app.type("#username", "newuser");
  await app.type("#email", "user@example.com");
  await app.type("#password", "secure123");
  await app.click("#register-button");
  await app.see("Registration successful");
  
  // TypeScript assertions
  const state = app.getState();
  expect(state.username).toBe("newuser");
});
```

**Note**: For TypeScript support, install `tsx` and optionally `@types/node`:
```bash
npm install tsx @types/node
```
Puppeteer is installed automatically with Latte.

## 🎯 Philosophy

### Flow-First Approach
Tests follow the pattern: **Open → Type → Click → See**

```javascript
latte("user completes checkout", async (app) => {
  await app.open("https://mystore.com/checkout");     // Open
  await app.type("#email", "user@example.com");       // Type
  await app.click("#submit");                          // Click
  await app.see("Order confirmed");                    // See
});
```

### Readable Tests
Tests should read like step-by-step instructions that anyone can understand:

```javascript
// ✅ Good - reads like instructions
latte("user can reset password", async (app) => {
  await app.open("https://mysite.com/forgot-password");
  await app.type("#email", "user@example.com");
  await app.click("#send-reset");
  await app.see("Reset email sent");
});

// ❌ Avoid - too technical
latte("POST /auth/reset returns 200", async (app) => {
  // complex API testing setup...
});
```

## 🔧 Advanced Usage

### Optional Grouping

```javascript
import { group, latte } from "latte-test";

group("Authentication", () => {
  latte("login works", async (app) => { /* ... */ });
  latte("logout works", async (app) => { /* ... */ });
});

group("Shopping", () => {
  latte("add to cart", async (app) => { /* ... */ });
  latte("checkout", async (app) => { /* ... */ });
});
```

### Debugging Tests

```javascript
latte("debug example", async (app) => {
  await app.open("https://mysite.com/login");
  await app.type("#username", "user");
  
  // Debug: Check current page state
  console.log("Current URL:", await app.getCurrentUrl());
  console.log("Page content:", await app.getContent());
  console.log("Interaction logs:", app.getLogs());
  
  // Take screenshot for debugging
  await app.screenshot("debug-login.png");
  
  await app.click("#login-button");
  await app.see("Welcome back, user!");
}, { headless: false }); // Show browser for debugging
```

## 🤝 Contributing

Latte is designed to be simple and focused. When contributing:

1. Keep the API minimal and readable
2. Maintain the "beginner-friendly" philosophy
3. Ensure tests read like plain English
4. Add examples for new features

## 📄 License

MIT License - feel free to use Latte in your projects!

---

**Happy Testing! ☕**

*Latte makes testing flows as smooth as your morning coffee.*
