# AGENTS.md

This file contains guidelines for agentic coding agents working in this HTML games repository.

## Repository Overview

This is a collection of browser-based games built with plain HTML5, CSS3, and vanilla JavaScript. No build tools, package managers, or frameworks are used - just static HTML files that can be opened directly in a browser.

### Current Games
- **Tetris** (`game1.0.html`) - Classic block-stacking game with enhanced effects
- **2048** (`game2.0.html`) - Number-merging puzzle game  
- **Star Dodger** (`game3.0.html`) - Hand gesture-controlled game using MediaPipe

## Build/Lint/Test Commands

Since this is a static HTML repository with no build tools:

```bash
# No build step required - open HTML files directly in browser
open game1.0.html  # macOS
# or
start game1.0.html  # Windows
# or double-click the HTML file

# For testing games, use browser developer tools:
# 1. Open HTML file in browser
# 2. Press F12 or right-click → Inspect
# 3. Check Console tab for JavaScript errors
# 4. Use Network tab to verify asset loading
```

### Running Single Tests
No automated tests are configured. Manual testing approach:
1. Open each game HTML file in multiple browsers (Chrome, Firefox, Safari)
2. Test game functionality manually
3. Check browser console for JavaScript errors
4. Verify responsive design on different screen sizes

## Code Style Guidelines

### File Structure
- Game files follow pattern `game{X}.html` (X = version number)
- All CSS is embedded in `<style>` tags within HTML files
- All JavaScript is embedded in `<script>` tags at the end of HTML files
- No external dependencies except for game3.0.html (MediaPipe CDN)

### HTML Guidelines
- Use HTML5 doctype: `<!DOCTYPE html>`
- Set proper charset and viewport: `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Use semantic HTML5 elements where appropriate
- Chinese language support: `lang="zh-Hant"` for Traditional Chinese, `lang="zh"` for Simplified

### CSS Guidelines
- Use CSS variables for consistent theming (see game3.0.html for examples)
- Follow mobile-first responsive design with media queries
- Use flexbox and grid for layouts
- Avoid inline styles - keep all CSS in `<style>` section
- Use consistent naming conventions: kebab-case for classes
- Include hover states and transitions for better UX

### JavaScript Guidelines
- Use `const` and `let` instead of `var`
- Use modern ES6+ features (arrow functions, template literals, destructuring)
- Keep global variables to a minimum - use closures or modules where possible
- Use descriptive variable and function names in English, but UI text can be in Chinese
- Include proper error handling for canvas operations and browser compatibility
- Use `requestAnimationFrame` for smooth game loops
- Separate game logic from rendering code
- Import external libraries via CDN script tags in head section
- Use async/await for MediaPipe and camera operations
- Handle promise rejections with try-catch blocks

### Canvas/Game Development
- Use `const` for game constants (board dimensions, colors, etc.)
- Store game state in objects rather than scattered variables
- Implement proper collision detection
- Use `localStorage` for persisting high scores
- Include both keyboard and touch controls for mobile compatibility
- Add visual feedback for user actions

### Error Handling
- Wrap canvas operations in try-catch blocks
- Include fallbacks for browser compatibility
- Provide user-friendly error messages in appropriate language
- Check for WebGL/MediaPipe availability where applicable

### Performance Guidelines
- Optimize canvas rendering by only redrawing when necessary
- Use `requestAnimationFrame` instead of `setInterval` for animations
- Implement object pooling for frequently created/destroyed game objects
- Minimize DOM manipulation during gameplay
- Use CSS transforms instead of changing position properties where possible

### Browser Compatibility
- Test in Chrome, Firefox, and Safari
- Include vendor prefixes for CSS properties when needed
- Provide fallbacks for older browsers
- Ensure touch events work alongside mouse events

### Internationalization
- UI text should be in Traditional Chinese (zh-Hant) or Simplified Chinese (zh) as appropriate
- Use UTF-8 encoding consistently
- Test font rendering across different platforms

### Accessibility
- Include proper ARIA labels where applicable
- Ensure keyboard navigation works
- Provide high contrast modes for better visibility
- Include focus indicators for interactive elements

## Common Patterns

### Game Initialization
```javascript
function init() {
    // Reset game state
    // Set up canvas context
    // Initialize game variables
    // Set up event listeners
    // Start game loop
}
```

### Game Loop Pattern
```javascript
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    if (!paused && !gameOver) {
        // Update game logic
        // Handle input
        // Update physics/positions
    }
    
    // Render frame
    requestAnimationFrame(update);
}
```

### Canvas Drawing Pattern
```javascript
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    // Draw UI overlay
}
```

## Adding New Games

When adding a new game:
1. Create new HTML file following naming convention `game{X}.html`
2. Update `index.html` to include link to new game
3. Follow the established CSS/JS patterns
4. Include both keyboard and mobile controls
5. Add proper error handling and browser compatibility checks
6. Test across different browsers and screen sizes

## Debugging Tips

- Use browser developer tools (F12) for debugging
- Check Console tab for JavaScript errors
- Use Network tab to verify external resources load properly
- For canvas issues, use the inspector to check canvas dimensions
- Test responsive design using device emulation in dev tools

Remember: This repository prioritizes simplicity and direct browser compatibility over complex build processes. Keep it simple, functional, and accessible.