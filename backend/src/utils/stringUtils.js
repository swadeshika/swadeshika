/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified string
 */
exports.slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\p{L}\p{N}\p{M}\-]+/gu, '') // Remove all non-word chars (supporting Unicode letters, numbers, and marks)
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};
