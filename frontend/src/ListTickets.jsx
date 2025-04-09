import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import axios from "axios";
import Navbar from "./Navbar";

const ListTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
        setTickets(ticketsData);
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
  }, []);

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
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Mis Incidencias
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        {tickets.length === 0 ? (
          <Typography variant="body1">
            No tienes incidencias registradas.
          </Typography>
        ) : (
          <Grid item xs={12} sm={12} md={12}>
            {tickets.map((ticket) => (
              <Grid item xs={12} md={6} key={ticket.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Incidencia #{ticket.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Descripción:</strong> {ticket.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Estado: {ticket.status_display}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Creado: {new Date(ticket.created_at).toLocaleString()}
                    </Typography>
                    {ticket.images && ticket.images.length > 0 && (
                      <Box 
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 2,
                        width: "100%",
                        maxWidth: "800px",
                        maxHeight: "75vh", 
                        overflowY: "auto", 
                      }}>
                        {ticket.images.map((img) => (
                        <CardMedia
                            key={img.id}
                            component="img"
                            image={`${import.meta.env.VITE_API_BASE_URL}${img.image}`}
                            alt={`Imagen de incidencia ${ticket.id}`}
                            sx={{ width: 150, height: 150, objectFit: "cover" }}
                        />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default ListTickets;
