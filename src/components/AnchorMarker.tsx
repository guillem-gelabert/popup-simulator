import type { Vector3 } from "three";

export default function AnchorMarker({
  position,
  color,
}: {
  position: Vector3;
  color?: string;
}) {
  const defaultColor = "yellow";
  return (
    <sprite position={position} scale={[0.1, 0.1, 0.1]}>
      <spriteMaterial color={color ?? defaultColor} depthTest={false} />
    </sprite>
  );
}
