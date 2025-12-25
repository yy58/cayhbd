# Copilot Instructions for cay Birthday Site

## Project Overview
This is a interactive **birthday celebration webpage** with pixel art cake, fireworks animations, photo slideshow, and WebAudio-synthesized "Happy Birthday" music. It's a standalone HTML file that runs in any browser—no build process needed.

**Key files:** `index.html` (entry point), `js/main.js` (all game logic), `css/style.css` (visuals), `assets/photos/` (user photos)

## Architecture

### Canvas-based rendering
- **Dual canvas system**: 
  - `#fireworks` (fullscreen, z-index 0) → particle effects + photo background
  - `#cake` (240×240, z-index 2) → static pixel cake
- **Render loop**: `fireworksTick()` runs via `requestAnimationFrame`, drawing particles with `globalCompositeOperation: 'lighter'` for bloom effect
- **High-DPI support**: Canvas scales by `devicePixelRatio` (max 2x for performance)

### Event flow on cake click
1. User clicks `#cakeWrap` → `onCakeClick()` fires
2. Spawns particle burst at cake position with `burst(x, y, colors)`
3. Calls `nextPhoto()` (cycles `photoIdx`), `startAutoSlide()` (4s interval), `startMusic()` (WebAudio loop)
4. Photos rendered via `drawPhotoBackground()` with `globalAlpha: 0.45` overlay

### Photo management
- **Array-driven**: `photoFiles` list hard-coded (10 files)
- **Lazy loading**: `loadPhoto(name)` caches images via `Map`; waits for `img.complete` before draw
- **Responsive scaling**: Images scaled to fill viewport while maintaining aspect ratio
- **Encoding**: File names encoded via `encodeURIComponent()` (handles spaces & special chars)

## Critical patterns & conventions

### Canvas rendering
- Clear with semi-transparent rect (not full clear) to create motion blur: `fillStyle = 'rgba(4, 6, 12, 0.40)'`
- Always `save()`/`restore()` around `globalCompositeOperation` changes
- Set `globalAlpha` for fade effects (e.g., particle death, photo transparency)

### Particles system
- `Particle` class: constructor sets random angle/speed from cake burst point
- **Physics**: gravity `+= 0.03` each step, velocity damping `*= 0.99`
- **Lifetime**: random `age` (0 to 120 frames), fade alpha by `age / life` ratio
- **Colors**: hardcoded palette `['#ff7bd7','#ffd089','#6bd5ff','#a3ff78']` (pink/gold/cyan/lime)

### WebAudio synthesis
- **Initialization**: Lazy on first cake click (respects browser autoplay policy)
- **Melody playback**: `scheduleMelody()` queues notes with 0.05s gaps
- **Looping**: Uses `setTimeout` (not `setInterval`) to reschedule each melody cycle
- **Note format**: `{freq, duration}` pairs; uses `'triangle'` oscillator for warmth
- **Total duration**: calculated from melody array `reduce()` → auto-loop timing

### Accessibility notes
- Canvas elements have `aria-hidden="true"` (decorative)
- Cake wrapper has `role="button"` + `aria-label`
- Keyboard support: `keydown` listener for Enter/Space
- Safe-area padding for mobile notches: `env(safe-area-inset-bottom)`

## Common tasks

### Add/replace photos
1. Place JPG files in `assets/photos/`
2. Add filenames to `photoFiles` array in `js/main.js`
3. URLs auto-encoded via `encodeURIComponent()`; no manual path editing needed

### Tweak visuals
- **Particle colors**: Edit `burst()` call color palette
- **Particle count**: Change `const count = 90` in `burst()` function
- **Auto-fireworks interval**: Modify `setInterval(..., 2200)` milliseconds
- **Cake style**: Edit `drawPixelCake()` color strings (`#ffb3de`, `#ff9bd5`, etc.)
- **Photo fade speed**: Change `photoAlpha += 0.01` increment (lower = slower)
- **Motion blur intensity**: Adjust `rgba(4, 6, 12, 0.40)` alpha value

### Adjust cake geometry
- `px` = pixel block size (10 pixels)
- `rows` / `cols` = pixel grid dimensions
- Candle: `candleH = px*3` (height), color `#6bd5ff`
- Flame: `ctx.ellipse()` at `(cx, candleY - 6)` with size 6×10

### Change music
- Melody defined as `[['NOTE', duration], ...]` in C major notes
- Frequencies in `notes` object (C4–B5 range)
- To use external audio file: replace `startMusic()` with `<audio>` element instead of WebAudio synthesis

## Known constraints
- Photos must be in `assets/photos/` with exact filenames in array
- WebAudio requires user interaction before playing (browser policy)
- Pixel cake is static (no animation) for simplicity
- Particle color palette is global (no per-burst customization currently)
- Mobile: cats scale down at `max-width: 640px`; consider font-size if adding more text

## Testing locally
```bash
python3 -m http.server 8000  # serve on localhost:8000
# or just double-click index.html for direct file:// access
```

---
**Last updated**: Birthday celebration site, all interactive features operational.
