// src/utils/notification.js
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const defaultOptions = {
  autoClose: 3000,
  position: toast.POSITION.TOP_RIGHT,
  theme: 'colored',
};

export const notify = {
  /**
   * Show a success toast notification
   * @param {string} message - The message to display
   * @param {object} options - Toast options to override defaults
   */
  success(message, options = {}) {
    toast.success(message, { ...defaultOptions, ...options });
  },

  /**
   * Show an error toast notification
   * @param {string} message - The message to display
   * @param {object} options - Toast options to override defaults
   */
  error(message, options = {}) {
    toast.error(message, { 
      ...defaultOptions, 
      ...options,
      autoClose: options.autoClose || 5000 // Error messages stay longer by default
    });
  },

  /**
   * Show an info toast notification
   * @param {string} message - The message to display
   * @param {object} options - Toast options to override defaults
   */
  info(message, options = {}) {
    toast.info(message, { ...defaultOptions, ...options });
  },

  /**
   * Show a warning toast notification
   * @param {string} message - The message to display
   * @param {object} options - Toast options to override defaults
   */
  warning(message, options = {}) {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  /**
   * Show a loading toast notification that can be updated later
   * @param {string} message - The message to display
   * @returns {string} Toast ID that can be used to update or dismiss the toast
   */
  loading(message = 'Loading...') {
    return toast.loading(message, {
      ...defaultOptions,
      autoClose: false, // Loading toasts don't auto close
    });
  },

  /**
   * Update an existing toast notification
   * @param {string} toastId - The ID of the toast to update
   * @param {string} message - The new message
   * @param {string} type - The new toast type (success, error, info, warning)
   * @param {object} options - New toast options
   */
  update(toastId, message, type = 'success', options = {}) {
    toast.update(toastId, {
      render: message,
      type: toast.TYPE[type.toUpperCase()],
      ...options,
      isLoading: false,
    });
  },

  /**
   * Dismiss all toast notifications
   */
  dismissAll() {
    toast.dismiss();
  },

  /**
   * Dismiss a specific toast notification
   * @param {string} toastId - The ID of the toast to dismiss
   */
  dismiss(toastId) {
    toast.dismiss(toastId);
  }
};

export default notify;