const DEFAULT_MAX_UPLOAD_FILE_SIZE_MB = 4.5;

export const getMaxUploadFileSizeMb = (): number => {
  const raw = process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB;
  if (!raw) {
    return DEFAULT_MAX_UPLOAD_FILE_SIZE_MB;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_FILE_SIZE_MB;
};

export const getMaxUploadFileSizeBytes = (): number => Math.floor(getMaxUploadFileSizeMb() * 1024 * 1024);
