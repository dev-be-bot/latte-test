import { latte } from "../src/index.js";

// Define the login setup once - reusable across all tests
const loginSetup = async (app) => {
  await app.open("https://www.saucedemo.com/");
  await app.type("#user-name", "standard_user");
  await app.type("#password", "secret_sauce");
  await app.click("#login-button");
  await app.see("Products");
};

// Define a cleanup function too
const takeScreenshot = async (app) => {
  await app.screenshot("test-complete.png");
};

// Test 1 - Add item to cart
latte("user can add backpack to cart", async (app) => {
  // Already logged in from loginSetup
  await app.click("#add-to-cart-sauce-labs-backpack");
  await app.see("Remove"); // Button changes after adding
}, { 
  startBy: loginSetup,
  finishBy: takeScreenshot 
});

// Test 2 - Add different item to cart  
latte("user can add bike light to cart", async (app) => {
  // Already logged in from loginSetup
  await app.click("#add-to-cart-sauce-labs-bike-light");
  await app.see("Remove");
}, { 
  startBy: loginSetup,
  finishBy: takeScreenshot 
});

// Test 3 - View cart
latte("user can view shopping cart", async (app) => {
  // Already logged in from loginSetup
  await app.click(".shopping_cart_link");
  await app.see("Your Cart");
}, { 
  startBy: loginSetup 
});

// Test 4 - Sort products
latte("user can sort products by price", async (app) => {
  // Already logged in from loginSetup
  await app.click(".product_sort_container");
  await app.click("[value='lohi']"); // Price low to high
  await app.see("Products");
}, { 
  startBy: loginSetup 
});

// Test 5 - View product details
latte("user can view product details", async (app) => {
  // Already logged in from loginSetup
  await app.click("#item_4_title_link"); // Backpack link
  await app.see("Sauce Labs Backpack");
  await app.see("$29.99");
}, { 
  startBy: loginSetup 
});
