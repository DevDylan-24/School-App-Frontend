// api.js - API helper with JWT authentication

// const API_BASE_URL = 'http://localhost:3000/api';

const API_BASE_URL = 'https://school-app-backend-zjnz.onrender.com/api';



// Generic request function that automatically adds JWT token to headers
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get JWT token from localStorage
  const token = localStorage.getItem('token') || null;
  
  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Merge options with our headers
  const config = {
    ...options,
    headers,
  };


  try {
    const response = await fetch(url, config);
    
    
    // Check if response is OK
    if (!response.ok) {
      // Handle HTTP errors
        const status = response.status;
        const errorData = await response.json().catch(() => ({}));
        
        // Append status to errorData
        errorData.status = status;
        return errorData; // Return error data if available

    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('API request failed:', error);

  }
}


// GET request
export async function get(endpoint) {
  return request(endpoint, {
    method: 'GET',
  });
}


//  POST request
export async function post(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


//  PUT request
export async function put(endpoint, data) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}


//  DELETE request
export async function del(endpoint) {
  return request(endpoint, {
    method: 'DELETE',
  });
}

//  Get current user's token
export function getToken() {
  return localStorage.getItem('token');
}

// Remove token (logout)
export function removeToken() {
  localStorage.removeItem('token');
}


// Set token (login)
export function setToken(token) {
  localStorage.setItem('token', token);
}

// Export all functions
export default {
  get,
  post,
  put,
  delete: del,
  getToken,
  removeToken,
  setToken,
};