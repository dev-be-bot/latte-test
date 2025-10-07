# ☕ Latte

> **Lightweight Flow-Based Testing Framework for Real Browsers**

Latte makes browser testing simple with a clean, readable API that works with any website. Test login flows, shopping carts, and user journeys with minimal setup.

## 🚀 Quick Start

```bash
# Install
npm install latte-test

# Run tests
npx latte
```

## ✨ Example

```javascript
import { latte } from "latte-test";

latte("login flow works", async (app) => {
  await app.open("https://example.com/login");
  await app.type("#email", "test@example.com");
  await app.type("#password", "secure123");
  await app.click("Sign In");
  await app.see("Welcome back!");
});
```

## 📖 Documentation

For complete documentation, examples, and API reference, visit:

🌐 [**docs.latte.run**](https://docs.latte.run)

## 💡 Why Latte?

- **Zero Configuration** - Just install and start testing
- **Smart Selectors** - No more brittle CSS selectors
- **Real Browser** - Test in a real Chromium instance
- **TypeScript Ready** - Full TypeScript support out of the box
- **Beginner Friendly** - Readable, chainable API

## 📦 What's Included

- Puppeteer for browser automation
- Smart test discovery
- Built-in assertions
- Headless by default (with visible browser option)
- Works with any website (localhost, staging, production)

