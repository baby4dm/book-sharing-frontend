export const POST_PHOTO_MAX_MB = 5;
export const POST_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePostPhoto(file: File): string | null {
  if (!POST_PHOTO_TYPES.includes(file.type)) {
    return "Підтримуються лише JPG, PNG або WebP";
  }
  if (file.size > POST_PHOTO_MAX_MB * 1024 * 1024) {
    return `Фото завелике — максимум ${POST_PHOTO_MAX_MB} МБ`;
  }
  return null;
}
