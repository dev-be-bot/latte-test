import { latte, group } from "latte-test";

// Simple browser tests - all tests run in real Chromium browser
group("SauceDemo Tests (TSX)", () => {

  latte("login with correct credentials", async (app) => {
    await app.open("https://www.saucedemo.com/");
    await app.type("#user-name", "standard_user");
    await app.type("#password", "secret_sauce");
    await app.click("#login-button");
    await app.see("Products");
  });

  latte("login with wrong password", async (app) => {
    await app.open("https://www.saucedemo.com/");
    await app.type("#user-name", "standard_user");
    await app.type("#password", "wrong_password");
    await app.click("#login-button");
    await app.see("Epic sadface: Username and password do not match any user in this service");
  });


});
