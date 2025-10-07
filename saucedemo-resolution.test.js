latte("watch the test run", async (app) => {
  await app.open("https://saucedemo.com");
  await app.type("#email", "test@example.com");
  await app.click("#submit");
  await app.see("Success!");
}, { 
  headless: false,    // Show Chromium window
  timeout: 10000      // Custom timeout (default: 5000ms)
});
