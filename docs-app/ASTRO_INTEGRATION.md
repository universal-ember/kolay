# Astro Integration Progress Report

## Objective
Convert the docs-app to use Astro with the ember-astro integration as specified in https://github.com/ember-tooling/ember-astro

## Current Status: Partial Integration ⚠️

### ✅ What's Working

1. **Astro Infrastructure**
   - Astro 5.16.9 installed and configured
   - ember-astro 0.1.3 integration active
   - @astrojs/node adapter configured for SSR
   - Development server runs on port 4321
   
2. **Build Configuration**
   - `astro.config.mjs` created with ember integration
   - Kolay Vite plugin integrated
   - unplugin-info configured for git/build info
   - TypeScript configuration updated

3. **Simple Components**
   - Basic Ember components work perfectly with `client:only="ember"`
   - Example: `HelloWorld.gts` component renders successfully
   - Proves ember-astro integration is functional

4. **Project Structure**
   - Astro pages directory (`src/pages/`)
   - Base layout (`src/layouts/BaseLayout.astro`)
   - Package.json scripts updated (`pnpm start` uses Astro)

### ❌ What's Not Working

**The Full Kolay Application Cannot Run**

**Root Cause:** Architectural mismatch between:
- **Kolay**: Full Ember SPA with routing, services, and application context
- **ember-astro**: Designed for individual, standalone Ember components

**Specific Issues:**

1. **Missing Services**
   ```
   TypeError: owner.lookup is not a function
   ```
   - `ember-page-title` needs page-title service
   - `ember-mobile-menu` needs fastboot service  
   - Kolay components need router service

2. **Application Context**
   - ember-astro uses `renderComponent` from `@ember/renderer`
   - This provides a minimal owner, not a full Application instance
   - Services aren't registered or available

3. **Routing**
   - Kolay uses Ember's router for SPA navigation
   - Astro uses file-based routing
   - These two routing systems conflict

## Technical Details

### What ember-astro Provides
```javascript
// From ember-astro/src/client.js
renderComponent(component, { into: element })
```
- Renders individual components
- Provides basic owner context
- No application services
- No routing

### What Kolay Needs
```typescript
// From docs-app/src/app.ts
class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(registry);
  // Full application with services
}
```
- Full Application instance
- Service registry (router, page-title, etc.)
- Route handlers
- Application boot lifecycle

## Attempted Solutions

### Attempt 1: Direct Component Usage ❌
```astro
<KolayApp client:only="ember" />
```
**Result:** Missing services error

### Attempt 2: Manual Application Setup ❌
```typescript
// Created Application instance in component constructor
const app = App.create(config.APP);
setOwner(this, app);
```
**Result:** Registry loading fails, imports unresolved

### Attempt 3: Hybrid Approach ❌
```astro
<script type="module">
  import Application from '../app.ts';
  Application.create(config.APP);
</script>
```
**Result:** TypeScript not transpiled in script tags

## Recommendations

### Option A: Refactor to Astro Pages (High Effort)
**Pros:**
- Full Astro integration
- Better performance potential
- File-based routing

**Cons:**
- Significant rewrite required
- Would change app architecture fundamentally
- All routing logic needs reimplementation

**Steps:**
1. Convert each "documentation page" to an Astro page
2. Use Ember components for interactive elements only
3. Remove Ember routing entirely
4. Reimplement navigation with Astro's router

### Option B: Keep Ember App, Use Astro as Wrapper (Low Effort)
**Pros:**
- Minimal changes
- App keeps working as-is
- Can still use Astro for other features

**Cons:**
- Not a true Astro integration
- Doesn't leverage Astro's benefits
- ember-astro not really utilized

**Steps:**
1. Keep existing Ember app structure
2. Use Astro only to serve the HTML shell
3. Boot Ember app traditionally
4. Use ember-astro for documentation examples only

### Option C: Wait for Enhanced ember-astro Support
**Pros:**
- Proper integration eventually
- Might support full apps in future

**Cons:**
- Unknown timeline
- May never support full SPA apps
- Blocking on external dependency

**Steps:**
1. File issue with ember-astro project
2. Contribute full app support if needed
3. Use Option B in the meantime

## Files Modified

- `docs-app/package.json` - Updated scripts for Astro
- `docs-app/astro.config.mjs` - New Astro configuration
- `docs-app/tsconfig.json` - Added Astro types
- `docs-app/src/env.d.ts` - Astro environment types
- `docs-app/src/layouts/BaseLayout.astro` - Page layout
- `docs-app/src/pages/index.astro` - Main page
- `docs-app/src/pages/[...slug].astro` - Catch-all route
- `docs-app/src/components/hello-world.gts` - Test component (works!)
- `docs-app/src/components/astro-wrappers/*` - Various integration attempts

## Next Steps

**Decision needed:** Which option to pursue?

1. **If Option A**: Begin planning architectural refactor
2. **If Option B**: Revert to Vite-only, keep Astro as build tool  
3. **If Option C**: Engage with ember-astro maintainers

## Testing

To verify the current state:

```bash
cd docs-app
pnpm start
# Visit http://localhost:4321/
```

Simple Ember components work, full app does not.

## Conclusion

The ember-astro integration is **functionally working** for its intended use case (individual components), but the kolay docs app's architecture (full SPA) is incompatible with ember-astro's component-focused design.

A decision is needed on whether to:
- Refactor the app to match Astro's model
- Keep the Ember app and use Astro minimally
- Wait for better tooling support
