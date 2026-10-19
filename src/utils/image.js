/**
 * Image processing utilities
 */

/**
 * Resize image to max dimensions while maintaining aspect ratio
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Optional maximum height
 * @returns {Promise<File>} Resized image as a File object
 */
export const resizeImage = (file, maxWidth, maxHeight = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob then File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/png",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          "image/png",
          0.95
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert file to base64 string (without MIME type prefix)
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Validate format if needed, but here we just convert
    reader.onload = () => {
      let base64String = reader.result?.split(",")[1];
      if (base64String) {
        base64String = base64String.replace(/["',:;]/g, "");
      }
      resolve(base64String);
    };

    reader.onerror = (error) => reject(error);
  });
};

/**
 * Check if image loads successfully
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>}
 */
export const checkImageLoad = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};
