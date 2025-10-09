# ☕ Latte — Simple Website Testing

Test your websites like a real user would - **no coding experience required!**

Latte opens a real browser, clicks buttons, fills forms, and checks if your website works correctly.

## ✨ What Latte Does

- **Opens websites** in a real browser (Chrome)
- **Clicks buttons and links** automatically  
- **Fills out forms** with test data
- **Checks if text appears** on your pages
- **Takes screenshots** when things go wrong
- **Works on any website** - yours or others

## 🚀 Super Quick Start

**Step 1:** Install Latte
```bash
npm install latte-test
```

**Step 2:** Create a test file (name it anything ending in `.test.js` `test.ts`, `.test.tsx`)
```javascript
// my-website.test.js
import { latte } from "latte-test";

latte("check if my website works", async (app) => {
  await app.open("https://example.com");
  await app.see("Example Domain");
});
```

**Step 3:** Run your test
```bash
npx latte
```

**That's it!** Latte will open a browser, visit your website, and check if it works.

## 📝 Simple Examples

### Test a Login Form
```javascript
// login.test.js
import { latte } from "latte-test";

latte("user can log in", async (app) => {
  await app.open("https://mywebsite.com/login");
  await app.type("#email", "test@example.com");
  await app.type("#password", "mypassword");
  await app.click("#login-button");
  await app.see("Welcome!");
});
```

### Test a Contact Form
```javascript
// contact.test.js
import { latte } from "latte-test";

latte("contact form works", async (app) => {
  await app.open("https://mywebsite.com/contact");
  await app.type("#name", "John Doe");
  await app.type("#email", "john@example.com");
  await app.type("#message", "Hello there!");
  await app.click("#send");
  await app.see("Message sent");
});
```

### Test Your Local Development Site
```javascript
// localhost.test.js
import { latte } from "latte-test";

latte("my local site works", async (app) => {
  await app.open("http://localhost:3000");
  await app.see("My Website");
  await app.click("About");
  await app.see("About Us");
});
```

### Test Mobile vs Desktop
```javascript
// mobile-test.test.js
import { latte } from "latte-test";

latte("mobile menu works", async (app) => {
  await app.resolution(375, 667); // Set to iPhone size
  await app.open("https://mywebsite.com");
  await app.click("Menu"); // Mobile hamburger menu
  await app.see("Navigation");
});

latte("desktop navigation works", async (app) => {
  await app.resolution(1920, 1080); // Set to desktop size
  await app.open("https://mywebsite.com");
  await app.click("About"); // Desktop navigation link
  await app.see("About Us");
});
```

## 🏃 Running Tests

```bash
# Run all your tests
npx latte

# Run just one test file
npx latte login.test.js
```

**When tests pass:**
```
☕ Latte Test Framework v2.6.0

✅ user can log in
✅ contact form works

📊 2 passed, 0 failed
✅ All tests passed
```

**When tests fail:**
```
☕ Latte Test Framework v2.6.0

❌ user can log in
   Expected to see "Welcome!" but it was not found on the page

📊 0 passed, 1 failed
❌ Tests failed
```

## 🎯 What You Can Do

### Basic Commands
```javascript
// Open a website
await app.open("https://mywebsite.com");

// Type in form fields
await app.type("#email", "test@example.com");
await app.type("#password", "mypassword");

// Click buttons and links
await app.click("#login-button");
await app.click("Submit");

// Check if text appears on the page
await app.see("Welcome!");
await app.see("Login successful");

// Wait a moment (useful for slow pages)
await app.wait(2000); // Wait 2 seconds

// Set browser size (useful for mobile/desktop testing)
await app.resolution(375, 667); // iPhone size
await app.resolution(1920, 1080); // Desktop size
```

### Finding Elements on Your Website

**Don't know coding?** No problem! Here's how to find the right names for buttons and form fields:

#### Method 1: Use the Text You See
The easiest way - just use the text that appears on buttons:
```javascript
await app.click("Login");        // Click the "Login" button
await app.click("Submit");       // Click the "Submit" button  
await app.click("Sign Up");      // Click the "Sign Up" button
await app.click("Contact Us");   // Click the "Contact Us" link
```

#### Method 2: Right-Click to Inspect (5 seconds)
1. **Right-click** on any button or form field on your website
2. **Click "Inspect"** (opens developer tools)
3. **Look for these in the highlighted code:**
   - `id="something"` → Use `#something`
   - `name="something"` → Use `something`
   - `class="something"` → Use `.something`

**Example:** If you see `<input id="email-field">`, use:
```javascript
await app.type("#email-field", "test@example.com");
```

#### Method 3: Common Names That Usually Work
Most websites use these standard names:
```javascript
// For login forms
await app.type("email", "test@example.com");
await app.type("username", "testuser");
await app.type("password", "mypassword");
await app.click("login");

// For contact forms  
await app.type("name", "John Doe");
await app.type("message", "Hello!");
await app.click("send");

// For search
await app.type("search", "what I'm looking for");
await app.click("Search");
```

#### Method 4: Try Different Variations
If one doesn't work, try these variations:
```javascript
// If "Login" doesn't work, try:
await app.click("#login");
await app.click("#login-btn");  
await app.click("#login-button");
await app.click(".login");

// If "email" doesn't work, try:
await app.type("#email");
await app.type("#email-input");
await app.type("#email-field");
```

### 🎯 Quick Reference: What to Look For

When you right-click → Inspect, you'll see HTML code. Here's what to copy:

```html
<!-- If you see this HTML: -->
<input id="email" type="email">
<!-- Use this in your test: -->
await app.type("#email", "test@example.com");

<!-- If you see this HTML: -->
<input name="username" type="text">
<!-- Use this in your test: -->
await app.type("username", "myname");

<!-- If you see this HTML: -->
<button class="submit-btn">Submit</button>
<!-- Use this in your test: -->
await app.click(".submit-btn");

<!-- If you see this HTML: -->
<button>Login</button>
<!-- Use this in your test: -->
await app.click("Login");
```

**Remember:** 
- `id="something"` → Use `#something`
- `name="something"` → Use `something` (no symbol)
- `class="something"` → Use `.something`
- Button text → Use the exact text you see

## 🔧 Debugging Tips

### Take Screenshots
```javascript
latte("debug my test", async (app) => {
  await app.open("https://mywebsite.com");
  await app.screenshot("step1.png");  // See what the page looks like
  
  await app.type("#email", "test@example.com");
  await app.screenshot("step2.png");  // See after typing
  
  await app.click("#login");
  await app.screenshot("step3.png");  // See the result
});
```

### Common Issues & Solutions

#### ❌ "Element not found" 
**What it means:** Latte can't find the button or form field you're trying to click/type in.

**How to fix:**
1. **Check spelling** - Make sure you typed the name exactly right
2. **Try the text instead** - Use `await app.click("Login")` instead of `#login`
3. **Right-click → Inspect** the element and copy the exact `id` or `name`
4. **Wait for the page** - Add `await app.wait(3000)` before clicking

#### ❌ "Expected to see 'Welcome' but it was not found"
**What it means:** The text you're looking for doesn't appear on the page.

**How to fix:**
1. **Check exact spelling** - "Welcome!" vs "Welcome" vs "welcome"
2. **Take a screenshot** - Use `await app.screenshot("debug.png")` to see what's actually on the page
3. **Wait longer** - Some pages load slowly: `await app.wait(5000)`
4. **Check if you're on the right page** - Maybe the login failed?

#### ⏰ Test is too slow
**How to fix:**
- Add waits for slow pages: `await app.wait(2000)`
- Take screenshots to see what's happening: `await app.screenshot("step1.png")`

## 🎉 That's It!

You now know everything you need to test your websites with Latte:

1. **Install**: `npm install latte-test`
2. **Create test files**: `my-test.test.js`
3. **Use simple commands**: `app.open()`, `app.type()`, `app.click()`, `app.see()`, `app.resolution()`
4. **Run tests**: `npx latte`

### Need Help?
- Check the screenshots Latte creates when tests fail
- Make sure your button/field IDs are correct
- Verify the exact text appears on your page

**Happy testing! ☕**
