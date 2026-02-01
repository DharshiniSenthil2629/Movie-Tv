import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    setFieldErrors({});
    
    // Client-side validation
    let hasError = false;
    const newFieldErrors = {};
    
    if (!formData.username) {
      newFieldErrors.username = 'Username is required';
      hasError = true;
    }
    
    if (!formData.email) {
      newFieldErrors.email = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFieldErrors.email = 'Email is invalid';
      hasError = true;
    }
    
    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
      hasError = true;
    } else if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }
    
    if (!formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }
    
    if (hasError) {
      setFieldErrors(newFieldErrors);
      setError('Please fix the errors below');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting to register user:', {
        username: formData.username,
        email: formData.email,
        passwordLength: formData.password.length
      });
      
      await register(formData.username, formData.email, formData.password);
      console.log('Registration successful, redirecting to movies...');
      navigate('/movies');
    } catch (err) {
      console.error('Registration error:', err.message);
      
      if (err.message.includes('already in use')) {
        setFieldErrors({
          ...fieldErrors,
          email: 'An account with this email already exists. Please use a different email or try logging in.'
        });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 2,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Box textAlign="center">
              <Typography variant="h4" component="h1" gutterBottom>
                Create Account
              </Typography>
              <Typography color="text.secondary">
                Join our community today
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              fullWidth
              required
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              fullWidth
              required
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" color="primary">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}