const HEIC_EXT_REGEX = /\.(heic|heif)$/i;

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
};

export const isHeicLikeFile = (file: File) => {
  const type = file.type.toLowerCase();
  return type === 'image/heic' || type === 'image/heif' || HEIC_EXT_REGEX.test(file.name);
};

export const sanitizeUploadFileName = (fileName: string) =>
  fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const getUploadContentType = (file: File) => {
  if (file.type?.trim()) return file.type;

  const extension = file.name.split('.').pop()?.toLowerCase();
  return (extension && MIME_TYPES_BY_EXTENSION[extension]) || 'application/octet-stream';
};

export async function compressImageForUpload(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<{ file: Blob | File; contentType: string }> {
  const contentType = getUploadContentType(file);

  if (!contentType.startsWith('image/') || isHeicLikeFile(file)) {
    return { file, contentType };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const compressedBlob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);

        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Não foi possível comprimir a imagem.'));
            return;
          }

          resolve(blob);
        }, 'image/jpeg', quality);
      };

      img.onerror = () => reject(new Error('Formato de imagem não suportado para compressão.'));
      img.src = objectUrl;
    });

    return { file: compressedBlob, contentType: 'image/jpeg' };
  } catch {
    return { file, contentType };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}