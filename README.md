# Harmonium

A small site for visualizing wave equations: a **Notes** tab that renders
stored markdown files (with LaTeX), and a **Wave Lab** tab with interactive
canvas visualizations driven by sliders.

## Models in the Wave Lab

- **Two waves** — two counter-propagating sine waves and their superposition
  (set A₁ = A₂ for a standing wave).
- **Exponential decay** — a traveling wave inside an e^(−βx) envelope.
- **Harmonics** — standing-wave normal modes of a fixed string, summed with
  1/m weighting.

The **Mass / Charge** toggle mirrors a physical distinction: masses are
positive, so amplitudes clamp to ≥ 0; charges can be negative, so amplitudes
may go below zero.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## Project layout

```
harmonium/
├── index.html
├── notes/                  # markdown notes rendered by the Notes tab
│   ├── standing-waves.md
│   ├── superposition.md
│   └── harmonics.md
└── src/
    ├── main.jsx
    ├── App.jsx             # header + Notes / Wave Lab tabs
    ├── styles.css          # dark theme
    ├── waves/models.js     # pure wave math (no React)
    └── components/
        ├── Slider.jsx
        ├── NotesView.jsx   # markdown + KaTeX rendering
        └── WaveLab.jsx     # canvas visualization
```

Drop any `.md` file into `notes/` and it appears in the Notes sidebar
automatically. LaTeX works with `$…$` inline and `$$…$$` blocks.
