/**
 * URL parsing utilities
 */

/**
 * Extracts the portion of the URL following the "/id/" segment.
 * Useful for extracting auth tokens from reset links.
 *
 * @returns {string|null} The path after "/id/" or null if not found.
 */
export const getPathAfterId = () => {
  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");
  const idIndex = parts.indexOf("id");

  if (idIndex !== -1 && idIndex < parts.length - 1) {
    return parts.slice(idIndex + 1).join("/");
  }

  return null;
};
