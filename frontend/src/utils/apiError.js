export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error.response) return "Unable to reach the server. Check your connection and try again.";
  if (error.response.status === 403) return "You do not have permission to perform this action.";
  if (error.response.status >= 500) return "The server encountered an error. Please try again shortly.";
  return error.response.data?.message || fallback;
};
