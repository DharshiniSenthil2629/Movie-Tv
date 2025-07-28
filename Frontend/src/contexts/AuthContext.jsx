import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        try {
          const response = await axios.get('http://localhost:5000/api/users/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...response.data, token });
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: email.toLowerCase().trim(),
        password
      });
      
      const { token, userId, username } = response.data;
      
      if (!token || !userId) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setUser({ token, id: userId, username });
      
      console.log('Login successful for:', username);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password
      });
      
      const { token, userId, message } = response.data;
      
      if (!token || !userId) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setUser({ token, id: userId, username });
      
      console.log('Registration successful for:', username);
      return { token, userId, message };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        if (error.response.data.type === 'duplicate_key') {
          throw new Error(`This ${error.response.data.field} is already in use`);
        }
        throw new Error(error.response.data.message || 'Invalid registration data');
      }
      
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user?.token
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}