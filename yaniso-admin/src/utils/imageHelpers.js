/**
 * Formats an image URL by adding the API base URL prefix to relative paths
 * 
 * @param {string} imageUrl - The image URL to format
 * @param {string} defaultImage - The default image to use if imageUrl is null/undefined/empty
 * @returns {string} The formatted image URL
 */
export function formatImageUrl(imageUrl, defaultImage = '/images/default-placeholder.jpg') {
  
  if (!imageUrl) {
    return defaultImage;
  }
  
  // If it's a data URL (from a file input preview), return as is
  if (imageUrl.startsWith('data:')) {
    console.log('Data URL detected, returning as is');
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (imageUrl.startsWith('/uploads/')) {
    // Try to get API base URL from environment variables (works with both Vue CLI and Vite)
    const apiBaseUrl = import.meta.env?.VITE_API_URL || 
                      process.env?.VUE_APP_API_URL || 
                      'http://localhost:3000';
    
    // Remove /api from the end if present to avoid doubling it
    const baseUrl = apiBaseUrl.endsWith('/api') 
      ? apiBaseUrl.substring(0, apiBaseUrl.length - 4) 
      : apiBaseUrl;
    
    const formattedUrl = `${baseUrl}${imageUrl}`;
    return formattedUrl;
  }
  
  // Return as-is if it's already an absolute URL or a local asset path
  return imageUrl;
}

/**
 * Formats a barber image URL, providing a default image if none is available
 * 
 * @param {Object} barber - The barber object
 * @param {number} barbierId - The barber ID, used for generating a default image
 * @returns {string} The formatted barber image URL
 */
export function formatBarberImageUrl(barber, barbierId) {
  // Check both photo_url and photoUrl fields
  const photoUrl = barber?.photoUrl || barber?.photo_url;
  
  // If we have a photo URL, format it
  if (photoUrl) {
    return formatImageUrl(photoUrl);
  }
  
  // Generate a default barber image based on ID
  return `/images/barber-${(barbierId % 5) + 1}.jpg`;
}

/**
 * Formats a publication image URL, providing a default image if none is available
 * 
 * @param {Object} publication - The publication object
 * @returns {string} The formatted publication image URL
 */
export function formatPublicationImageUrl(publication) {
  // Use image_url field or fallback to imageUrl field
  const imageUrl = publication?.image_url || publication?.imageUrl;
  
  return formatImageUrl(imageUrl, '/images/placeholder-post.jpg');
} 