import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Container, Box, Typography, Paper, Divider, Chip, CircularProgress, 
  Alert, Button, Grid, ImageList, ImageListItem
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from "./Navbar";


const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/incidencias/full/${id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Error al obtener la información del ticket.");
        }

        const ticketData = response.data;
        setTicket(ticketData);
        
        // Obtener información del usuario
        try {
          const userResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${ticketData.reporter}`,
            { 
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              } 
            }
          );
          
          if (userResponse.data) {
            setUserData(userResponse.data);
          }
        } catch (userErr) {
          console.error("Error al obtener información del usuario:", userErr);
        }
      } catch (err) {
        setError("No se pudo cargar la información del ticket.");
        console.error("Error al cargar el ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id, token]);

  const getStatusColor = (status) => {
    if (!status) return '#9e9e9e';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ff9800'; // Orange
      case 'in_progress':
        return '#2196f3'; // Blue
      case 'resolved':
        return '#4caf50'; // Green
      default:
        return '#9e9e9e'; // Grey
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleInvestigate = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/incidencias/full/${id}/update_status/`,
        { status: "in_progress" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        setTicket(response.data); // Actualiza el estado del ticket
        alert("Investigación comenzada, contacta por correo con los implicados si necesitas más información.");
      }
    } catch (err) {
      console.error("Error al actualizar el ticket:", err);
    }
  };
  
  const handleResolve = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/incidencias/full/${id}/update_status/`,
        { status: "resolved" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        setTicket(response.data); // Actualiza el estado del ticket
        alert("Investigación resuelta, recuerda enviar un correo a los implicados con la resolución.");
      }
    } catch (err) {
      console.error("Error al actualizar el ticket:", err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f7f9fc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate("/admin/tickets")}
          sx={{ mb: 2 }}
        >
          Volver a la lista de tickets
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : ticket ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" fontWeight="500">
                Ticket #{ticket.id}
              </Typography>
              <Chip 
                label={ticket.status} 
                sx={{ 
                  backgroundColor: getStatusColor(ticket.status),
                  color: 'white',
                  fontWeight: 'medium',
                  fontSize: '1rem',
                  py: 1
                }} 
              />
              {console.log(getStatusColor(ticket.status))}
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} /> Información del Usuario
                  </Typography>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    {userData ? (
                      <>
                        <Typography variant="body1"><strong>Nombre:</strong> {userData.name} {userData.surname}</Typography>
                        <Typography variant="body1"><strong>Email:</strong> {userData.email}</Typography>
                        <Typography variant="body1"><strong>Teléfono:</strong> {userData.phone || 'No disponible'}</Typography>
                      </>
                    ) : (
                      <Typography variant="body1">Información del usuario no disponible</Typography>
                    )}
                  </Paper>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} /> Fechas
                  </Typography>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="body1"><strong>Creado:</strong> {formatDate(ticket.created_at)}</Typography>
                    {ticket.updated_at && (
                      <Typography variant="body1"><strong>Actualizado:</strong> {formatDate(ticket.updated_at)}</Typography>
                    )}
                    {ticket.closed_at && (
                      <Typography variant="body1"><strong>Cerrado:</strong> {formatDate(ticket.closed_at)}</Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon sx={{ mr: 1 }} /> Descripción del Problema
                  </Typography>
                  <Paper elevation={1} sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderLeft: '4px solid ' + getStatusColor(ticket.status),
                    minHeight: '150px'
                  }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {ticket.description || 'No hay descripción disponible'}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Imágenes Adjuntas
            </Typography>
            
            {ticket.images && ticket.images.length > 0 ? (
                <ImageList cols={3} gap={16}>
                {ticket.images.map((img, index) => (
                    <ImageListItem key={index}>
                    <img
                        src={img.image}
                        alt={`Imagen adjunta ${index + 1}`}
                        loading="lazy"
                        style={{ 
                        width: '100%', 
                        height: 'auto', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    </ImageListItem>
                ))}
                </ImageList>
            ) : (
                <Alert severity="info">No hay imágenes adjuntas a este ticket.</Alert>
            )}
            </Box>
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<WorkIcon />}
                onClick={handleInvestigate}
              >
                Investigar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleResolve}
              >
                Cerrar
              </Button>
            </Box>
          </Paper>
        ) : (
          <Alert severity="warning">No se encontró información para este ticket.</Alert>
        )}
      </Container>
    </Box>
  );
};

export default TicketDetail;