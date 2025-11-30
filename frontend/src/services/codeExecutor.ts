export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

export const executeCode = async (
  code: string,
  language: string
): Promise<ExecutionResult> => {
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      output: result.output || '',
      error: result.error,
      executionTime: result.execution_time * 1000, // Convert to milliseconds
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Network error',
      executionTime: 0,
    };
  }
};

// All execution logic moved to backend