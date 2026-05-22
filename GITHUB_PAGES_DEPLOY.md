# Deploying to GitHub Pages

## Quick Start

This app is fully self-contained and ready for GitHub Pages. All audio files (~4.2MB) and images (CDN-hosted) work out of the box.

### Step 1: Enable GitHub Pages

1. Go to your repository: **https://github.com/jpwoller/mindful-noting**
2. Navigate to **Settings > Pages**
3. Under "Build and deployment", select **GitHub Actions** as the source

### Step 2: Add the Deployment Workflow

Since GitHub doesn't allow automated tools to push workflow files, you need to add it manually:

1. In your repository, click **Add file > Create new file**
2. Name it: `.github/workflows/deploy.yml`
3. Paste the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Build
        env:
          VITE_BASE_PATH: /${{ github.event.repository.name }}/
        run: pnpm run build:gh-pages

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Click **Commit changes**
5. The workflow will automatically run and deploy your site

### Step 3: Access Your Site

After the workflow completes, your site will be available at:
**https://jpwoller.github.io/mindful-noting/**

## How It Works

- **Audio files**: All meditation voice clips and binaural music are in `client/public/audio/` (included in the repo)
- **Images**: Served from a CDN (no local files needed)
- **Base path**: The build automatically sets the correct base path (`/mindful-noting/`) via the `VITE_BASE_PATH` environment variable
- **SPA routing**: The `404.html` handles client-side routing for GitHub Pages

## Manual Build (Optional)

```bash
pnpm install
VITE_BASE_PATH=/mindful-noting/ pnpm run build:gh-pages
# Output is in dist/public/
```

## Total Size

- Audio files: ~4.2MB (compressed MP3)
- Built JS/CSS: ~700KB
- Total deploy: ~5MB
