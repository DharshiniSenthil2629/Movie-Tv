import "./css/App.css";
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/NavBar';
import Home from "./pages/Home";
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from './pages/Register';
import PrivateRoute from "./contexts/PrivateRoute";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from './pages/TVShowDetails';
import Watchlist from './pages/Watchlist';
import { WatchlistProvider } from './contexts/WatchlistContext';
import SearchResults from './pages/SearchResults';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50914',
      light: '#FF1F1F',
      dark: '#B81D24',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00B4D8',
      light: '#48CAE4',
      dark: '#0096C7',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#141414',
      paper: '#1F1F1F',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#141414',
          color: '#FFFFFF',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1F1F1F',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#E50914',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1F1F1F',
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#E50914',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#E50914',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <WatchlistProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/search"
                    element={
                      <PrivateRoute>
                        <SearchResults />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/movies"
                    element={
                      <PrivateRoute>
                        <Movies />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/tv"
                    element={
                      <PrivateRoute>
                        <TVShows />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/movie/:id"
                    element={
                      <PrivateRoute>
                        <MovieDetails type="movie" />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/tv/:id"
                    element={
                      <PrivateRoute>
                        <TVShowDetails type="tv" />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/watchlist"
                    element={
                      <PrivateRoute>
                        <Watchlist />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </WatchlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
