import { useEffect, useState, useCallback } from "react";
import ReportIcon from "@mui/icons-material/Report";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const IMAGEN_PREDETERMINADA = "../public/default_image.png";

const ListTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const obtenerUrlImagen = useCallback(async (imgId) => {
    try {
      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/incidencias/item-images/${imgId}/`
      );
      return respuesta.data.image;
    } catch (error) {
      console.error(`Error al cargar la imagen ${imgId}:`, error);
      return IMAGEN_PREDETERMINADA;
    }
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/incidencias/full/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Tickets response:", response.data);
        const ticketsData = response.data.results || response.data;
        const enrichedTickets = await Promise.all(
          ticketsData.map(async (ticket) => {
            const urlImagen =
              ticket.images && ticket.images.length > 0
                ? await obtenerUrlImagen(ticket.images[0].id)
                : IMAGEN_PREDETERMINADA;
            return { ...ticket, urlImagen };
          })
        );
        setTickets(enrichedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setErrorMessage(
          error.response?.data?.detail || "Error al cargar tus incidencias."
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchTickets();
  }, [obtenerUrlImagen]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f9fafb",
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          flexGrow: 1,
          py: { xs: 2, md: 4 }, 
          px: { xs: 2, sm: 3, md: 4 },
          mt: "48px",
          overflow: "auto",
          maxWidth: 1400,
          mx: 'auto'
        }}
      >
        <Box sx={{ width: "100%", mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
          </Box>
  
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
  
          {tickets.length === 0 ? (
              <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 4
              }}
            >
              <ReportIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                No has enviado reportes hasta el momento.
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Cuando envíes un reporte, aparecerá en esta sección.
              </Typography>
            </Box>
          ) : (
            
            <Grid container spacing={3}>
              {tickets.map((ticket) => (
                <Grid item xs={12} md={6} key={ticket.id}>
                  <Card sx={{ display: "flex" , mx: "auto", maxWidth: 600}}>
                    {ticket.urlImagen && (
                      <CardMedia
                        component="img"
                        image={ticket.urlImagen}
                        alt={`Imagen de incidencia ${ticket.id}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = IMAGEN_PREDETERMINADA;
                        }}
                        sx={{ width: 150, height: 150, objectFit: "cover" }}
                      />
                    )}
                    <CardContent sx={{ flex: "1 0 auto" }}>
                      <Typography variant="h6">
                        Incidencia #{ticket.id}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {ticket.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Estado: {ticket.status_display}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Creado: {new Date(ticket.created_at).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};  

export default ListTickets;
