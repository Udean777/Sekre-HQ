export function extractErrorMessage(
  error: any,
  fallbackMessage: string = "Terjadi kesalahan.",
): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}
