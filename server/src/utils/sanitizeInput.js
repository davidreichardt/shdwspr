const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
  if (typeof input !== 'string') return null;

  const clean = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  return clean.length > maxLength ? clean.slice(0, maxLength) : clean;
}

module.exports = { sanitizeInput };
