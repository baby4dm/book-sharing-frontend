export function Spinner({
  size = 20,
  label = "Завантаження",
}: {
  size?: number;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className="inline-block shrink-0 animate-spin rounded-full border-2 border-[oklch(0.21_0.01_158/0.12)] border-t-primary animation-duration-[700ms]"
    />
  );
}
