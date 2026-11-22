# Armanaverse Website

A responsive, single-page birthday journey with 10 connected scenes:
1. Star-collecting mini game
2. Armanaverse entrance
3. Are-you-ready interaction
4. Birthday reveal
5. Make-a-wish candle
6. Personal letter
7. Interactive compliment collection
8. Cosmic scale / feelings sequence
9. Wish jar
10. Animated birthday book and final card reveal

## Run locally
1. Extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. Click **Start the little game**. This first click also starts the original soft instrumental melody.
4. Use the Music button in the top-right corner to mute/unmute.

For best results, run with a local development server (for example, VS Code Live Server).

## Publish with GitHub Pages
1. Create a GitHub repository, for example `armanaverse-birthday`.
2. Upload all files and folders from this project (not the ZIP itself).
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Select `main` and `/(root)`, then Save.
6. Wait for the published URL shown in the Pages section.

## Notes
- The birthday instrumental is generated locally with the Web Audio API; no external music file is required.
- Browsers generally block sound before a user gesture. The first game button click starts the music.
- Google Fonts are loaded online; the page falls back to system fonts if offline.
- Edit text in `index.html` and visual styles in `css/style.css`.
