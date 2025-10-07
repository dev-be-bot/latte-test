# 🧪 Latte Framework Validation Suite

This directory contains comprehensive validation tests to ensure the Latte framework works correctly before publishing new versions.

## What It Tests

### Core Framework Features
- ✅ Basic navigation (`app.open()`)
- ✅ Text search (`app.see()`)
- ✅ Enhanced assertions (HTML, CSS selectors, case-insensitive)
- ✅ Element existence (`app.seeElement()`)
- ✅ Attribute validation (`app.seeAttribute()`)
- ✅ Form interactions (`app.type()`, `app.click()`)
- ✅ Timing functions (`app.wait()`)

### Real Website Integration
- ✅ **example.com** - Basic functionality testing
- ✅ **github.com** - Complex real website
- ✅ **wikipedia.org** - Search functionality
- ✅ **httpbin.org** - Form testing

### Error Handling
- ✅ Non-existent text handling
- ✅ Non-existent element handling  
- ✅ Invalid URL handling
- ✅ Timeout behavior

### Performance
- ✅ Wait functionality accuracy
- ✅ Timeout handling

## How to Run

### Option 1: NPM Script (Recommended)
```bash
npm run validate
```

### Option 2: Direct Execution
```bash
node bin/latte.js validation/validation.test.js
```

### Option 3: Validation Script
```bash
node scripts/validate.js
```

## Expected Output

When all tests pass, you should see:
```
✅ VALIDATION PASSED!

All tests completed successfully. The framework is ready for publishing.
```

When tests fail, you'll see detailed error information to help debug issues.

## Pre-Publish Checklist

Before publishing a new version:

1. **Run validation**: `npm run validate`
2. **Check all tests pass**: Look for "✅ VALIDATION PASSED!"
3. **Review any failures**: Fix issues if validation fails
4. **Update version**: Bump version in `package.json`
5. **Publish**: `npm publish`

## Adding New Tests

To add new validation tests, edit `validation.test.js`:

```javascript
latte("your new test", async (app) => {
  await app.open("https://your-test-site.com");
  await app.see("Expected Content");
  // Add your test logic
});
```

## Notes

- Tests use real websites, so occasional failures due to site changes are expected
- Network connectivity is required
- Tests run in headless mode by default
- Each test is isolated with a fresh browser instance
