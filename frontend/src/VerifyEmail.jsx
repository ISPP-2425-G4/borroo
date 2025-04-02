import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Navbar from "./Navbar";
import { Box, Container, Paper, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";

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

const VerificarEmail = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmitSuccess(false)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/verifyEmail/${token}/`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
  
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const data = response.data;
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("El usuario no existe o los datos son incorrectos.");
      } else if (error.response && error.response.status === 401) {
        setError("El usuario no existe o los datos son incorrectos.");
      } else {
        setError(error.response.data.error || "Error al conectar con el servidor");
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
            Verificar Email
          </Typography>
          {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {'Verificado exitoso! Redirigiendo...'}
              </Alert>
            )}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <FormContainer onSubmit={handleSubmit}>
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={ loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar"}
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

export default VerificarEmail;