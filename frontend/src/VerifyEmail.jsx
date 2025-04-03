import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { Box, Container, Paper, Typography, Button, CircularProgress, Alert } from "@mui/material";

// 🎨 Estilos reutilizables
const styles = {
  paper: {
    padding: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 450,
    margin: "0 auto",
    marginTop: 4,
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  form: {
    width: "100%",
    marginTop: 2,
  },
  button: {
    margin: "16px 0",
    padding: "10px",
    borderRadius: 4,
  },
  linkText: {
    marginTop: 1.5,
    textAlign: "center",
    "& a": {
      color: "primary.main",
      textDecoration: "none",
      fontWeight: 500,
      "&:hover": { textDecoration: "underline" },
    },
  },
};

// 📌 Componente reutilizable de enlaces
const AuthLinks = () => (
  <>
    <Typography variant="body2" sx={styles.linkText}>
      ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
    </Typography>
    <Typography variant="body2" sx={styles.linkText}>
      <Link to="/recoverPassword">No recuerdo mi contraseña</Link>
    </Typography>
  </>
);

const VerificarEmail = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmitSuccess(false);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/verifyEmail/${token}/`,
        {},
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      setSubmitSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.response?.data?.error || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Container sx={{ mt: 8 }}>
        <Paper elevation={3} sx={styles.paper}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Verificar Email
          </Typography>

          {submitSuccess && <Alert severity="success" sx={{ mb: 3 }}>¡Verificación exitosa! Redirigiendo...</Alert>}
          {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading} sx={styles.button}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar"}
            </Button>
          </form>

          <AuthLinks />
        </Paper>
      </Container>
    </Box>
  );
};

export default VerificarEmail;
