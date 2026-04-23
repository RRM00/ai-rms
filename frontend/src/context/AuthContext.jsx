import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and fetch user profile
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // Token is invalid/expired (intercepted by axios and cleared)
          console.error("Failed to fetch user. Token might be invalid.", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to global unauthorized event from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    try {
      // Make sure we post to /auth/login with x-www-form-urlencoded format if OAuth2PasswordRequestForm is not overridden in FastAPI,
      // but in our backend, we used a Pydantic BaseModel (LoginRequest JSON), so standard post works.
      const response = await api.post('/auth/login', { username, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      
      // Fetch user details immediately
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
