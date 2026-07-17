const sanitizeHtml = require('sanitize-html');

// Used for post content — a restricted set of rich-text tags, no scripts,
// no inline event handlers, no arbitrary styles.
const sanitizeRichText = (dirty) =>
  sanitizeHtml(dirty || '', {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
      'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });

// Used for comments — plain-ish text, no HTML at all.
const sanitizePlainText = (dirty) =>
  sanitizeHtml(dirty || '', { allowedTags: [], allowedAttributes: {} }).trim();

module.exports = { sanitizeRichText, sanitizePlainText };
