# ☕ Latte — Lightweight Flow-Based Testing Framework

Latte is a super simple testing framework designed to test **real websites** (like login, cart, or other user flows) in a readable, beginner-friendly way using **real browser automation**.

## 🌟 Features

- **Real Browser Testing**: Uses Puppeteer + Chromium to test actual websites
- **Test Any Website**: localhost, staging, production, public sites - all work
- **Readable**: Tests look like plain English, easy to understand
- **Minimal**: No complex setup, imports, or configuration files
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

### Write Your First Test

Create a test file with any supported extension:
- `.latte.js/.latte.ts/.latte.tsx` (recommended)
- `.test.js/.test.ts/.test.tsx` 
- `.spec.js/.spec.ts/.spec.tsx`

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
npx latte
```

Output:
```
☕ Latte - Lightweight Flow-Based Testing Framework

🔍 Found 1 test file(s):
   login.test.js

📄 Running login.test.js:
🧪 Running Latte tests...

✅ user can log in to my site
✅ localhost login works

==================================================
📊 Results: 2 passed, 0 failed
🎉 All tests passed!
```

**What just happened?**
- Latte launched real Chromium browser (headless)
- Made actual HTTP requests to your websites
- Interacted with real DOM elements
- Validated actual page content
- Detected real issues if any exist

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
| `app.type(selector, value)` | Type text into an input field (real typing) |
| `app.click(selector)` | Click an element (real mouse click) |
| `app.see(text)` | Assert that text exists on the page (real content check) |

### 3. Assertions

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

  latte("my production site works", async (app) => {
    await app.open("https://mysite.com/login");
    await app.type("#email", "test@example.com");
    await app.type("#password", "mypassword");
    await app.click("#login-btn");
    await app.see("Dashboard");
  });
});
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

## 🏗️ Flexible File Organization

**Latte finds test files anywhere in your project!** No special folders required:

```
your-project/
├── package.json
├── login.test.js           # ✅ Root level
├── tests/
│   ├── auth.latte.js       # ✅ Tests folder
│   └── cart.spec.ts        # ✅ Mixed extensions
├── src/
│   └── components.test.tsx # ✅ Alongside source code
├── e2e/
│   └── flows.test.js       # ✅ E2E folder
└── any-folder/
    └── more.latte.ts       # ✅ Any folder works!
```

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
