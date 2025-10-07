import { latte, group } from "latte-test";

// Enhanced selector testing - all tests run in real Chromium browser
group("Enhanced Selector Tests", () => {

  latte("test flexible smart selectors", async (app) => {
    await app.open("https://www.staging.pabau.com/");
    await app.wait(3000);
    await app.click("email");
    await app.type("email", "tomislav.karovski@pabau.com");
    await app.click("Password");
    await app.type("Password", "Releaseteam123@")
    await app.click("loginSubmitButton")
  });
});
