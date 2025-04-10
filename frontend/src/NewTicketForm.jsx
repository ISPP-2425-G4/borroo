import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiImage } from "react-icons/fi";
import {
  FileInputContainer,
  HiddenFileInput,
  ImageUploadText,
  FormContainer,
  FormTitle,
  ErrorMessage
} from "./components/FormStyles";
import {
  ImagePreviewGallery
} from "./components/ImagePreview"
import axios from "axios";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from "@mui/material";
import Navbar from "./Navbar";


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
                <ImagePreviewGallery images={images} onRemove={handleRemoveImage} />
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
