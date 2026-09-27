/**
 * Client-side image compressor and Base64 converter for Product Images
 * Avoids heavy document sizes in Firestore.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeKB?: number;
}

export async function compressImageToBase64(
  file: File,
  options: CompressOptions = {}
): Promise<{ base64: string; sizeKB: number }> {
  const {
    maxWidth = 640,
    maxHeight = 640,
    quality = 0.75,
    maxFileSizeKB = 350,
  } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preservation
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        let format = 'image/webp';
        let base64 = canvas.toDataURL(format, quality);

        // Calculate size in KB
        let sizeKB = Math.round((base64.length * (3 / 4)) / 1024);

        if (sizeKB > maxFileSizeKB) {
          // Retry with lower quality
          base64 = canvas.toDataURL('image/jpeg', 0.6);
          sizeKB = Math.round((base64.length * (3 / 4)) / 1024);
        }

        resolve({ base64, sizeKB });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
