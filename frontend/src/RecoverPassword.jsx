import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress, Alert } from "@mui/material";
import { FiLock } from "react-icons/fi";
import Navbar from "./Navbar";

const RecuperarContraseñaConfirm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/password_reset/`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        navigate("/recoverPasswordDone");
      } else {
        const data = response.data;
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("El correo no está registrado.");
      } else {
        setError(error.message || "Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Recupera tu contraseña
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <FiLock style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', zIndex: 1, color: '#666' }} />
              <TextField
                fullWidth
                type="email"
                placeholder="Correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  sx: { pl: 5 }
                }}
                variant="outlined"
              />
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Ingresar"
              )}
            </Button>
            
            <Typography variant="body2" align="center">
              ¿No tienes cuenta?{' '}
              <Link to="/signup" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RecuperarContraseñaConfirm;