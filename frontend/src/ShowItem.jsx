import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DateRange, Calendar  } from "react-date-range";
import "react-datepicker/dist/react-datepicker.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs from "dayjs";
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
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import SuccessModal from "./components/SuccessModal";
import ConfirmModal from "./components/ConfirmModal";

const ShowItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState([]);
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
  const [isOwner, setIsOwner] = useState(false); // Estado para verificar si el usuario es el propietario
  const [priceCategory, setPriceCategory]= useState(null)
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedStartHour, setSelectedStartHour] = useState(null);
  const [selectedEndHour, setSelectedEndHour] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [highlighting, setHighlighting] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`
        );
        const data = response.data;
        setItem(data);
        setUnavailabilityPeriods(data.unavailable_periods || []);

        if (data.user) {
          fetchUserName(data.user);
          checkOwnerStatus(data.user);
        }

        if (data.images && data.images.length > 0) {
          await loadItemImages(data.images);
        }
        await fetchAvailabilityData();
        if(data.price_category){
          setPriceCategory(data.price_category)
        } 
      } catch (error) {
        console.error("Error fetching item:", error);
        setErrorMessage("No se pudo cargar el ítem");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItemData();
  }, [id]);

  
  useEffect(() => {
    if (!item) return;
  
    let calculatedPrice = 0;
  
    if (priceCategory === "hour" && selectedStartHour !== null && selectedEndHour !== null) {
      const hours = selectedEndHour - selectedStartHour;
      calculatedPrice = hours * item.price;
    }
  
    if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
      const days = Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24));
      calculatedPrice = days * item.price;
    }
  
    if (priceCategory === "month" && selectedDay && selectedMonths) {
      calculatedPrice = selectedMonths * item.price;
    }
  
    setTotalPrice(parseFloat(calculatedPrice.toFixed(2)));
  }, [priceCategory, selectedStartHour, selectedEndHour, dateRange, selectedDay, selectedMonths, item]);
  
  const checkOwnerStatus = (userId) => {
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
      setUserName(userData.username);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserName("Usuario desconocido");
    }
  };

  const toggleFeature = () => {
    if (!item) return;
    setHighlighting(true);
    
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/toggle_feature/`, {
        item_id: item.id,
        user_id: item.user
    })
    .then(() => {
        setItem(prev => ({ ...prev, featured: !prev.featured }));
    })
    .catch(error => {
        console.error('Error destacando el objeto:', error);
        
        // Mostrar errores del backend al usuario
        if (error.response && error.response.data) {
            alert(error.response.data.error || "Ocurrió un error inesperado.");
        } else {
            alert("Error de conexión con el servidor.");
        }
    })
    .finally(() => {
        setHighlighting(false);
    });
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
      const token = localStorage.getItem("access_token")
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Ítem eliminado correctamente");
      navigate("/");
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("No se pudo eliminar el ítem");
    }
  };

  const isDateUnavailable = (date) => {
    return unavailabilityPeriods.some(period => {
      const start = new Date(period.start_date); 
      const end = new Date(period.end_date); 
      return date >= start && date <= end;
    });
  };

  const handleRentalRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
        return;
      }
      if (
        isDateUnavailable(dateRange[0].startDate) ||
        isDateUnavailable(dateRange[0].endDate) ||
        isDateUnavailable(selectedDay)
      ) {
        alert("No puedes solicitar alquiler en fechas no disponibles.");
        return;
      }
  
      let startDateUTC, endDateUTC;
  
      if (priceCategory === "hour" && selectedDay && selectedStartHour !== null && selectedEndHour !== null) {
        const start = dayjs(selectedDay)
        .hour(selectedStartHour)
        .minute(0)
        .second(0)
        .millisecond(0)
        .format("YYYY-MM-DDTHH:mm:ss");
        const end = dayjs(selectedDay)
          .hour(selectedEndHour)
          .minute(0)
          .second(0)
          .millisecond(0)
          .format("YYYY-MM-DDTHH:mm:ss");
      
        startDateUTC = start;
        endDateUTC = end;
      } 
      else if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
        // Usar las fechas seleccionadas para alquiler por días
        startDateUTC = dayjs(dateRange[0].startDate).format("YYYY-MM-DD");
        endDateUTC = dayjs(dateRange[0].endDate).format("YYYY-MM-DD");
      } 
      else if (priceCategory === "month" && selectedDay && selectedMonths) {
        // Construir fechas para alquiler por meses
        const start = dayjs(selectedDay);
        const end = dayjs(selectedDay).add(selectedMonths, 'month');
        startDateUTC = start.format("YYYY-MM-DD");
        endDateUTC = end.format("YYYY-MM-DD");
      } 
      else {
        alert("Por favor, selecciona correctamente la fecha de inicio y fin.");
        return;
      }
  
      // Enviar la solicitud al servidor
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
        setShowRentalModal(false);
        setShowRequestPopup(true);
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
  const handlePublishItem = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/publish_item/`,
        { item_id: item.id, user_id: user.id },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        alert("¡El ítem se ha publicado correctamente!");
        navigate(0); // Refresca la página
      } else {
        alert("Hubo un problema al publicar el ítem.");
      }
    } catch (error) {
      console.error("Error publicando el ítem:", error);
      console.log("Respuesta del backend:", error.response?.data);
    
      if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (Array.isArray(error.response?.data) && error.response.data.length > 0) {
        setErrorMessage(error.response.data[0]);
      } else {
        setErrorMessage("Ocurrió un error al intentar publicar el ítem.");
      }
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
          {item.draft_mode && (
  <Box 
    sx={{ 
      backgroundColor: "#fff8c4", 
      p: 2, 
      borderRadius: 2, 
      border: "1px solid #e0c243", 
      textAlign: "center", 
      mb: 3 
    }}
  >
    <Typography variant="h6" color="warning.main" gutterBottom>
      📌 BORRADOR
    </Typography>
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handlePublishItem}
    >
      Publicar
    </Button>
  </Box>
)}

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
                  <Link to={`/perfil/${encodeURIComponent(userName)}`} style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "1.05rem",
                        borderRadius: "30px",
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #2563eb, #1e40af)",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          background: "linear-gradient(135deg, #1e40af, #122b6d)",
                          transform: "scale(1.05)",
                          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                        },
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 20, color: "white" }} />
                      {userName}
                    </Button>
                  </Link>


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

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CategoryIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Subcategoría</Typography>
                      <Typography variant="body2">{item.subcategory_display}</Typography>
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

                    {/* Solo mostrar si el usuario NO es "free" */}
                    {currentUser.pricing_plan !== "free" && (
                      <Button 
                        variant="outlined" 
                        onClick={toggleFeature} 
                        disabled={highlighting}
                        sx={{
                          color: '#b8860b', // Dorado oscuro para el texto
                          borderColor: '#b8860b', // Dorado oscuro para el borde
                          '&:hover': {
                            backgroundColor: '#daa520', // Un dorado más fuerte en hover
                            borderColor: '#ffd700', // Amarillo dorado
                            color: 'white', // Para mejor contraste
                          },
                          '&:disabled': {
                            color: '#a97c00', // Un dorado más opaco si está deshabilitado
                            borderColor: '#a97c00',
                          }
                        }}
                      >
                        {item.featured ? 'Quitar destacado' : 'Destacar objeto'}
                      </Button>
                    )}
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

        {priceCategory === "hour" && (
          <div> 
            {/* Selector de día */}
            <Typography>Selecciona un día:</Typography>
            <Calendar
              date={selectedDay}
              onChange={(date) => setSelectedDay(date)}
              minDate={new Date()} 
              disabledDates={[...unavailabilityPeriods.flatMap(period => {
                const start = new Date(period.start_date);
                const end = new Date(period.end_date);
                const range = getDatesInRange(start, end);
  
                return range;
              })]}
            />

            {/* Selector de hora de inicio */}
            <Typography>Selecciona la hora de inicio:</Typography>
            <select
              value={selectedStartHour || ""}
              onChange={(e) => {
                const startHour = parseInt(e.target.value);
                setSelectedStartHour(startHour);
                setSelectedEndHour(startHour + 1); // Automáticamente una hora después
              }}>
              <option value="" disabled>Selecciona una hora</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i}:00
                </option>
              ))}
            </select>

            {/* Selector de hora de fin */}
            <Typography>Selecciona la hora de fin:</Typography>
            <select
              value={selectedEndHour || ""}
              onChange={(e) => setSelectedEndHour(parseInt(e.target.value))}
              disabled={selectedStartHour === null} // Deshabilita si no hay hora inicio
            >
              <option value="" disabled>Selecciona una hora</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i} disabled={i <= selectedStartHour}>
                  {i}:00
                </option>
              ))}
            </select>
            {selectedDay && selectedStartHour !== null && selectedEndHour !== null && (
            <Box 
              sx={{ 
                marginTop: 2, 
                padding: 2, 
                border: "1px solid #ccc", 
                borderRadius: 4, 
                backgroundColor: "#f9f9f9" 
              }}
            >
              <Typography variant="h6">Resumen de selección:</Typography>
              <Typography><strong>Día:</strong> {selectedDay.toLocaleDateString()}</Typography>
              <Typography><strong>Horas:</strong> {`${selectedStartHour}:00 - ${selectedEndHour}:00`}</Typography>
            </Box>
            )}
          </div>
        )}

        {priceCategory === "day" && (
          <DateRange
            ranges={ isOwner || !isAuthenticated ? [] : dateRange}
            onChange={(ranges) => {
              if (!isOwner || isAuthenticated) { setDateRange([ranges.selection]); }
              const start = ranges.selection.startDate;
              const end = ranges.selection.endDate;
              if (isDateUnavailable(start) || isDateUnavailable(end)) {
                alert("Las fechas seleccionadas no están disponibles.");
                return;
              }
              // Si el usuario selecciona el mismo día como inicio y fin, establecerlo correctamente
              if (start.toDateString() === end.toDateString()) {
                setDateRange([{ startDate: start, endDate: start, key: "selection" }]);
              } else {
                setDateRange([ranges.selection]);
              }
            }}
            minDate={new Date()}
            disabledDates={[...requestedDates, ...bookedDates, ...unavailabilityPeriods.flatMap(period => {
              const start = new Date(period.start_date);
              const end = new Date(period.end_date);
              const range = getDatesInRange(start, end);

              return range;
            })]}
          />
        )}

        {priceCategory === "month" && (
            <div> 
            {/* Selector de día */}
            <Typography>Selecciona un día:</Typography>
            <Calendar
              date={selectedDay}
              onChange={(date) => setSelectedDay(date)}
              minDate={new Date()} 
              disabledDates={[...unavailabilityPeriods.flatMap(period => {
                const start = new Date(period.start_date);
                const end = new Date(period.end_date);
                const range = getDatesInRange(start, end);
  
                return range;
              })]}
            />

            <label>Selecciona la cantidad de meses:</label>
            <select onChange={(e) => setSelectedMonths(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} mes(es)
                </option>
              ))}
            </select>
          </div>
        )}

        <Typography variant="body2">Total a pagar: <strong>{totalPrice} €</strong></Typography>
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
          <ConfirmModal
          title="Confirmar Solicitud"
          message={`¿Quieres solicitar el objeto "${item.title}" del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}?`}
          onCancel={() => setShowRentalModal(false)}
          onConfirm={handleRentalRequest}
          />
          )}
          {showRequestPopup && (
            <SuccessModal
              title="Solicitud enviada"
              message="Tu solicitud ha sido enviada correctamente. Puedes verla en la sección 'Mis solicitudes' en el apartado de 'Solicitudes Enviadas'."
              primaryLabel="Ir a Mis Solicitudes"
              onPrimaryAction={() => navigate("/rental_requests?tab=sent")}
              secondaryLabel="Volver al Menú Principal"
              onSecondaryAction={() => navigate("/")}
            />
          )}
          </Container>
          </Box>
          );
          };

export default ShowItemScreen;