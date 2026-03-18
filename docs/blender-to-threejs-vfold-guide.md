# Complete Guide: Blender V-Fold Mechanism to Three.js with Rapier Physics

## Overview
This guide walks you through exporting a Pop-up V-fold mechanism from Blender 5.0.1 and recreating the physics in React Three Fiber with Rapier physics. The workflow involves exporting geometry and empty transforms from Blender, then manually recreating the rigid body physics setup in Three.js.

**Key Technologies:**
- Blender 5.0.1 (export)
- React Three Fiber (R3F) - rendering
- @react-three/rapier - physics
- leva - motor control UI
- Three.js GLTFLoader - model loading

---

## PART 1: BLENDER PREPARATION & EXPORT

### Step 1.1: Verify Your Blender Setup

Before exporting, ensure your scene is properly configured:

1. **Check Empty Placement:**
   - Each empty should be positioned exactly at the hinge point
   - Verify the local Z-axis (blue axis) points along the rotation axis
   - Use Blender's Transform Orientations set to "Local" to verify axis alignment

2. **Name Your Objects Consistently:**
   - Give meaningful names to all objects and empties
   - **IMPORTANT:** Empties (hinges) should be named to show which two planes they connect
   - Naming convention: `[Plane1]_[Plane2]_Hinge`
   - Example naming:
     ```
     Meshes:
     LeftPlane
     RightPlane
     VFold_Left
     VFold_Right
     
     Empties (hinges - named for the planes they join):
     LeftPlane_RightPlane_Hinge      (main fold - motor driven)
     LeftPlane_VFold_Left_Hinge      (left plane to left v-fold)
     RightPlane_VFold_Right_Hinge    (right plane to right v-fold)
     VFold_Left_VFold_Right_Hinge    (v-fold planes together)
     ```
   - This naming makes it immediately clear which bodies each joint connects
   - Critical for debugging: you can see the relationship at a glance

3. **Verify Rigid Body Settings (for reference):**
   While these won't export, document them:
   - Left plane: Passive + Animate
   - Right plane: Passive (no animate)
   - V-fold planes: Active (no animate)
   - All empties have rigid body constraints of type Hinge

4. **Check Animation:**
   - Verify frame 1: MainFold_Hinge rotation = 0°
   - Verify frame 100: MainFold_Hinge rotation = -180° (global Y, local Z)
   - This confirms your hinge range is 180°

### Step 1.2: Prepare for Export

1. **Apply Transforms (IMPORTANT):**
   - Select all mesh objects (NOT empties)
   - Object menu → Apply → All Transforms (Ctrl+A → All Transforms)
   - This resets location/rotation/scale to 0/0/1 while baking the transforms into the mesh
   - **Do NOT apply transforms to empties** - we need their exact positions/rotations

2. **Center Scene Origin (if needed):**
   - If your model is far from the world origin, consider moving it closer
   - This helps with Three.js camera framing

3. **Verify Materials:**
   - Ensure all meshes use Principled BSDF materials
   - This ensures materials export correctly to glTF

### Step 1.3: Export to glTF/GLB

1. **File → Export → glTF 2.0 (.glb/.gltf)**

2. **Export Settings:**

   **Include Tab:**
   - ✅ Limit to: Selected Objects (OR deselect to export all)
   - ✅ Custom Properties (important for preserving metadata)
   - ✅ Cameras: ON (optional, but useful for reference)
   - ✅ Punctual Lights: ON (optional)

   **Transform Tab:**
   - ✅ +Y Up: **MUST BE ENABLED** 
     (Converts Blender's Z-up to glTF's Y-up coordinate system)

   **Geometry Tab:**
   - ✅ Apply Modifiers: ON
   - ✅ UVs: ON
   - ✅ Normals: ON
   - ✅ Tangents: ON (if using normal maps)
   - Compression: None (for best compatibility)

   **Animation Tab:**
   - ⚠️ Animation: **DISABLED**
     (We don't want the baked animation - we'll create physics-driven motion)
   - If you want to keep it for reference, export two versions:
     - `model_static.glb` (no animation)
     - `model_animated.glb` (with animation for reference)

3. **Export Location:**
   - Save as: `vfold_mechanism.glb`
   - Choose a location accessible to your React project
   - Common location: `public/models/` or `src/assets/models/`

4. **Verify Export:**
   - Open the exported .glb file in an online viewer:
     - https://gltf-viewer.donmccurdy.com/
     - https://sandbox.babylonjs.com/
   - Check that:
     - All meshes are visible
     - Empties appear as nodes in the scene graph
     - Materials look correct
     - No missing textures

---

## PART 2: PROJECT SETUP

### Step 2.1: Create React + Vite Project

```bash
# Create new Vite project with React
npm create vite@latest vfold-physics -- --template react

cd vfold-physics
```

### Step 2.2: Install Dependencies

```bash
# Core dependencies
npm install three @react-three/fiber @react-three/drei

# Physics
npm install @react-three/rapier

# UI Controls
npm install leva

# Development dependencies
npm install --save-dev @types/three
```

### Step 2.3: Configure Vite for WASM (Rapier)

Rapier uses WebAssembly. Create `vite.config.js` in your project root:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat']
  }
})
```

### Step 2.4: Copy Model File

Place your `vfold_mechanism.glb` file in:
```
public/models/vfold_mechanism.glb
```

---

## PART 3: LOADING MODEL & EXTRACTING TRANSFORMS

### Step 3.1: Create Model Loader Component

Create `src/components/VFoldModel.jsx`:

```jsx
import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

export function VFoldModel({ onLoad }) {
  const { scene } = useGLTF('/models/vfold_mechanism.glb')
  const [transforms, setTransforms] = useState(null)

  useEffect(() => {
    // Extract empty transforms from loaded scene
    const extractedTransforms = extractEmptyTransforms(scene)
    setTransforms(extractedTransforms)
    
    // Pass to parent component
    if (onLoad) {
      onLoad(scene, extractedTransforms)
    }
  }, [scene, onLoad])

  return <primitive object={scene} />
}

// Extract position and rotation of empties
function extractEmptyTransforms(scene) {
  const transforms = {}
  
  scene.traverse((object) => {
    // Empties are imported as Object3D without geometry
    // They typically have "Hinge" or "Empty" in the name
    if (object.type === 'Object3D' && object.name.includes('Hinge')) {
      
      // Get world matrix to handle nested transforms
      const worldMatrix = new THREE.Matrix4()
      object.updateMatrixWorld()
      worldMatrix.copy(object.matrixWorld)
      
      // Decompose to get position and quaternion
      const position = new THREE.Vector3()
      const quaternion = new THREE.Quaternion()
      const scale = new THREE.Vector3()
      worldMatrix.decompose(position, quaternion, scale)
      
      // Extract local Z-axis (hinge axis in Blender)
      const localZ = new THREE.Vector3(0, 0, 1)
      localZ.applyQuaternion(quaternion)
      
      transforms[object.name] = {
        position: position.toArray(),
        quaternion: quaternion.toArray(),
        axis: localZ.toArray(), // This is the hinge rotation axis
        object: object
      }
      
      console.log(`Found hinge: ${object.name}`, {
        position: position.toArray(),
        axis: localZ.toArray()
      })
    }
  })
  
  return transforms
}
```

### Step 3.2: Verify Transform Extraction

Create a test component to visualize extracted empties:

```jsx
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

export function DebugHinges({ transforms }) {
  if (!transforms) return null
  
  return (
    <>
      {Object.entries(transforms).map(([name, data]) => (
        <HingeHelper key={name} name={name} data={data} />
      ))}
    </>
  )
}

function HingeHelper({ name, data }) {
  const ref = useRef()
  
  return (
    <group 
      ref={ref} 
      position={data.position}
      quaternion={data.quaternion}
    >
      {/* Visualize hinge position */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      
      {/* Visualize hinge axis */}
      <arrowHelper 
        args={[
          new THREE.Vector3(...data.axis), 
          new THREE.Vector3(0, 0, 0), 
          0.3, 
          0x00ff00
        ]} 
      />
      
      {/* Label */}
      <Html position={[0, 0.1, 0]}>
        <div style={{ fontSize: '10px', color: 'white' }}>
          {name}
        </div>
      </Html>
    </group>
  )
}
```

---

## PART 4: CREATING PHYSICS BODIES & JOINTS

### Step 4.1: Understand the Physics Setup

**Rigid Body Types in Rapier:**
- `fixed` - Cannot move (like Blender's Passive without animate)
- `dynamic` - Affected by forces (like Blender's Active)
- `kinematicPosition` - Moves via script, not physics (like Blender's Passive + Animate)

**Joint Types:**
- `RevoluteJoint` (formerly `RevoluteImpulseJoint`) - Equivalent to Blender's Hinge constraint

**Your Setup:**
- Left plane: `kinematicPosition` (motor-driven, controllable)
- Right plane: `fixed` (static)
- V-fold planes: `dynamic` (affected by physics)
- All joints: `RevoluteJoint`

### Step 4.2: Create Physics Component

Create `src/components/VFoldPhysics.jsx`:

```jsx
import { RigidBody, RevoluteJoint } from '@react-three/rapier'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function VFoldPhysics({ scene, transforms, motorAngle }) {
  // Refs for all rigid bodies
  const leftPlaneRef = useRef()
  const rightPlaneRef = useRef()
  const vfoldLeftRef = useRef()
  const vfoldRightRef = useRef()
  
  // Find meshes in the scene
  const meshes = findMeshes(scene)
  
  // Update motor position each frame
  useFrame(() => {
    if (leftPlaneRef.current && motorAngle !== undefined) {
      // Convert motor angle (0-180 degrees) to radians
      const targetRotation = (motorAngle * Math.PI) / 180
      
      // Get current rotation
      const currentQuat = leftPlaneRef.current.rotation()
      const currentEuler = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion(currentQuat.x, currentQuat.y, currentQuat.z, currentQuat.w)
      )
      
      // Create target quaternion based on hinge axis
      // Assuming rotation around Y-axis (adjust based on your setup)
      const targetQuat = new THREE.Quaternion()
      targetQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation)
      
      // Set kinematic position
      leftPlaneRef.current.setNextKinematicRotation(targetQuat)
    }
  })
  
  if (!transforms || !meshes) return null
  
  return (
    <group>
      {/* Left Plane - Motor Driven (Kinematic) */}
      <RigidBody 
        ref={leftPlaneRef}
        type="kinematicPosition"
        position={transforms.LeftPlane_Hinge.position}
      >
        <primitive object={meshes.LeftPlane} />
      </RigidBody>
      
      {/* Right Plane - Fixed */}
      <RigidBody 
        ref={rightPlaneRef}
        type="fixed"
        position={transforms.RightPlane_Hinge.position}
      >
        <primitive object={meshes.RightPlane} />
      </RigidBody>
      
      {/* V-Fold Left - Dynamic */}
      <RigidBody 
        ref={vfoldLeftRef}
        type="dynamic"
        position={transforms.VFold_Left_Hinge.position}
      >
        <primitive object={meshes.VFold_Left} />
      </RigidBody>
      
      {/* V-Fold Right - Dynamic */}
      <RigidBody 
        ref={vfoldRightRef}
        type="dynamic"
        position={transforms.VFold_Right_Hinge.position}
      >
        <primitive object={meshes.VFold_Right} />
      </RigidBody>
      
      {/* JOINTS */}
      
      {/* Main Fold Joint - connects left plane to right plane */}
      <RevoluteJoint
        body1={leftPlaneRef}
        body2={rightPlaneRef}
        params={{
          anchorA: [0, 0, 0], // Joint position in leftPlane's local space
          anchorB: calculateRelativePosition(
            transforms.LeftPlane_Hinge.position,
            transforms.RightPlane_Hinge.position
          ),
          axis: transforms.MainFold_Hinge.axis, // Rotation axis
          limits: [0, Math.PI] // 0 to 180 degrees
        }}
      />
      
      {/* Add more RevoluteJoints for V-fold connections */}
      {/* ... */}
    </group>
  )
}

// Helper: Find mesh objects by name
function findMeshes(scene) {
  const meshes = {}
  scene.traverse((object) => {
    if (object.isMesh) {
      meshes[object.name] = object.clone()
    }
  })
  return meshes
}

// Helper: Calculate relative position between two points
function calculateRelativePosition(posA, posB) {
  return [
    posB[0] - posA[0],
    posB[1] - posA[1],
    posB[2] - posA[2]
  ]
}
```

### Step 4.3: Handle Coordinate System Differences

**CRITICAL: Blender uses Z-up, Three.js uses Y-up**

The glTF exporter with "+Y Up" enabled handles the conversion, but you need to be aware:

- Blender's global Y-axis → Three.js Z-axis
- Blender's global Z-axis → Three.js Y-axis
- Blender's local Z-axis on empties → Needs rotation to match Three.js

When you extract the axis with `localZ.applyQuaternion(quaternion)`, it's already in Three.js space.

### Step 4.4: Configure RevoluteJoint with Limits and Motor

```jsx
<RevoluteJoint
  body1={leftPlaneRef}
  body2={rightPlaneRef}
  params={{
    // Joint anchor points in local space of each body
    anchorA: [0, 0, 0],
    anchorB: [relativeX, relativeY, relativeZ],
    
    // Rotation axis (extracted from empty's local Z-axis)
    axis: transforms.MainFold_Hinge.axis,
    
    // Limits in radians (0° to 180°)
    limits: [0, Math.PI],
    
    // Optional: Add motor for active control
    // (Not needed if using kinematic body)
    // motorModel: 'force', // or 'acceleration'
    // motorVelocity: 0.5,
    // motorMaxForce: 100
  }}
/>
```

---

## PART 5: MOTOR CONTROL WITH LEVA

### Step 5.1: Create Control Panel

```jsx
import { useControls } from 'leva'

export function VFoldScene() {
  // Create motor control slider
  const { motorAngle } = useControls({
    motorAngle: {
      value: 0,
      min: 0,
      max: 180,
      step: 1,
      label: 'Motor Angle (°)'
    }
  })
  
  const [transforms, setTransforms] = useState(null)
  const [loadedScene, setLoadedScene] = useState(null)
  
  return (
    <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Physics gravity={[0, -9.81, 0]}>
        {loadedScene && transforms && (
          <VFoldPhysics 
            scene={loadedScene}
            transforms={transforms}
            motorAngle={motorAngle}
          />
        )}
      </Physics>
      
      <VFoldModel 
        onLoad={(scene, transforms) => {
          setLoadedScene(scene)
          setTransforms(transforms)
        }}
      />
      
      <OrbitControls />
      <gridHelper args={[10, 10]} />
    </Canvas>
  )
}
```

---

## PART 6: COMPLETE WORKING EXAMPLE

### Step 6.1: Main App Component

Create `src/App.jsx`:

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { VFoldScene } from './components/VFoldScene'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VFoldScene />
    </div>
  )
}
```

### Step 6.2: Complete VFoldScene Component

Create `src/components/VFoldScene.jsx`:

```jsx
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { VFoldModel } from './VFoldModel'
import { VFoldPhysics } from './VFoldPhysics'

export function VFoldScene() {
  const [transforms, setTransforms] = useState(null)
  const [loadedScene, setLoadedScene] = useState(null)
  
  // Motor control
  const { motorAngle, showDebug } = useControls({
    motorAngle: {
      value: 0,
      min: 0,
      max: 180,
      step: 1,
      label: 'Motor Angle (°)'
    },
    showDebug: {
      value: false,
      label: 'Show Hinge Debug'
    }
  })
  
  const handleModelLoad = (scene, extractedTransforms) => {
    console.log('Model loaded:', scene)
    console.log('Extracted transforms:', extractedTransforms)
    setLoadedScene(scene)
    setTransforms(extractedTransforms)
  }
  
  return (
    <Canvas 
      camera={{ position: [3, 3, 5], fov: 50 }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
      />
      
      {/* Physics World */}
      <Physics 
        debug={showDebug}
        gravity={[0, -9.81, 0]}
      >
        {loadedScene && transforms && (
          <VFoldPhysics 
            scene={loadedScene}
            transforms={transforms}
            motorAngle={motorAngle}
          />
        )}
      </Physics>
      
      {/* Load Model (visual only, physics created separately) */}
      <VFoldModel onLoad={handleModelLoad} />
      
      {/* Camera Controls */}
      <OrbitControls />
      
      {/* Ground Grid */}
      <gridHelper args={[10, 10]} />
    </Canvas>
  )
}
```

---

## PART 7: TROUBLESHOOTING & REFINEMENT

### Common Issues & Solutions

#### Issue 1: Joints Don't Connect Properly
**Problem:** Bodies drift apart or joint doesn't constrain properly
**Solution:**
- Verify anchor points are in local space of each body
- Check that axis direction is correct (use debug visualization)
- Ensure bodies have colliders (add `<CuboidCollider />` inside RigidBody)

#### Issue 2: Motor Doesn't Work
**Problem:** Kinematic body doesn't rotate when motorAngle changes
**Solution:**
- Check `setNextKinematicRotation()` is called each frame
- Verify rotation axis matches your hinge axis
- Try different axis (X, Y, or Z) if rotation seems wrong

#### Issue 3: Physics "Explodes"
**Problem:** Bodies fly apart or spin wildly
**Solution:**
- Reduce mass of dynamic bodies
- Add damping: `linearDamping={0.5} angularDamping={0.5}`
- Check collider sizes don't overlap initially
- Reduce gravity or time step if too aggressive

#### Issue 4: Empties Not Found
**Problem:** `extractEmptyTransforms()` returns empty object
**Solution:**
- Check naming: empties must contain "Hinge" in name
- Verify empties were exported (check in glTF viewer)
- Try different traversal logic:
  ```js
  if (!object.isMesh && object.name.includes('Hinge'))
  ```

#### Issue 5: Coordinate System Confusion
**Problem:** Rotations happen around wrong axis
**Solution:**
- Remember: Blender Z-up → Three.js Y-up (handled by "+Y Up" export)
- Blender local Z-axis → Extract with `localZ.applyQuaternion(quaternion)`
- Test with simple rotation first: `new THREE.Vector3(0, 1, 0)` for Y-axis

### Performance Optimization

1. **Use Instanced Meshes** (if you have repeated geometry)
2. **Simplify Colliders:**
   ```jsx
   <CuboidCollider args={[width/2, height/2, depth/2]} />
   ```
   Instead of using the actual mesh geometry

3. **Reduce Physics Step Rate** (if performance is an issue):
   ```jsx
   <Physics timeStep="vary" interpolate={false}>
   ```

4. **Limit Debug Mode** (only enable when needed)

---

## PART 8: ADVANCED: PROPER JOINT CONFIGURATION

### Step 8.1: Calculate Proper Anchor Points

For each joint, you need anchor points in the local space of each connected body:

```jsx
function createJointAnchors(bodyAPosition, bodyBPosition, jointPosition) {
  // Convert world positions to local space
  const anchorA = [
    jointPosition[0] - bodyAPosition[0],
    jointPosition[1] - bodyAPosition[1],
    jointPosition[2] - bodyAPosition[2]
  ]
  
  const anchorB = [
    jointPosition[0] - bodyBPosition[0],
    jointPosition[1] - bodyBPosition[1],
    jointPosition[2] - bodyBPosition[2]
  ]
  
  return { anchorA, anchorB }
}
```

### Step 8.2: Example Complete Joint Setup

```jsx
// Extract hinge transform - main fold connects left and right planes
const mainHinge = transforms.LeftPlane_RightPlane_Hinge
const leftPlanePos = [0, 0, 0] // Adjust to your actual position
const rightPlanePos = [0.5, 0, 0] // Adjust to your actual position

// Calculate anchors
const { anchorA, anchorB } = createJointAnchors(
  leftPlanePos,
  rightPlanePos,
  mainHinge.position
)

// Create joint with proper configuration
<RevoluteJoint
  body1={leftPlaneRef}
  body2={rightPlaneRef}
  params={{
    anchorA: anchorA,
    anchorB: anchorB,
    axis: mainHinge.axis,
    limits: [0, Math.PI], // 0° to 180°
  }}
/>

// Example: Left plane to left v-fold connection
const leftVFoldHinge = transforms.LeftPlane_VFold_Left_Hinge
// ... calculate anchors and create joint
```

---

## PART 9: VERIFICATION CHECKLIST

### Before Export from Blender:
- [ ] All mesh objects have transforms applied
- [ ] Empties are positioned at exact hinge points
- [ ] Empty local Z-axes point along rotation axes
- [ ] Objects have meaningful names
- [ ] Materials use Principled BSDF
- [ ] Animation is disabled in export settings

### After Export:
- [ ] .glb file loads in online viewer
- [ ] All meshes visible
- [ ] Empties appear as nodes in scene graph
- [ ] Materials/textures present

### In Three.js:
- [ ] Model loads without errors
- [ ] Transforms extracted successfully
- [ ] Debug visualization shows correct hinge positions/axes
- [ ] Rigid bodies created for all planes
- [ ] Joints connect bodies properly
- [ ] Motor control slider affects left plane rotation
- [ ] Physics simulation runs smoothly

---

## PART 10: NEXT STEPS

### Enhancements to Consider:

1. **Add Colliders:**
   ```jsx
   <RigidBody>
     <CuboidCollider args={[width/2, height/2, depth/2]} />
     <primitive object={mesh} />
   </RigidBody>
   ```

2. **Add Joint Limits Visualization:**
   - Show min/max rotation angles visually
   - Add arc gizmos at hinge points

3. **Add Motor Speed Control:**
   - Instead of direct angle control, use velocity-based motor
   - Smoother transitions

4. **Export Multiple Versions:**
   - Static version for physics
   - Animated version for reference
   - Debug version with visible empties/axes

5. **Save Joint Configuration:**
   - Export joint data as JSON from Blender
   - Import in Three.js to avoid manual setup

---

## SUMMARY

**Workflow:**
1. ✅ Prepare Blender scene with proper naming and empty placement
2. ✅ Apply transforms to meshes (not empties)
3. ✅ Export as .glb with "+Y Up" enabled, animation disabled
4. ✅ Set up R3F + Rapier project
5. ✅ Load .glb and extract empty transforms
6. ✅ Create RigidBody components for each plane
7. ✅ Create RevoluteJoint components using extracted transforms
8. ✅ Add Leva control for motor angle
9. ✅ Update kinematic body rotation each frame

**Key Insights:**
- glTF preserves empty positions/rotations (not rigid body physics)
- RevoluteJoint = Blender Hinge constraint
- Kinematic bodies for motor-driven parts
- Extract local Z-axis from empties for hinge axis
- Anchor points must be in local space of connected bodies

**Remember:**
- You're manually recreating physics in Three.js
- Blender animation is just reference
- Empty transforms provide hinge placement/orientation
- Test incrementally (one joint at a time)
