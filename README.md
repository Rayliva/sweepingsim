# Sweepingsim

A minimalist, cozy arcade game. Your cursor is the broom—sweep trash to the edges to earn currency and upgrade your broom.

## Tree assets

Tree images live in `src/assets/`:
- `tree-pine.png` — tall pine (behind buildings)
- `tree-leafy.png` — deciduous tree (behind buildings)
- `tree-poofy.png` — light poofy tree (in front of sidewalk)

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## How to play

- **Mouse / touch**: Move the broom (it follows with a slight, weighted feel).
- **Sweep**: Overlap trash with the broom to push it toward the nearest screen edge.
- **Score**: Trash that leaves the screen adds to **Currency**.
- **Shop**: Spend currency on **Broom Width**, **Broom Speed**, and **Trash Spawn Rate**.

## Stack

- **Game world**: HTML5 Canvas (game loop, physics, collision).
- **UI**: React (score card, shop overlay).
- **Style**: Soft urban palette, hand-sketched outlines, subtle animations and easing.
