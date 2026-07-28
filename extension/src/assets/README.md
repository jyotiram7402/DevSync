# Extension icons

`icon.svg` is the source mark. Chromium requires **PNG** action/manifest icons,
so generate these before packaging (the manifest references them):

- `icon-16.png`
- `icon-32.png`
- `icon-48.png`
- `icon-128.png`

Any SVG→PNG step works during packaging (done later, off this machine), e.g. a
one-off script using `sharp`, or an online/CLI converter. Keep the same indigo
(`#4f46e5`) mark so the browser-toolbar icon matches the app.
