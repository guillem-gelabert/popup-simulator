# Phase 1: Scene + Animated Card

## Tasks

- [x] Create a
  - [x] scene with
  - [x] one cube
  - [x] one camera
  - [x] one ambient light
  - [x] and orbit controls
- [x] Add a directional light so the cube shows visible shading differences on each face
- [x] Add a config panel with one checkbox "show cube" that hides/shows the cube
- [ ] Replace the cube with two flat planes (different colors) that share one edge — the spine of the card
- [ ] Make both planes visible from both sides when orbiting around
- [ ] Add a slider in the config panel that folds the right plane around the spine, displaying the current angle (0° = fully closed, 180° = flat open)

## Notes

## Questions and learnings

- Q: If I don't pass a canvas element, where does the scene get rendered? `const renderer = new THREE.WebGLRenderer();`

- L: Ambient Light casts no shadows, comes from every direction.
- Q: does it also illuminate the inside of an object?

## Resources
