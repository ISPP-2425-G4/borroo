import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Box, Button, Container, Paper, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "./Navbar";

const FormContainer = styled(Paper)(() => ({
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  width: "100%",
  maxWidth: "800px",
  margin: "2rem auto",
}));

const FormTitle = styled(Typography)(() => ({
  fontSize: "1.75rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
  color: "#333",
}));

const NewTicketForm = () => {
  // Obtenemos el id de la renta a partir de la URL
  const { rentId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const data = { rent: rentId, description };
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/tickets/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      // Una vez creada la incidencia, redirigimos al usuario a su sección de incidencias
      navigate("/mis-incidencias");
    } catch (error) {
      console.error("Error creando la incidencia:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.error || "Error creando la incidencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        <FormContainer elevation={3}>
          <FormTitle variant="h5">Crear Incidencia</FormTitle>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Descripción de la incidencia"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {/* Aquí podrías agregar también inputs para adjuntar imágenes, si lo requieres */}
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Enviar Incidencia"
              )}
            </Button>
          </Box>
        </FormContainer>
      </Container>
    </Box>
  );
};

export default NewTicketForm;
