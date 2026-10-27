const TINTS = [
  "bg-tint-green text-tint-green-ink",
  "bg-tint-blue text-tint-blue-ink",
  "bg-tint-amber text-tint-amber-ink",
  "bg-tint-rose text-tint-rose-ink",
  "bg-tint-teal text-tint-teal-ink",
  "bg-tint-clay text-tint-clay-ink",
] as const;

export function personTint(seed: string | null | undefined): string {
  const key = seed ?? "";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return TINTS[Math.abs(hash) % TINTS.length];
}
