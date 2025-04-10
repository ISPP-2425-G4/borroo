import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiTrash2, FiImage } from "react-icons/fi";

import axios from "axios";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "./Navbar";

const ImageGallery = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  marginTop: "16px",
  marginBottom: "24px",
}));

const ImageContainer = styled(Box)(() => ({
  position: "relative",
  width: "150px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

const PreviewImage = styled("img")(() => ({
  width: "100%",
  height: "120px",
  objectFit: "cover",
}));

const RemoveButton = styled("button")(() => ({
  position: "absolute",
  top: "8px",
  right: "8px",
  background: "rgba(0, 0, 0, 0.5)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.2s",
  "&:hover": {
    background: "rgba(0, 0, 0, 0.7)",
  },
}));

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

const FileInputContainer = styled(Box)(() => ({
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px dashed #ddd",
  backgroundColor: "#f9f9f9",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  marginBottom: "1.5rem",
  "&:hover": {
    borderColor: "#4a90e2",
    backgroundColor: "#f0f7ff",
  },
}));

const HiddenFileInput = styled("input")({
  display: "none",
});

const ImageUploadText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#666",
  fontSize: "0.9rem",
}));

const ErrorMessage = styled(Typography)(() => ({
  color: "#d32f2f",
  fontSize: "0.8rem",
  marginTop: "-12px",
  marginBottom: "12px",
}));


const NewTicketForm = () => {
  const { rentId } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prevImages) => [...prevImages, ...files]);
      
      if (fieldErrors.image) {
        setFieldErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    document.getElementById('image-upload').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setFieldErrors((prev) => ({ ...prev, image: "Por favor, selecciona al menos una imagen." }));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("description", description);

      images.forEach((image) => {
        formData.append("image_files", image);
      });

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/incidencias/nueva/${rentId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const currentUser = JSON.parse(localStorage.getItem("user"));
      navigate(`/perfil/${currentUser.username}`);
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

          <Typography variant="h6" sx={{ mb: 2 }}>
            Descripción <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Describe con detalle la incidencia"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              required
              helperText="Este campo es obligatorio."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Subir Imágenes <span style={{ color: "red" }}>*</span>
          </Typography>

          <FileInputContainer onClick={triggerFileSelect}>
            <FiImage size={32} color="#4a90e2" />
            <ImageUploadText>
              Haz clic para seleccionar imágenes (obligatorio)
            </ImageUploadText>
            <ImageUploadText variant="caption">
              (Para seleccionar múltiples archivos, mantén presionada la tecla Ctrl o Cmd)
            </ImageUploadText>
            <HiddenFileInput
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </FileInputContainer>
          {fieldErrors.image && <ErrorMessage>{fieldErrors.image}</ErrorMessage>}

              {images.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#555" }}>
                    Imágenes seleccionadas ({images.length})
                  </Typography>
                  <ImageGallery>
                    {images.map((image, index) => (
                      <ImageContainer key={index}>
                        <PreviewImage src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                        <RemoveButton onClick={() => handleRemoveImage(index)}>
                          <FiTrash2 size={16} />
                        </RemoveButton>
                      </ImageContainer>
                    ))}
                  </ImageGallery>
                </Box>
              )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Incidencia"}
            </Button>
          </Box>
        </FormContainer>
      </Container>
    </Box>
  );
};

export default NewTicketForm;
