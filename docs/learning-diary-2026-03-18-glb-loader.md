# Learning Diary — 2026-03-18 — GLB Model Loader

## Goal

Replace procedural `boxGeometry` with a Blender-exported `.glb` model, loading meshes and extracting empty (hinge) transforms for use with Rapier physics joints.

## Key Learnings

### 1. Loading a GLB in R3F

- `useLoader(GLTFLoader, path)` works, but `useGLTF` from drei adds caching and preloading for free.
- The loaded `gltf.scene` can be rendered directly via `<primitive object={scene} />`.
- Static assets served by Vite should use stable paths (e.g. from `public/` or a known root-relative location). Relative paths like `../../models/` are fragile if the component moves.

### 2. Traversing the Scene Graph

- `scene.traverse(callback)` walks every node in the loaded glTF.
- Blender meshes arrive as `type === "Mesh"`, empties arrive as `type === "Object3D"`.
- Filtering by name suffix (`_Hinge`) plus type gives reliable hinge detection.

### 3. Local vs World Quaternion (the "+Y Up" trap)

- The glTF exporter with "+Y Up" inserts a root transform node to convert Blender Z-up to Three.js Y-up.
- This means even "top-level" empties are children of that root node.
- `object.position` / `object.quaternion` are **local** (relative to the root transform).
- `object.getWorldPosition()` returns the correct world-space position — but `object.quaternion` alone does **not** give the world-space orientation.
- **Fix**: use `object.getWorldQuaternion()` to get the orientation in world space, consistent with `getWorldPosition()`.
- This inconsistency (world position + local quaternion) caused two hinges to report wrong rotation axes.

### 4. Rotation Axis Extraction

- A hinge's rotation axis = the empty's local Z-axis expressed in world space.
- Computed as: `new Vector3(0, 0, 1).applyQuaternion(worldQuaternion)`.
- The result is always a unit vector (components between -1 and 1).
- `0.707` = `√2/2`, meaning 45° between two axes — a valid direction, not an error.
- `rotationAxis` is derived from `quaternion`, so storing both is a convenience tradeoff vs. single source of truth.

### 5. React Pitfalls in the Hook

- **State outside useEffect**: declaring `hinges = {}` outside `useEffect` and populating inside means it resets every render. Use `useState` instead.
- **Multiple setState in traverse**: spreading stale state in a loop loses entries. Use the functional updater `setState(prev => ...)` or build the full object first.
- **useEffect return**: `return scene.traverse(...)` accidentally registers traverse's return value as a cleanup function. Only return an actual cleanup function (or nothing).

### 6. Blender Export Checklist (confirmed)

- Apply transforms to meshes, **not** to empties (empties need their rotation preserved).
- Disable animation export — physics will drive motion.
- Enable "+Y Up" — but be aware it adds a root transform node.

## Open Question

- The `rotationAxis` for two hinges is wrong due to using local quaternion instead of world quaternion. The fix (`getWorldQuaternion`) has been identified but not yet applied.

## Concepts Reinforced

- Local vs world space (gap #1 from learning diary summary) — now encountered concretely in the glTF loader context.
- Rotation math (gap #5) — quaternion-to-axis derivation is clearer after working through the `applyQuaternion` logic.
