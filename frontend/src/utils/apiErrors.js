// Turn an Axios error into one message for the user.
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error.response) {
    return 'Cannot reach the server. Check your connection and that the backend is running.';
  }
  const detail = error.response.data?.detail;
  if (typeof detail === 'string') return detail;
  return fallback;
}

// Turn DRF validation errors, {field: ['message', ...]}, into {field: 'message'}.
export function getFieldErrors(error) {
  const data = error.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

  const result = {};
  for (const [field, messages] of Object.entries(data)) {
    if (field === 'detail') continue;
    result[field] = Array.isArray(messages) ? messages.join(' ') : String(messages);
  }
  return result;
}