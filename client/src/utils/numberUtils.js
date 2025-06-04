// Utility functions for handling input/output numbering
// Internal: 0-119 (protocol), Display: 1-120 (user interface)

export const formatDisplayNumber = (internalIndex) => {
  // Convert internal 0-119 to display 1-120
  return String(internalIndex + 1).padStart(3, '0');
};

export const parseDisplayNumber = (displayNumber) => {
  // Convert display 1-120 to internal 0-119
  return parseInt(displayNumber) - 1;
};

export const getDefaultLabel = (type, internalIndex) => {
  // Generate default labels using display numbering
  const displayNumber = internalIndex + 1;
  return `${type === 'inputs' ? 'Input' : 'Output'} ${displayNumber}`;
};

export const validateInputRange = (internalIndex) => {
  return internalIndex >= 0 && internalIndex <= 119;
};

export const validateOutputRange = (internalIndex) => {
  return internalIndex >= 0 && internalIndex <= 119;
};

export const validateDisplayInputRange = (displayNumber) => {
  const num = parseInt(displayNumber);
  return num >= 1 && num <= 120;
};

export const validateDisplayOutputRange = (displayNumber) => {
  const num = parseInt(displayNumber);
  return num >= 1 && num <= 120;
};