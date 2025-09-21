// API configuration
const API_CONFIG = {
  // Base URL for backend API requests
  // Change this to match your backend server address and port
  API_BASE_URL: 'http://localhost:5000',
  
  // Config options
  options: {
    // Maximum time to wait for an API response before using fallback (in milliseconds)
    requestTimeout: 5000,
    
    // Whether to use fallbacks when API requests fail
    useFallbacks: true,
    
    // Retry configuration
    retries: {
      // Number of times to retry failed requests before using fallback
      maxRetries: 2,
      // Delay between retries (in milliseconds)
      retryDelay: 1000,
    }
  },
  
  // Endpoints
  endpoints: {
    textToSpeech: '/api/text-to-speech',
    speechToText: '/api/speech-to-text',
    getTranscription: '/api/speech-to-text/job',
    checkPronunciation: '/api/check-pronunciation',
  }
};

export default API_CONFIG;