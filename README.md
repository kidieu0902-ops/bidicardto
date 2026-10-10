# Birthday card for Ngân Hà

An interactive, page-flipping birthday card. No build step, no dependencies.

- **Space** (or the on-screen key on phones): open the card, open the letter, blow out the candles
- **Drag / swipe** a page to turn it like a real book, or use the arrow keys and ‹ › buttons
- Press **D** to outline the candle flames if you need to adjust them

## Files
    index.html      page structure (3 leaves = cover, letter, cake)
    css/style.css   look, 3D page turn, candle effects
    js/main.js      flipping, space action, sparkles, FLAMES list
    assets/         the four card images

## Run locally
Open `index.html` in a browser (or `python3 -m http.server`).

## Put it online with GitHub Pages
1. Create a new repository and upload everything in this folder (keep the folders).
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. After a minute the card is live at `https://<your-username>.github.io/<repo-name>/`.
