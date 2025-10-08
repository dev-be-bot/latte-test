import { latte } from "../src/index.js";

// Example 1: Login setup with hooks
latte("user can view products after login", async (app) => {
  // Main test - already logged in from startBy
  await app.see("Products");
  await app.click("#add-to-cart-sauce-labs-backpack");
  await app.see("Add to cart"); // Button changes to "Remove" after adding
}, {
  startBy: async (app) => {
    // Set up login before the test
    await app.open("https://www.saucedemo.com/");
    await app.type("#user-name", "standard_user");
    await app.type("#password", "secret_sauce");
    await app.click("#login-button");
    await app.see("Products");
  },
  finishBy: async (app) => {
    // Take screenshot after test completes
    await app.screenshot("products-test-complete.png");
  }
});

// Example 2: Mobile resolution testing
latte("mobile menu works correctly", async (app) => {
  await app.open("https://www.saucedemo.com/");
  await app.type("#user-name", "standard_user");
  await app.type("#password", "secret_sauce");
  await app.click("#login-button");
  await app.see("Products");
}, {
  startBy: async (app) => {
    // Set mobile resolution before test
    await app.resolution(375, 667); // iPhone size
  },
  finishBy: async (app) => {
    // Capture mobile layout
    await app.screenshot("mobile-layout.png");
  }
});

// Example 3: Data preparation and cleanup
latte("shopping cart shows added items", async (app) => {
  // Main test - cart already has items from startBy
  await app.click(".shopping_cart_link");
  await app.see("Sauce Labs Backpack"); // Item should be in cart
  await app.see("Sauce Labs Bike Light"); // Second item should be in cart
}, {
  startBy: async (app) => {
    // Prepare test data - add items to cart
    await app.open("https://www.saucedemo.com/");
    await app.type("#user-name", "standard_user");
    await app.type("#password", "secret_sauce");
    await app.click("#login-button");
    await app.see("Products");
    
    // Add multiple items to cart
    await app.click("#add-to-cart-sauce-labs-backpack");
    await app.click("#add-to-cart-sauce-labs-bike-light");
    await app.see("2"); // Cart badge should show 2 items
  },
  finishBy: async (app) => {
    // Clean up - take final screenshot
    await app.screenshot("cart-items-complete.png");
  }
});

// Example 4: Simple test without hooks (still works!)
latte("basic login still works without hooks", async (app) => {
  await app.open("https://www.saucedemo.com/");
  await app.type("#user-name", "standard_user");
  await app.type("#password", "secret_sauce");
  await app.click("#login-button");
  await app.see("Products");
});
