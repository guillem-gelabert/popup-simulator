# Learning Diary — 2026-03-19 — Collider Alignment & Joint Activation

## Goal

Make a revolute joint motor respond to Leva slider controls, driving a dynamic plane to fold against a fixed plane, using meshes loaded from a Blender GLB.

## Key Learnings

### 1. Hooks Can't Run Conditionally — Use Component Splitting

- `useRevoluteJoint` was called in the same component that did an early `return null` while waiting for async data.
- Hooks execute top-to-bottom on every render, regardless of early returns below them.
- The joint hook fired against empty refs (no `RigidBody` mounted yet) and never re-ran when the bodies appeared.
- **Fix**: extract the joint + rigid body logic into a child component (`HingedPlanes`) that only mounts once the data is ready. When `HingedPlanes` mounts, its hooks run for the first time with refs that are populated on the same render.

### 2. Flat Meshes Produce Zero-Volume Colliders

- Blender planes exported to GLB have zero thickness.
- `Box3.setFromObject(node).getSize()` returned `[2, 0, 2]` — the Y half-extent was `0`.
- A `CuboidCollider` with a zero dimension has no volume, therefore no mass. Rapier treats it as massless: no gravity, no motor response.
- **Fix**: clamp each half-extent to a minimum value (`0.01`).

### 3. Node Position ≠ Geometry Center

- Blender planes had their origin at the fold line (shared edge), so `node.position` was `[0, 0, 0]` for both.
- The actual geometry extended outward: left plane vertices from `[-2, 0, -1]` to `[0, 0, 1]`, right from `[0, 0, -1]` to `[2, 0, 1]`.
- Placing `CuboidCollider` at `node.position` put both colliders at the origin, overlapping in the center.
- **Fix**: use `Box3.getCenter()` to compute the true geometric center. LeftPlane center = `[-1, 0, 0]`, RightPlane center = `[1, 0, 0]`.

### 4. `<primitive>` and Collider Auto-Generation

- `@react-three/rapier` auto-generates colliders (`colliders="cuboid"`, `"trimesh"`, etc.) by scanning child Three.js geometry elements.
- `<primitive object={mesh}>` may not be detected by the auto-generation scan.
- **Fix**: use `colliders={false}` and provide explicit `<CuboidCollider>` with computed dimensions.

### 5. Trimesh Colliders Don't Work on Dynamic Bodies

- Rapier only supports `trimesh` colliders on `fixed` or `kinematicPosition` bodies.
- A `dynamic` body with `colliders="trimesh"` silently gets no effective collider.
- For dynamic bodies, use `"hull"`, `"cuboid"`, or explicit collider components.

### 6. `<primitive>` Carries Its Own Transform

- When placed inside `<RigidBody position={pos}>`, the visual mesh appears at `pos + node.position` (double offset).
- The collider only gets the `RigidBody` offset.
- **Fix**: keep `RigidBody` at origin (no position prop), let the primitive's own transform handle visual placement, and position the `CuboidCollider` at the bounding box center.

### 7. Joint Anchor Coordinates Are Relative to the RigidBody

- With both `RigidBody` elements at origin, the joint anchors in `useRevoluteJoint` are effectively in world space.
- The hinge world position (from Blender empty) can be used directly as both `body1Anchor` and `body2Anchor`.

### 8. Why Collider Volume Matters — Mass, Inertia, and Collision

A collider in Rapier serves three distinct purposes, not just one:

1. **Mass** — computed from collider volume × density. No volume = no mass = body ignores gravity and forces.
2. **Inertia tensor** — how the body resists rotation around each axis. Derived from collider shape and mass distribution. A zero-volume or degenerate collider produces zero or near-zero inertia, making motor-driven rotation unstable or non-functional.
3. **Collision detection** — the collider shape is what Rapier tests for contacts. A zero-thickness shape can't detect edge-on collisions.

Setting `mass` explicitly on `RigidBody` only fixes problem #1. The inertia tensor and collision shape remain degenerate. For motor-driven rotation (our use case), correct inertia matters more than mass.

### 9. `RigidBody mass` vs Collider Volume

- `mass` and `density` props on `RigidBody` override computed mass — useful for tuning weight independently of geometry.
- But they do **not** replace having a physically plausible collider shape. Inertia and collision still depend on the collider geometry.
- Use `mass`/`density` to tune behavior **after** the collider shape is correct, not as a substitute for it.

### 10. Blender Planes vs Thin Boxes

- Blender plane meshes have zero thickness → require `MIN_HALF` clamping, explicit `CuboidCollider`, and `useBounds` to work in Rapier.
- Thin box meshes (e.g. 0.02 height in Blender) have real volume → Rapier computes mass and inertia correctly, `colliders="cuboid"` auto-generation works, and the code simplifies significantly.
- Visually identical at normal zoom. A thickness of 0.01–0.05 (in project units = cm) is imperceptible.
- **Recommendation**: use thin boxes in Blender instead of planes. This eliminates `useBounds`, `MIN_HALF`, `colliders={false}`, and explicit `CuboidCollider` from the code entirely.

### 11. Blender Modifiers Must Be Applied Before Export

- Switching from planes to boxes via a Solidify modifier in Blender is not enough — the modifier must be **applied** before exporting to GLB.
- An unapplied modifier means the GLB still contains the original flat plane geometry. Three.js/Rapier see zero thickness.
- Symptoms are identical to the original zero-volume problem (body doesn't move, motor doesn't respond) even though the mesh looks correct in Blender.
- **Diagnostic**: `Box3.setFromObject(node).getSize()` reveals the truth — if Y is `0`, the modifier wasn't applied.
- **Rule**: always verify geometry dimensions on the Three.js side after a Blender re-export. Don't trust Blender's viewport — it shows modifier effects that aren't baked into the export.

## Debugging Approach That Worked

1. Added diagnostic `console.log` inside `useFrame` to check if `joint.current` was truthy — confirmed joint existed.
2. Logged `left.current.translation()` every 120 frames — caught that the body wasn't moving at all.
3. Logged bounding box half-extents — discovered zero Y dimension.
4. Hardcoded collider dimensions `[2, 0.01, 2]` to isolate collider vs joint problem — body started moving.
5. Logged `Box3.getCenter()` — discovered node positions were `[0,0,0]` while geometry was offset.

## Concepts Reinforced

- Transform ownership (gap #4 from summary) — the layering between `RigidBody`, `CuboidCollider`, and `<primitive>` is now concrete.
- Physics constraint modeling (gap #3) — zero-volume colliders as a silent failure mode.
- Pivot/origin mental model (gap #2) — Blender origin placement directly affects collider alignment in R3F.

## Practical Rules Added

- Always clamp collider half-extents to a minimum thickness for flat geometry.
- Use `Box3.getCenter()` for collider placement, not `node.position`.
- Use `colliders={false}` + explicit `<CuboidCollider>` when rendering `<primitive>` objects.
- When a physics body doesn't move at all, first check: does it have mass? (collider volume > 0).
- When hooks need data that loads asynchronously, split into a parent (loader) and child (hook consumer) component.
- A collider provides three things: mass, inertia, and collision shape. Setting `mass` alone doesn't fix inertia or collision.
- Use `mass`/`density` to tune weight after the collider shape is correct, not as a substitute.
- Prefer thin boxes (0.02 height) over planes in Blender — eliminates all the volume/collider workarounds.
- Always apply modifiers in Blender before GLB export — unapplied modifiers are invisible to Three.js.
- After re-exporting from Blender, verify geometry dimensions with `Box3.getSize()` on the Three.js side — don't trust Blender's viewport.
