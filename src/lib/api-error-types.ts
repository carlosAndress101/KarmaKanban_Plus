// Common type for API error responses
export type ApiErrorResponse = {
  error?: string;
};

// Helper function to safely parse error responses
export const parseApiError = (
  errorData: unknown,
  fallbackMessage: string
): string => {
  const typedError = errorData as ApiErrorResponse;
  return typedError?.error || fallbackMessage;
};
