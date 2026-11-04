# 🌾 Little Farm

A cozy, single-player browser farming game. This version runs entirely in your browser with **no server, account or cloud database**. It is adapted from the original GLM game to work on GitHub Pages.

## Play

Once GitHub Pages is enabled (Settings → Pages → **GitHub Actions**), open:

**https://joaodperes.github.io/Little-Farm/**

## Persistence and backups

Each farm is stored as an **IndexedDB** record in the current browser/profile. Actions are saved before completing; crop, animal, market and automation timers catch up when you return. The game requests persistent storage where supported, but clearing site data, browser eviction, or using another device can still erase local saves.

Use **Export saves** on the farmer screen or **Back up** in-game to download a JSON backup. Use **Import saves** to restore it (including compatible exports from the original SQLite/Prisma app). Imported farms with matching names replace the local version, after confirmation. Never put personal save files in this public repository.

## Development

```bash
npm install
npm run dev
npm run build   # static export to out/
```

The production workflow builds using `PAGES_BASE_PATH=/Little-Farm`; local development runs at `/`.

There are no server APIs, Prisma migrations or database secrets in this repository. The original game UI lives in `src/components/farm`; gameplay and persistence live in `src/lib/browser-farm.ts`, with shared data/rules in `src/lib/game-data.ts`.

## Hosting

Pushing to `main` triggers `.github/workflows/pages.yml` to typecheck, build and deploy. On the repository's first deployment, configure **Settings → Pages → Build and deployment → Source: GitHub Actions**. GitHub Pages is a static host; no server storage or automatic cross-device sync is provided.
