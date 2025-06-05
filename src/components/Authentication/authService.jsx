let userCache = null; // Add a cache variable

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const handleRequest = async (url, method, body = null, headers = {}) => {
  const makeRequest = async (token = null) => {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include',  // Important for cookies to be sent
    };

    // Add CSRF token for non-GET requests if available
    if (method !== 'GET') {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    // Add authorization header if token is provided
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Use token from localStorage if available
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    if (body) {
      config.body = JSON.stringify(body);
    }
    console.log('Request Config:', config);
    const response = await fetch(`${API_URL}${url}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned: ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Store the status code and error message
      const error = new Error(data.detail || data.message || 'Request failed');
      error.status = response.status;
      error.responseData = data;
      throw error;
    }

    return data;
  };

  try {
    // First attempt with current token
    return await makeRequest();
  } catch (error) {
    // Check if error is due to token expiration (typically 401 Unauthorized)
    if (error.status === 401 && 
        (error.responseData?.code === 'token_not_valid' || 
         error.responseData?.detail?.includes('token') || 
         error.message?.includes('token'))) {
      
      console.log('Token expired, attempting refresh...');
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        });

        const refreshData = await refreshResponse.json();
        
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        // Update token in localStorage
        localStorage.setItem('token', refreshData.access);
        
        // Retry original request with new token
        return await makeRequest(refreshData.access);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, log the user out
        authService.logout();
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    // If it's not a token issue or token refresh failed, rethrow the original error
    console.error('API request error:', error);
    throw error;
  }
};

export const authService = {
  // register: async (email, username, password, password2, roles) => {
  //   try {
  //     const response = await handleRequest('/api/signup/', 'POST', {
  //       email: email.toLowerCase(),
  //       username,
  //       password,
  //       password2,
  //       roles
  //     });

  //     return response;
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     throw error;
  //   }
  // },

  // verifyOtp: async (email, otp) => {
  //   try {
  //     const response = await handleRequest('/api/verify-otp/', 'POST', {
  //       email: email.toLowerCase(),
  //       otp
  //     });

  //     if (response && response.user) {
  //       localStorage.setItem('token', response.tokens?.access);
  //       localStorage.setItem('refreshToken', response.tokens?.refresh);
  //       localStorage.setItem('user', JSON.stringify(response.user));
  //       localStorage.setItem('isLoggedIn', 'true');
  //       return response;
  //     }
  //     throw new Error(response.detail || 'OTP verification failed');
  //   } catch (error) {
  //     console.error('OTP verification error:', error);
  //     throw error;
  //   }
  // },
  // In authService.js
register: async (email, username, password, password2, roles) => {
  try {
    const response = await handleRequest('/api/signup/', 'POST', {
      email: email.toLowerCase(),
      username,
      password,
      password2,
      roles
    });

    return response; // Just return the response without storing tokens
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
},

verifyOtp: async (email, otp) => {
  try {
    const response = await handleRequest('/api/verify-otp/', 'POST', {
      email: email.toLowerCase(),
      otp
    });

    // Don't store tokens here, just return the response
    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
},

  resendOtp: async (email) => {
    try {
      const response = await handleRequest('/api/resend-otp/', 'POST', {
        email: email.toLowerCase()
      });
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  },

  login: async (email, password,role) => {
    try {
      const response = await handleRequest('/api/login/', 'POST', { 
        email: email.toLowerCase(), 
        password,
        role
      });

      if (response && response.user) {
        localStorage.setItem('token', response.tokens?.access);
        localStorage.setItem('refreshToken', response.tokens?.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('activeRole', response.user.active_role); // Store active role
        localStorage.setItem('is_profile_completed', response.user.is_profile_completed); // Store profile completion status
        localStorage.setItem('roles', response.user.roles); // Store is_allowed status
        userCache = response.user; // Cache the user object on login
        return response;
      }
      throw new Error(response.detail || 'Login failed - no user data');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  googleLogin: async (idToken, role) => {
    try {
      const response = await handleRequest('/api/login/', 'POST', { 
        id_token: idToken,
        role
      });

      if (response && response.user) {
        localStorage.setItem('token', response.tokens?.access);
        localStorage.setItem('refreshToken', response.tokens?.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('activeRole', response.user.active_role); 
        console.log("active role",response.user.active_role);// Store active role
        userCache = response.user; // Cache the user object on google login
        return response;
      }
      throw new Error(response.detail || 'Google login failed');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await handleRequest('/api/forgot-password/', 'POST', { 
        email: email.toLowerCase() 
      });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, password, password2) => {
    try {
      const response = await handleRequest('/api/reset-password/', 'POST', {
        token,
        password,
        password2
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  getCurrentUser: () => {
    if (userCache) {
      return userCache; // Return cached user if available
    }
    try {
      const user = localStorage.getItem('user');
      if (user) {
        userCache = JSON.parse(user); // Cache user after parsing
        return userCache;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  updateUserCache: (userData) => {
    userCache = userData; // Update the cache with new user data
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activeRole'); // Remove active role
    userCache = null; // Clear cache on logout
    
    window.dispatchEvent(new Event('storage'));
  },

  // Add this method to refresh tokens
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await handleRequest('/api/token/refresh/', 'POST', {
        refresh: refreshToken
      });

      if (response && response.access) {
        localStorage.setItem('token', response.access);
        return response.access;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
  // Add this to your authService.js
refreshTokenIfNeeded: async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decode JWT without external libraries
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // If token expires in less than 5 minutes, refresh it
    if (expirationTime - currentTime < 300000) {
      console.log('Token expiring soon, refreshing...');
      await authService.refreshToken();
    }
    
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
},

organizationLogin: async (email, password) => {
  try {
    const response = await handleRequest('/api/organization/login/', 'POST', { 
      email: email.toLowerCase(), 
      password
    });

    if (response && response.organization) {
      localStorage.setItem('token', response.tokens?.access);
      localStorage.setItem('refreshToken', response.tokens?.refresh);
      localStorage.setItem('organization', JSON.stringify(response.organization));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isOrganization', 'true');
      userCache = response.organization; // Cache the organization object
      return response;
    }
    throw new Error(response.detail || 'Organization login failed - no organization data');
  } catch (error) {
    console.error('Organization login error:', error);
    throw error;
  }
},

organizationGoogleLogin: async (idToken) => {
  try {
    const response = await handleRequest('/api/organization/login/', 'POST', { 
      id_token: idToken
    });

    if (response && response.organization) {
      localStorage.setItem('token', response.tokens?.access);
      localStorage.setItem('refreshToken', response.tokens?.refresh);
      localStorage.setItem('organization', JSON.stringify(response.organization));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isOrganization', 'true');
      userCache = response.organization; // Cache the organization object
      return response;
    }
    throw new Error(response.detail || 'Organization Google login failed');
  } catch (error) {
    console.error('Organization Google login error:', error);
    throw error;
  }
},

organizationRegister: async (name, email, password, confirmPassword) => {
  try {
    const response = await handleRequest('/api/organization/signup/', 'POST', {
      name,
      email: email.toLowerCase(),
      password,
      confirm_password: confirmPassword
    });

    return response;
  } catch (error) {
    console.error('Organization registration error:', error);
    throw error;
  }
},

organizationVerifyOtp: async (email, otp) => {
  try {
    const response = await handleRequest('/api/organization/verify-otp/', 'POST', {
      email: email.toLowerCase(),
      otp
    });

    if (response && response.organization) {
      localStorage.setItem('token', response.tokens?.access);
      localStorage.setItem('refreshToken', response.tokens?.refresh);
      localStorage.setItem('organization', JSON.stringify(response.organization));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isOrganization', 'true');
      userCache = response.organization;
      return response;
    }
    throw new Error(response.detail || 'Organization OTP verification failed');
  } catch (error) {
    console.error('Organization OTP verification error:', error);
    throw error;
  }
},

organizationResendOtp: async (email) => {
  try {
    const response = await handleRequest('/api/organization/resend-otp/', 'POST', {
      email: email.toLowerCase()
    });
    return response;
  } catch (error) {
    console.error('Organization resend OTP error:', error);
    throw error;
  }
}
};