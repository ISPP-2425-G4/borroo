import Navbar from "./Navbar";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";

const IMAGEN_PREDETERMINADA = "../public/default_image.png";

const DraftItemsView = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const obtenerUrlImagen = useCallback(async (imgId) => {
    try {
      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
      );
      console.log("Imagen cargada:", respuesta);
      return respuesta.data.image;
    } catch (error) {
      console.error(`Error al cargar la imagen ${imgId}:`, error);
      return IMAGEN_PREDETERMINADA;
    }
  }, []);

  const fetchDraftItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/list_draft_items/${user.id}/`
      );
      const itemsConImagenes = await Promise.all(
        response.data.results.map(async (item) => {
          const urlImagen = item.images && item.images.length > 0
            ? await obtenerUrlImagen(item.images[0])
            : IMAGEN_PREDETERMINADA;
          return { ...item, urlImagen };
        })
      );
      setItems(itemsConImagenes);
    } catch (err) {
      setError("Error al cargar tus borradores.", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, obtenerUrlImagen]);

  useEffect(() => {
    fetchDraftItems();
  }, [fetchDraftItems]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Tus Borradores
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Paper>
        ) : items.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No tienes borradores guardados.</Typography>
          </Paper>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/show-item/${item.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "0.3s",
                    '&:hover': { boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }
                  }}
                >
                  <Box
                    component="img"
                    src={item.urlImagen}
                    alt={item.title}
                    sx={{ width: 120, height: 80, objectFit: "cover", borderRadius: 2 }}
                  />

                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                      <Chip label={`${item.price}€`} color="primary" />
                      <Chip label="Borrador" color="default" />
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DraftItemsView;