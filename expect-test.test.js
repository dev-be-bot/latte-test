import { latte, expect } from "./src/index.js";

latte("all expect assertions work correctly", async (app) => {
  console.log("🧪 Testing all expect assertions...");
  
  // 1. toBe - strict equality (Object.is)
  expect(5).toBe(5);
  expect("hello").toBe("hello");
  expect(true).toBe(true);
  console.log("✅ toBe() works");
  
  // 2. not.toBe - negated strict equality
  expect(5).not.toBe(10);
  expect("hello").not.toBe("world");
  expect(true).not.toBe(false);
  console.log("✅ not.toBe() works");
  
  // 3. toEqual - deep equality
  expect([1, 2, 3]).toEqual([1, 2, 3]);
  expect({name: "John", age: 30}).toEqual({name: "John", age: 30});
  expect("test").toEqual("test");
  console.log("✅ toEqual() works");
  
  // 4. toContain - substring/array contains
  expect("hello world").toContain("world");
  expect([1, 2, 3, 4]).toContain(3);
  expect("JavaScript").toContain("Script");
  console.log("✅ toContain() works");
  
  // 5. toBeTruthy - truthy values
  expect(true).toBeTruthy();
  expect(1).toBeTruthy();
  expect("hello").toBeTruthy();
  expect([1]).toBeTruthy();
  expect({}).toBeTruthy();
  console.log("✅ toBeTruthy() works");
  
  // 6. toBeFalsy - falsy values
  expect(false).toBeFalsy();
  expect(0).toBeFalsy();
  expect("").toBeFalsy();
  expect(null).toBeFalsy();
  expect(undefined).toBeFalsy();
  console.log("✅ toBeFalsy() works");
  
  // 7. toBeNull - null check
  expect(null).toBeNull();
  expect(undefined).not.toBeNull();
  expect(0).not.toBeNull();
  console.log("✅ toBeNull() works");
  
  // 8. toBeUndefined - undefined check
  expect(undefined).toBeUndefined();
  expect(null).not.toBeUndefined();
  expect(0).not.toBeUndefined();
  console.log("✅ toBeUndefined() works");
  
  // 9. toThrow - function throws error
  expect(() => {
    throw new Error("Test error");
  }).toThrow("Test error");
  
  expect(() => {
    throw new Error("Something went wrong");
  }).toThrow("went wrong");
  
  expect(() => {
    return "no error";
  }).not.toThrow();
  console.log("✅ toThrow() works");
  
  console.log("🎉 ALL EXPECT ASSERTIONS WORK PERFECTLY!");
});
