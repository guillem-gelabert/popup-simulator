# Popup Simulator Learning Diary

## Scope

This summary is based on the Cursor transcripts in this folder. It aggregates recurring questions, debugging patterns, and concept explanations across the project.

## Overall Pattern

The main learning challenge in this project is not general coding. It is translating popup-paper mechanics into correct 3D and physics representations in Three.js, React Three Fiber, and Rapier.

The most repeated friction points are:

- coordinate spaces
- pivots and origins
- joint anchors and axes
- transform ownership between `RigidBody`, `mesh`, and `geometry`
- rotation math
- physics stability and collision setup

## Knowledge Holes

### 1. Local Space vs World Space

This is the most repeated gap.

Recurring symptoms:

- uncertainty about whether joint anchors are relative to the object or the world
- confusion about what the three numbers in an anchor mean
- uncertainty about whether a joint is defined by a point or a line
- trouble predicting where a joint will end up in world space

What this blocked:

- aligning blue/red popup planes to white/green pages
- making joints start in a valid configuration
- debugging why bodies exploded, stayed glued, or detached

### 2. Pivot / Origin Mental Model

Recurring symptoms:

- wanting to "change the origin" of a page or plane directly
- uncertainty about how to place page origins on left or right edges
- confusion about rotating around an edge versus rotating around the center

What this blocked:

- page placement around the spine
- rotating a panel around its glued edge
- setting up clean fold behavior without extra translation bugs

### 3. Physics Constraint Modeling

You repeatedly had the right mechanical intuition, but difficulty mapping it to Rapier joints.

Recurring symptoms:

- asking why a fold does not fall
- asking why a body is fixed in the air
- joints exploding when a new link is added
- bodies ragdolling with spherical joints
- asking why a real paper version works while the simulated one does not
- asking when to use revolute, spherical, spring, fixed, and collider combinations

What this blocked:

- stable V-fold behavior
- believable paper bending
- avoiding over-constrained or conflicting joint setups

### 4. Ownership of Position and Rotation

Recurring symptoms:

- asking whether the initial position belongs in the `mesh`, `geometry`, or `RigidBody`
- asking whether rotation expects Euler values
- asking where to put the transform when physics is involved

What this blocked:

- visual placement matching physical placement
- reliable pivot behavior
- understanding why something looked correct but simulated incorrectly

### 5. Rotation Math

Recurring symptoms:

- degrees vs radians friction
- direction vector calculations from user-entered angles
- arbitrary-axis rotation questions
- confusion around `Quaternion`, Euler rotation, and `applyAxisAngle`
- trying to rotate around an edge and getting rotation around the origin instead

What this blocked:

- glueline angle controls
- aligning panel orientation to intended fold axes
- converting UI values into stable transforms

### 6. R3F Render Lifecycle and Integration

This was a smaller but consistent cluster.

Recurring symptoms:

- how to get camera and renderer
- how to wrap `ViewportGizmo` for React Three Fiber
- why the gizmo did not appear
- why render order mattered
- asking to simplify the wrapper after it worked

What this blocked:

- integrating imperative Three.js helpers into the R3F lifecycle
- understanding `useThree`, `useFrame`, and render ordering

### 7. Tooling and Project Operations

This is not the core learning hole, but it appeared repeatedly.

Recurring symptoms:

- GitHub push failing due to auth or private email settings
- wanting to align the project with Three.js Journey conventions
- creating task-slicing and project-planning skills
- refining requirements and phases

What this blocked:

- project momentum
- confidence in setup and workflow
- turning ideas into a steady implementation plan

## Key Learnings So Far

### 1. Joint Anchors Are Local-Space Points

This appears to be the biggest conceptual gain.

Current understanding:

- each anchor array is a local `[x, y, z]` offset from a body's center
- the two anchors must resolve to the same world-space point at startup
- the joint axis defines the allowed rotation direction, not the hinge location by itself

### 2. Stable Physics Depends on Correct Initial Geometry

You have learned that instability usually comes from setup mismatch, not magic physics failure.

Current understanding:

- anchors must coincide in world space
- body thickness matters
- panel positions must reflect where the hinge actually is
- a bad initial overlap or offset causes explosions, drifting, or locking

### 3. Paper Mechanics Need Explicit Constraint Choices

Current understanding:

- revolute joints better match paper bends than spherical joints
- spring joints can stabilize but do not replace hinge logic
- colliders can help or interfere depending on the intended contact behavior
- real paper gets stability from material properties that a rigid-body simulation does not provide automatically

### 4. Pivot Changes Usually Come From Hierarchy or Offsets

Current understanding:

- Three.js objects do not usually expose a simple editable origin like a DCC tool
- the practical solution is often to offset the mesh or geometry under a parent pivot
- rotating around an edge usually means moving the visual content relative to the transform origin

### 5. Transform Layering Matters

Current understanding:

- `RigidBody` owns physics transforms
- `mesh` is a visual child and can be offset for pivot tricks
- `geometry` defines the shape around the mesh's local origin

### 6. UI-Friendly Angles Need Conversion Boundaries

Current understanding:

- user-facing controls can stay in degrees
- internal rotation logic usually needs radians
- axes and direction vectors should be derived in one place, not recomputed ad hoc throughout the component tree

### 7. R3F Helpers Need Lifecycle-Aware Wrappers

Current understanding:

- imperative Three.js helpers need setup, per-frame updates, and cleanup
- `useThree` is the entry point for camera/renderer access inside `<Canvas>`
- render order matters when a helper paints into the same canvas after the main scene

## Strengths Observed

- strong mechanical intuition: you often spot that the simulated behavior is physically wrong before identifying the exact implementation bug
- good product instinct: you keep pushing toward a believable paper model rather than accepting a technically-working but fake result
- good simplification instinct: you repeatedly ask for cleaner mental models and simpler code after fixes work
- persistence in debugging: you keep narrowing the problem until the conceptual mismatch becomes visible

## Weaknesses Observed

- coordinate-frame reasoning is still fragile under pressure
- rotation math becomes error-prone when combined with pivots and physics
- there is still some mixing between visual transform thinking and physics-constraint thinking
- you tend to reach for implementation changes before locking down the exact frame of reference and hinge geometry

## Recommended Study Order

### 1. Coordinate Frames

Focus on:

- local position vs world position
- parent/child transforms
- converting a local anchor into a world point

Success criterion:

- you can predict where any anchor lands in world space before running the app

### 2. Pivot Construction

Focus on:

- parent pivot objects
- mesh offsets
- edge-based rotation

Success criterion:

- you can make any page or plane rotate around any chosen edge without trial and error

### 3. Rotation Toolkit

Focus on:

- degrees vs radians
- Euler vs quaternion
- axis-angle rotation
- rotating vectors by quaternions

Success criterion:

- given an angle and axis, you can predict both object orientation and direction-vector output

### 4. Rapier Joint Semantics

Focus on:

- fixed vs revolute vs spherical vs spring
- anchor alignment
- joint axes in local space
- why over-constrained systems explode

Success criterion:

- you can explain which joint type matches each paper connection before implementing it

### 5. Collision Strategy for Paper

Focus on:

- when colliders should be disabled
- when explicit colliders are needed
- when collision groups or sensors help
- how to inspect contact and debug overlap

Success criterion:

- you can intentionally choose whether two panels should collide, ignore, or only detect contact

### 6. R3F Integration Patterns

Focus on:

- `useThree`
- `useFrame`
- imperative helper wrappers
- render order

Success criterion:

- you can integrate a non-R3F Three.js helper without lifecycle confusion

## Practical Rules To Reuse

- Before creating a joint, write down the intended hinge world point.
- For each body, convert that hinge into local coordinates.
- Make sure both anchors resolve to the same world point at startup.
- Decide whether the hinge axis is defined in local space or world space, then verify it visually.
- Put physics transforms on the `RigidBody`.
- Use child mesh offsets to fake pivot changes.
- Keep UI values in degrees, convert once to radians, then derive vectors and quaternions from that single source.
- If a simulation explodes, first suspect bad initial alignment or conflicting constraints.
- If a helper renders incorrectly in R3F, inspect lifecycle and render order before assuming the math is wrong.

## Suggested Next Learning Questions

- Can I compute and display the world-space position of every joint anchor for debugging?
- Can I build a reusable "edge pivot" wrapper for panels?
- Can I create a visual helper that shows joint axes and anchor points live?
- Can I document which paper connection maps to which Rapier joint type?
- Can I reduce the current popup mechanism to the smallest stable two-body example and rebuild upward from there?

## Bottom Line

The main knowledge hole in this project is:

Translating a paper mechanism into correct geometry, transforms, and constraints.

The main learning so far is:

Believable popup behavior depends more on precise spatial setup and constraint design than on raw coding complexity.
