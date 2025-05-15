// Example of using API tokens securely through environment variables

export async function fetchDataFromAPI() {
  try {
    // Use environment variable for the API token
    const apiToken = process.env.API_TOKEN;
    
    // If token is not available, handle it gracefully
    if (!apiToken) {
      console.error('API token not found in environment variables');
      throw new Error('API token is missing');
    }
    
    const response = await fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// For client-side public API keys (safe to include in browser)
// Only use this for keys that are meant to be public
export function getPublicAPIConfig() {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
  };
} 