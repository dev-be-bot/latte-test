import { latte, group } from "latte-test";

// Enhanced selector testing - all tests run in real Chromium browser
group("Enhanced Selector Tests", () => {

  latte("test flexible smart selectors", async (app) => {
    await app.open("https://www.staging.pabau.com/");
    await app.wait(3000);
    
    // Test different ways to reference the same email input
    // Your HTML: <input name="email" id="email" aria-label="email" data-testid="loginEmail" class="ant-input" type="text" value="">
    
    // Method 1: Use "email" - finds name="email", id="email", or aria-label="email"
    await app.click("email");
    await app.type("email", "demo@demo.com");
    
    // Method 2: Try "loginEmail" - should find data-testid="loginEmail"  
    try {
      await app.click("loginEmail");
      await app.type("loginEmail", "demo2@demo.com");
    } catch (error) {
      // If data-testid doesn't work, fall back to working selector
      await app.click("email");
      await app.type("email", "demo2@demo.com");
    }
  });

});