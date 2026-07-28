# App assets

`app.json` references these PNGs — generate them from `icon.svg` before the
first `expo prebuild` / EAS build (done later, off this machine):

- `icon.png` (1024×1024)
- `adaptive-icon.png` (1024×1024, foreground; background is `#4f46e5`)
- `splash.png` (≥1242×2436, centered mark on `#09090b`)

Keep the indigo (`#4f46e5`) mark so the launcher/splash match the app and
extension.
