import { v2 as cloudinary } from 'cloudinary';

// Support both CLOUDINARY_URL format and individual variables
let hasCloudinaryConfig = false;
let cloudName = '';
let apiKey = '';
let apiSecret = '';

// Check for CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  try {
    const url = process.env.CLOUDINARY_URL;
    // Parse: cloudinary://api_key:api_secret@cloud_name
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
      
      // Validate that all parts are non-empty
      if (apiKey && apiSecret && cloudName) {
        hasCloudinaryConfig = true;
      } else {
        console.warn('CLOUDINARY_URL parsed but contains empty values');
      }
    } else {
      console.warn('CLOUDINARY_URL format is invalid. Expected: cloudinary://api_key:api_secret@cloud_name');
    }
  } catch (error) {
    console.error('Failed to parse CLOUDINARY_URL:', error);
  }
}

// Fallback to individual environment variables
if (!hasCloudinaryConfig) {
  cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  apiKey = process.env.CLOUDINARY_API_KEY || '';
  apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  
  // Validate all required variables are present
  if (cloudName && apiKey && apiSecret) {
    hasCloudinaryConfig = true;
  } else {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    console.warn(`Cloudinary configuration incomplete. Missing: ${missing.join(', ')}`);
  }
}

// Configure Cloudinary if we have valid credentials
if (hasCloudinaryConfig) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log('Cloudinary configured successfully');
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error);
    hasCloudinaryConfig = false;
  }
} else {
  console.warn('Cloudinary is not configured. Uploads will fail until configuration is provided.');
}

export function assertCloudinaryConfigured() {
  if (!hasCloudinaryConfig) {
    const errorMessage = 
      'Cloudinary is not configured. Please set one of the following:\n' +
      '1. CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)\n' +
      '2. Or set all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET\n' +
      'Check your .env file or environment variables.';
    throw new Error(errorMessage);
  }
}

export { cloudinary };
