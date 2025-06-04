/**
 * Validation utilities for the SDI Router application
 */

/**
 * Validates label input for VideoHub compatibility
 * VideoHub typically accepts alphanumeric characters, spaces, hyphens, and underscores
 * @param {string} label - The label to validate
 * @returns {object} - { isValid: boolean, error: string|null, sanitized: string }
 */
export const validateLabel = (label) => {
  // Trim whitespace
  const trimmed = label.trim();
  
  // Check if empty
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Label cannot be empty',
      sanitized: ''
    };
  }
  
  // Check length (VideoHub limit is typically 20 characters)
  if (trimmed.length > 20) {
    return {
      isValid: false,
      error: 'Label must be 20 characters or less',
      sanitized: trimmed.substring(0, 20)
    };
  }
  
  // Define allowed characters: alphanumeric, spaces, hyphens, underscores, periods
  // This regex matches strings that contain only these characters
  const allowedCharsRegex = /^[a-zA-Z0-9\s\-_.]+$/;
  
  if (!allowedCharsRegex.test(trimmed)) {
    // Sanitize by removing invalid characters
    const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-_.]/g, '');
    
    return {
      isValid: false,
      error: 'Only letters, numbers, spaces, hyphens, underscores, and periods are allowed',
      sanitized: sanitized
    };
  }
  
  // Check for excessive spaces
  const normalizedSpaces = trimmed.replace(/\s+/g, ' ');
  if (normalizedSpaces !== trimmed) {
    return {
      isValid: false,
      error: 'Multiple consecutive spaces are not allowed',
      sanitized: normalizedSpaces
    };
  }
  
  // All validations passed
  return {
    isValid: true,
    error: null,
    sanitized: trimmed
  };
};

/**
 * Sanitizes a label by removing invalid characters
 * @param {string} label - The label to sanitize
 * @returns {string} - The sanitized label
 */
export const sanitizeLabel = (label) => {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '') // Remove invalid characters
    .replace(/\s+/g, ' ')                // Normalize spaces
    .substring(0, 20);                   // Enforce max length
};

/**
 * Gets a display-friendly error message for label validation
 * @param {string} error - The error from validateLabel
 * @returns {string} - User-friendly error message
 */
export const getLabelErrorMessage = (error) => {
  const errorMessages = {
    'Label cannot be empty': 'Please enter a label',
    'Label must be 20 characters or less': 'Maximum 20 characters allowed',
    'Only letters, numbers, spaces, hyphens, underscores, and periods are allowed': 'Invalid characters detected',
    'Multiple consecutive spaces are not allowed': 'Please use single spaces only'
  };
  
  return errorMessages[error] || error;
};