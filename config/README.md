# LGA Site Config

Each deployment can use a **JSON config file** to customize content and theme for that LGA.

## Setup

1. In `.env`, set the path to your LGA config:
   ```env
   SITE_CONFIG_JSON_FILE=./config/kagarko.json
   ```
   Example configs: `kagarko.json`, `birnin-gwari.json`.
2. If `SITE_CONFIG_JSON_FILE` is not set or the file is missing, the app uses the **default Kudan** config (embedded in code).

### Switching to Birnin Gwari

Set in `.env`:
```env
SITE_CONFIG_JSON_FILE=./config/birnin-gwari.json
```
Restart the dev server. The site will run as Birnin Gwari (navbar, hero, about, chairman, agriculture, footer, all page content, contact details, upload folder, theme, and dashboard label come from the config).

**Birnin Gwari assets:** Add these images to `public/` for full display (agriculture cards and government leadership):
- `grains.png` – Sorghum & Maize card
- `livestock.png` – Livestock card
- `minerals.png` – Gold  card
- `secretary.png` – Council Secretary (government leadership)

## Duplicating for 22 LGAs

1. Copy `kagarko.json` to a new file, e.g. `config/<lga-name>.json`.
2. Edit the JSON: update `siteName`, `metadata`, `navbar`, `hero`, `about`, `chairman`, `agriculture`, `footer`, `aboutPage`, `governmentPage`, `projectsPage`, `agriculturePage`, `contactPage`, `upload.defaultFolder`, and optionally `theme.colors` and `dashboard.adminLabel`.
3. For that deployment, set in `.env`:
   ```env
   SITE_CONFIG_JSON_FILE=./config/<lga-name>.json
   MONGODB_URI=<that LGA's MongoDB>
   CLOUDINARY_URL=<that LGA's Cloudinary>
   ```

## Theme colors

Optional `theme.colors` in the JSON (HSL values without `hsl()`):

- `brand` – main accent (buttons, links)
- `brandHover` – hover state
- `brandDark` – nav/footer background
- `brandMuted` – light section backgrounds
- `brandForeground` – text on brand (e.g. white)
- `brandMutedForeground` – subtle links

Example (green):

```json
"theme": {
  "colors": {
    "brand": "142 76% 36%",
    "brandHover": "142 76% 42%",
    "brandDark": "142 61% 26%",
    "brandMuted": "142 40% 96%",
    "brandForeground": "0 0% 100%",
    "brandMutedForeground": "142 40% 70%"
  }
}
```

## Upload folder

Set `upload.defaultFolder` (e.g. `kagarko/news`) so uploads go to that LGA’s Cloudinary folder. Default when omitted: `kudan/news`.
