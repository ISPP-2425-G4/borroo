import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from 'axios';

import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress, 
  IconButton, 
  Stack, 
  Chip, 
} from '@mui/material';

import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Description as DescriptionIcon, 
  Category as CategoryIcon, 
  Cancel as CancelIcon, 
  AttachMoney as MoneyIcon, 
  Person as PersonIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';

import Navbar from "./Navbar";
import Modal from "./Modal";
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";

const ShowItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [requestedDates, setRequestedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`
        );
        const data = response.data;
        setItem(data);

        if (data.user) {
          await fetchUserName(data.user);
          checkOwnerStatus(data.user);
        }

        if (data.images && data.images.length > 0) {
          await loadItemImages(data.images);
        }
        
        await fetchAvailabilityData();
      } catch (error) {
        console.error("Error fetching item:", error);
        setErrorMessage("No se pudo cargar el ítem");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItemData();
  }, [id]);

  const checkOwnerStatus = (userId) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setIsAuthenticated(!!currentUser);
    if (currentUser && currentUser.id === userId) {
      setIsOwner(true);
    }
  };

  const fetchUserName = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${userId}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const userData = response.data;
      setUserName(userData.name);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserName("Usuario desconocido");
    }
  };

  const loadItemImages = async (imageIds) => {
    try {
      const urls = await Promise.all(
        imageIds.map(async (imgId) => {
          try {
            const imgResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
            );
            return imgResponse.data.image;
          } catch (error) {
            console.error(`Error loading image ${imgId}:`, error);
            return null;
          }
        })
      );
      setImageURLs(urls.filter((url) => url !== null));
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  const fetchAvailabilityData = async () => {
    try {
      const rentResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/rentas/full/item/${id}/`
      );
      const rents = rentResponse.data;

      const requested = [];
      const booked = [];
      
      rents.forEach((rent) => {
        const start = new Date(rent.start_date);
        const end = new Date(rent.end_date);
        const days = getDatesInRange(start, end);
        
        if (rent.rent_status === "requested") {
          requested.push(...days);
        } else if (rent.rent_status === "BOOKED") {
          booked.push(...days);
        }
      });

      setRequestedDates(requested);
      setBookedDates(booked);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este ítem?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Ítem eliminado correctamente");
      navigate("/");
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("No se pudo eliminar el ítem");
    }
  };

  const handleRentalRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
        return;
      }

      const startDateUTC = new Date(dateRange[0].startDate).toISOString();
      const endDateUTC = new Date(dateRange[0].endDate).toISOString();

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/rentas/full/first_request/`,
        {
          item: id,
          start_date: startDateUTC,
          end_date: endDateUTC,
          renter: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      if (response.status === 201) {
        alert("Solicitud de alquiler enviada correctamente");
        setShowRentalModal(false);
      } else {
        alert("Hubo un problema con la solicitud");
      }
    } catch (error) {
      console.error("Error al solicitar alquiler:", error);
      alert(error.response?.data?.error || "No se pudo realizar la solicitud");
    }
  };

  const navigateImages = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageURLs.length);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageURLs.length) % imageURLs.length);
    }
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Cargando información del producto...</Typography>
        </Container>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box>
        <Navbar />
        <Container sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>No se encontró el ítem solicitado</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {item.title}
          </Typography>

          {errorMessage && (
            <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 2, borderRadius: 1, mb: 3 }}>
              {errorMessage}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              {imageURLs.length > 0 ? (
                <Paper elevation={3} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
                  <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                    <Box 
                      component="img"
                      src={imageURLs[currentImageIndex]}
                      alt={`${item.title} - imagen ${currentImageIndex + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1 }}>
                    <Typography variant="body2">
                      {currentImageIndex + 1} / {imageURLs.length}
                    </Typography>
                  </Box>

                  <IconButton 
                    sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => navigateImages('prev')}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <IconButton 
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => navigateImages('next')}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Paper>
              ) : (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    No hay imágenes disponibles
                  </Typography>
                </Paper>
              )}
            </Box>

            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon fontSize="large" color="primary" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Publicado por:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userName}
                    </Typography>
                    {isOwner && (
                      <Chip 
                        label="Eres el propietario" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }} 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles del producto
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <DescriptionIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Descripción</Typography>
                      <Typography variant="body2">{item.description}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CategoryIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Categoría</Typography>
                      <Typography variant="body2">{item.category_display}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CancelIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Política de cancelación</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{item.cancel_type_display}</Typography>
                        <CancelPolicyTooltip />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MoneyIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Precio</Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {item.price} € / {item.price_category_display}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                
                {isOwner && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />} 
                      onClick={() => navigate(`/update-item/${id}`)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      onClick={handleDelete}
                    >
                      Eliminar
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {!isOwner ? "Selecciona fechas para alquilar" : "Calendario de disponibilidad"}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            '& .rdrCalendarWrapper': { 
              maxWidth: '100%',
              fontSize: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              p: 1
            }
          }}>
            <DateRange
              ranges={isOwner || !isAuthenticated ? [] : dateRange}
              onChange={(ranges) => { 
                if (!isOwner && isAuthenticated) {
                  setDateRange([ranges.selection]);
                }
              }}
              minDate={new Date()}
              disabledDates={[...requestedDates, ...bookedDates]}
            />

            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '50%' }}></Box>
                <Typography variant="body2">Reservado</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: '50%' }}></Box>
                <Typography variant="body2">Solicitado</Typography>
              </Box>
            </Box>
          </Box>

          {!isOwner && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              {!isAuthenticated ? (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    Para solicitar un alquiler, debes estar registrado
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Button variant="outlined" color="primary" href="/login">
                      Iniciar sesión
                    </Button>
                    <Button variant="contained" color="primary" href="/signup">
                      Registrarse
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => setShowRentalModal(true)}
                >
                  Solicitar alquiler
                </Button>
              )}
            </Box>
          )}
        </Paper>
        
        {showRentalModal && (
          <Modal
            title="Confirmar Solicitud"
            message={`¿Quieres solicitar el objeto "${item.title}" del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}?`}
            onCancel={() => setShowRentalModal(false)}
            onConfirm={handleRentalRequest}
          />
        )}
      </Container>
    </Box>
  );
};

export default ShowItemScreen;