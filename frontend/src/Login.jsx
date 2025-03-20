import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from 'axios';
import Navbar from "./Navbar";
import { Box, Container, Paper, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 450,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: 8,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
}));

const FormContainer = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(1.2),
  borderRadius: 4,
}));

const LinkText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  textAlign: 'center',
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFormValid(username.trim() !== "" && password.trim() !== "");
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/login/`,
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        const data = response.data;
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("El usuario no existe o los datos son incorrectos.");
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
      <Container sx={{mt: 8}}>
        <StyledPaper elevation={3}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Iniciar Sesión
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <FormContainer onSubmit={handleSubmit}>
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Usuario"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiUser />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              variant="outlined"
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiLock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={!isFormValid || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
            </StyledButton>
          </FormContainer>
          
          <LinkText variant="body2">
            ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
          </LinkText>
          
          <LinkText variant="body2">
            <Link to="/recoverPassword">No recuerdo mi contraseña</Link>
          </LinkText>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Login;