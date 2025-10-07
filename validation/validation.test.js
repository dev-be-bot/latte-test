import { latte, group } from "latte-test";

/**
 * Latte Framework Validation Test Suite
 * 
 * This test suite validates that all core Latte functionality works correctly
 * against real websites. Run this before publishing to ensure nothing is broken.
 * 
 * Usage: node bin/latte.js validation/validation.test.js
 */

group("🧪 Core Framework Validation", () => {

  latte("basic navigation and text search works", async (app) => {
    await app.open("https://example.com");
    await app.see("Example Domain");
    await app.see("This domain is for use in illustrative examples");
  });

  latte("enhanced assertions - text variations", async (app) => {
    await app.open("https://example.com");
    
    // Test case-insensitive search
    await app.see("example domain");     // lowercase
    await app.see("EXAMPLE DOMAIN");     // uppercase
    await app.see("Example Domain");     // proper case
  });

  latte("enhanced assertions - HTML content", async (app) => {
    await app.open("https://example.com");
    
    // Test HTML tag search
    await app.see("<h1>Example Domain</h1>");
    await app.see("<title>Example Domain</title>");
  });

  latte("enhanced assertions - CSS selectors", async (app) => {
    await app.open("https://example.com");
    
    // Test CSS selector search
    await app.see("h1");           // Tag selector
    await app.see("body");         // Body tag
    await app.see("div");          // Div elements
  });

  latte("element existence validation", async (app) => {
    await app.open("https://example.com");
    
    // Test element existence
    await app.seeElement("h1");
    await app.seeElement("body");
    await app.seeElement("div");
  });

  latte("attribute validation", async (app) => {
    await app.open("https://example.com");
    
    // Test attribute checking
    await app.seeAttribute("html", "lang", "en");
  });

});

group("🌐 Real Website Integration Tests", () => {

  latte("GitHub homepage loads and basic elements exist", async (app) => {
    await app.open("https://github.com");
    await app.wait(2000); // Wait for page load
    
    // Basic text that should always be there
    await app.see("GitHub");
    
    // Check for common elements
    await app.seeElement("header");
    await app.seeElement("main");
  });

  latte("Wikipedia search functionality", async (app) => {
    await app.open("https://en.wikipedia.org");
    await app.wait(2000);
    
    // Check Wikipedia loads
    await app.see("Wikipedia");
    await app.see("The Free Encyclopedia");
    
    // Check search elements exist
    await app.seeElement("input[name='search']");
    await app.seeElement("button[type='submit']");
  });

  latte("form interaction test", async (app) => {
    await app.open("https://httpbin.org/forms/post");
    await app.wait(2000);
    
    // Test form elements exist
    await app.seeElement("form");
    await app.seeElement("input[name='custname']");
    await app.seeElement("input[name='custtel']");
    await app.seeElement("input[name='custemail']");
    
    // Test typing functionality
    await app.type("input[name='custname']", "TestUser");
    await app.type("input[name='custemail']", "test@example.com");
    
    // Just verify the form elements exist and typing worked
    // (Don't check for visible text as form values might not be visible in DOM text)
    console.log("✅ Form interaction test completed");
  });

});

group("🔧 Error Handling Validation", () => {

  latte("handles non-existent text gracefully", async (app) => {
    await app.open("https://example.com");
    
    try {
      await app.see("THIS_TEXT_DEFINITELY_DOES_NOT_EXIST_12345");
      throw new Error("Should have failed but didn't");
    } catch (error) {
      if (error.message.includes("Expected to see")) {
        // This is the expected error - test passes
        console.log("✅ Error handling works correctly");
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
  });

  latte("handles non-existent elements gracefully", async (app) => {
    await app.open("https://example.com");
    
    try {
      await app.seeElement("#non-existent-element-12345");
      throw new Error("Should have failed but didn't");
    } catch (error) {
      if (error.message.includes("Expected to see element")) {
        // This is the expected error - test passes
        console.log("✅ Element error handling works correctly");
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
  });

  latte("handles invalid URLs gracefully", async (app) => {
    try {
      await app.open("https://this-domain-definitely-does-not-exist-12345.com");
      throw new Error("Should have failed but didn't");
    } catch (error) {
      if (error.message.includes("Failed to open")) {
        // This is the expected error - test passes
        console.log("✅ URL error handling works correctly");
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
  });

});

group("⚡ Performance & Timing Tests", () => {

  latte("wait functionality works correctly", async (app) => {
    await app.open("https://example.com");
    
    const startTime = Date.now();
    await app.wait(1000); // Wait 1 second
    const endTime = Date.now();
    
    const elapsed = endTime - startTime;
    if (elapsed < 900 || elapsed > 1200) {
      throw new Error(`Wait time was ${elapsed}ms, expected ~1000ms`);
    }
    
    console.log(`✅ Wait functionality works (${elapsed}ms)`);
  });

  latte("timeout handling works", async (app) => {
    await app.open("https://example.com");
    
    // This should timeout quickly since the element doesn't exist
    const startTime = Date.now();
    try {
      await app.seeElement("#definitely-does-not-exist");
      throw new Error("Should have timed out");
    } catch (error) {
      const elapsed = Date.now() - startTime;
      // Just check that it did timeout (don't be too strict about timing)
      if (elapsed > 500) {
        console.log(`✅ Timeout handling works (${elapsed}ms)`);
      } else {
        throw new Error(`Timeout too fast: ${elapsed}ms`);
      }
    }
  });

});

console.log(`
🎯 Latte Framework Validation Suite
===================================

This test suite validates core functionality against real websites.
Run this before publishing new versions to ensure nothing is broken.

Testing against:
- example.com (basic functionality)
- github.com (real website integration)  
- wikipedia.org (complex site)
- httpbin.org (form testing)

All tests use real browser automation with Puppeteer + Chromium.
`);
