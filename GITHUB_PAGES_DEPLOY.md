# Deploying to GitHub Pages

## Quick Start

This app is ready to deploy to GitHub Pages out of the box. All audio files are included in the repository as MP3s (~6MB total).

### Automatic Deployment (GitHub Actions)

1. Push this repository to GitHub
2. Go to **Settings > Pages** in your repository
3. Under "Build and deployment", select **GitHub Actions** as the source
4. The included `.github/workflows/deploy.yml` will automatically build and deploy on every push to `main`

### Manual Deployment

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build:gh-pages

# The dist/public/ folder is your deployable static site
# Upload it to any static hosting provider
```

## Repository Structure

```
client/public/audio/     ← All meditation audio files (MP3, ~6MB total)
  binaural-loop.mp3      ← Background binaural meditation music
  waypoint_00_*.mp3      ← Five Hindrances intro narration
  waypoint_01_*.mp3      ← Settling instruction
  ...                    ← Additional waypoint instructions
  waypoint_10_*.mp3      ← Closing instruction
```

## Base Path Configuration

If deploying to a subdirectory (e.g., `https://username.github.io/mindful-noting/`), you may need to set the Vite base path. Edit `vite.config.ts` and add:

```ts
export default defineConfig({
  base: '/mindful-noting/',  // Replace with your repo name
  // ... rest of config
})
```

## Notes

- Images are served from a CDN and work on any hosting platform
- Audio files are self-contained in the repository (no external dependencies)
- The 404.html handles client-side routing for SPAs on GitHub Pages
- Total build size is approximately 6.8MB (mostly audio files)
