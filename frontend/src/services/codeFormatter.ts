export const formatCode = (
  code: string,
  language: string
): string => {
  try {
    switch (language) {
      case 'cpp':
        return formatCpp(code);
      case 'python':
        return formatPython(code);
      default:
        return code;
    }
  } catch (error) {
    console.error('Formatting error:', error);
    return code;
  }
};

const formatCpp = (code: string): string => {
  const lines = code.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    if (trimmed.includes('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = '  '.repeat(indentLevel);
    formatted.push(indent + trimmed);

    if (trimmed.includes('{')) {
      indentLevel++;
    }
  }

  return formatted.join('\n');
};

// Simple Python formatter since Prettier doesn't support Python
const formatPython = (code: string): string => {
  const lines = code.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    // Handle dedent keywords
    if (/^(except|elif|else|finally)/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add indentation
    const indent = '    '.repeat(indentLevel);
    formatted.push(indent + trimmed);

    // Increase indent after colon
    if (trimmed.endsWith(':')) {
      indentLevel++;
    }
  }

  return formatted.join('\n');
};
