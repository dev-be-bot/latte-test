import { latte, group } from "latte-test";

// Complete Pabau login flow
group("Pabau Login Tests", () => {

  latte("complete login flow with smart selectors", async (app) => {
    // Try to mimic a real browser more closely
    await app.open("https://staging.pabau.com/login?referrer");
    await app.wait(3000);
    
    
    // Fill login form
    await app.click("email");
    await app.type("email", "tomislav.karovski@pabau.com");
    
    await app.click("password");
    await app.type("password", "Releaseteam123@");
    await app.click("Confirm");
        
    await app.wait(5000); // Wait for button to become enabled
    await app.screenshot("login.png")
      await app.see("Personal Dashboard");
      await app.see("Dashboard");
    });
});

