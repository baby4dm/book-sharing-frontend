export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-border border-t-accent-vivid animate-spin"
    />
  );
}
