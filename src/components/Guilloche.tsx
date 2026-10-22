// Banknote-style engraved line texture, drawn in the object's colour.
export function Guilloche({ color, width = 800, height = 600, lines = 22, amp = 14 }: { color: string; width?: number; height?: number; lines?: number; amp?: number }) {
  const paths: string[] = [];
  for (let k = 0; k < lines; k++) {
    const y0 = (height * (k + 0.5)) / lines;
    const pts: string[] = [];
    for (let x = 0; x <= width; x += 8) {
      const y = y0 + amp * Math.sin(x / 37 + k * 0.55) * Math.cos(x / 91 - k * 0.3);
      pts.push(`${x},${y.toFixed(1)}`);
    }
    paths.push(pts.join(" "));
  }
  return (
    <svg aria-hidden viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {paths.map((p, i) => (
        <polyline key={i} points={p} fill="none" stroke={color} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
