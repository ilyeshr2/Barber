import { alert } from '@nativescript/core/ui/dialogs';

const ErrorHandler = {
  // Show an error alert with a generic message
  showError(error, customMessage = null) {
    const message = customMessage || this.getErrorMessage(error);
    
    alert({
      title: "Error",
      message: message,
      okButtonText: "OK"
    });
  },
  
  // Get a user-friendly error message
  getErrorMessage(error) {
    if (!error) {
      return "An unknown error occurred";
    }
    
    // Use error.message if available
    if (error.message) {
      return error.message;
    }
    
    // Convert error to string if it's not an Error object
    if (typeof error === 'string') {
      return error;
    }
    
    return "An unexpected error occurred. Please try again.";
  },
  
  // Handle API errors with different response based on error type
  handleApiError(error, defaultMessage = "An error occurred while contacting the server") {
    console.error('API error:', error);
    
    // Check for network connection errors
    if (error.message && (
        error.message.includes('Network connection error') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')
      )) {
      return "Network connection error. Please check your internet connection and try again.";
    }
    
    // Check for authentication errors
    if (error.message && (
        error.message.includes('session has expired') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid token')
      )) {
      return "Your session has expired. Please log in again.";
    }
    
    // Return the error message if available, or the default message
    return error.message || defaultMessage;
  },
  
  // Log errors for debugging
  logError(context, error) {
    console.error(`Error in ${context}:`, error);
    
    // Could be extended to send errors to a remote logging service
    // e.g., Crashlytics, Sentry, etc.
  }
};

export default ErrorHandler;