# SHIPWREKT — a personal trip cosmology

An interactive, static art-site built from Merry's Shipwrekt trip archive. `Shipwrekt` is the nickname of the mushroom strain in the account; the site intentionally contains no nautical or shipwreck imagery.

## Open it locally

The site has no build step or dependencies. Serve the repository root with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy on Netlify

Connect this repository to Netlify. The included `netlify.toml` publishes the repository root, so no build command is required.

## Structure

- `index.html` — semantic site content and accessible no-JavaScript baseline
- `styles.css` — the atmosphere, optical-glass material system, responsive layout, and reduced-motion fallbacks
- `app.js` — progressive interaction, WebGL art, graph navigation, the session trail, and one local visual-density preference
- `404.html` — a working recovery page
- `assets/source-art/` — the two original visual artifacts
- `content/source-notes/` — the original source notes, renamed and grouped without rewriting them
- `content/data/` — the original thematic maps

## Interpretive boundary

The site presents a subjective psychedelic experience and its personal symbolic cosmology. Scientific, mathematical, clinical, and spiritual language is presented as the language of the archive—not as verified science, diagnosis, medical advice, or drug-use guidance.

