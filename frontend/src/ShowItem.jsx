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
  DialogContentText, 
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Avatar
} from '@mui/material';

import {  
  Description as DescriptionIcon, 
  Category as CategoryIcon, 
  Cancel as CancelIcon, 
  AttachMoney as MoneyIcon, 
  Person as PersonIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon,
  Whatshot as WhatshotIcon
} from '@mui/icons-material';
import Navbar from "./Navbar";
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import SuccessModal from "./components/SuccessModal";
import ConfirmModal from "./components/ConfirmModal";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import EditConfirmationDialog from "./components/EditConfirmationDialog";
import PublishConfirmationDialog from "./components/PublishConfirmationDialog";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import DepositToolTip from "./components/DepositToolTip";
import StarRating from "./components/StarRating";



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
  {/*const [requestedDates, setRequestedDates] = useState([]);*/}
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
  const [isLiked, setIsLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [userImage, setUserImage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const[startDateUTC,setStartDateUTC]= useState(null);
  const[endDateUTC,setEndDateUTC]= useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  console.log("currentUser", currentUser);
  const accessToken = localStorage.getItem("access_token");

  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setFullYear(today.getFullYear() + 3);

  const formDate = (date) => date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`
        );
        const data = response.data;
        setItem(data);
        setUnavailabilityPeriods(data.unavailable_periods || []);
        setNumLikes(data.num_likes || 0);

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

        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          const likedResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/objetos/like-status/${id}/`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setIsLiked(likedResponse.data.is_liked || false);
        } else {
          setIsLiked(false);
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


  const toggleLike = async () => {
    if (!item) return;
  
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/like/${item.id}/`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,  // Incluir el token de autenticación en las cabeceras
          }
        }
      );

      if (response.status === 200) {
        setIsLiked(prevState => !prevState);
        setNumLikes(response.data.num_likes); 
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Hubo un error al cambiar el estado del like.");
    }
  };
  
  useEffect(() => {
    if (!item) return;
  
    let calculatedPrice = 0;
  
    if (priceCategory === "hour" && selectedStartHour !== null && selectedEndHour !== null) {
      const hours = selectedEndHour - selectedStartHour;
      calculatedPrice = hours * item.price;
    }
  
    if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
      const days = Math.ceil((dateRange[0].endDate - dateRange[0].startDate + (1000 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24));
      calculatedPrice = days * item.price;
    }
  
    if (priceCategory === "month" && selectedDay && selectedMonths) {
      calculatedPrice = selectedMonths * item.price;
    }
  
    setTotalPrice(parseFloat(calculatedPrice.toFixed(2)));
  }, [priceCategory, selectedStartHour, selectedEndHour, dateRange, selectedDay, selectedMonths, item]);
  
  const checkOwnerStatus = (userId) => {
    setIsAuthenticated(!!currentUser);
    if  (currentUser && currentUser.id === userId) {
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
      if (userData.image) {
        setUserImage(userData.image);
      }
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

  const handleReportUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
        return;
      }
      if(!reportCategory || !reportDescription) {
        alert("Por favor, completa todos los campos.");
        return;
      }
      const reportData = {
        reporter: currentUser.id,
        reported_user: item.user,
        category: reportCategory,
        description: reportDescription,
    } 
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/usuarios/reportes/`,
      reportData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 201) {
      alert("¡Reporte enviado correctamente!");
      setShowReportModal(false);
      setReportCategory("");
      setReportDescription("");
    } 

     else if(response.status === 200){
      alert("¡Reporte actualizado correctamente!");
      setShowReportModal(false);
      setReportCategory("");
      setReportDescription("");
    }
    
    else {
      alert("Hubo un problema al enviar el reporte.");
    }
    
  }catch (error) {
      alert("Error al enviar el reporte:", error);
      console.error("Error al enviar el reporte:", error);
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
  
      const booked = [];
  
      rents.forEach((rent) => {
        const start = new Date(rent.start_date);
        const end = new Date(rent.end_date);
        const days = getDatesInRange(start, end);
  
        const status = rent.rent_status.toLowerCase();
  
        if (["accepted", "booked", "picked_up"].includes(status)) {
          booked.push(...days);
        }
      });
  
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

  const handleImageClick = (index) => {
    setModalImageIndex(index);
    setOpenImageModal(true);
  };
  
  const closeModal = () => {
    setOpenImageModal(false);
  };
  
  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % imageURLs.length);
  };
  
  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + imageURLs.length) % imageURLs.length);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("access_token")
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
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
  
      // Validaciones de fechas
      if (
        isDateUnavailable(dateRange[0].startDate) ||
        isDateUnavailable(dateRange[0].endDate) ||
        isDateUnavailable(selectedDay)
      ) {
        alert("No puedes solicitar alquiler en fechas no disponibles.");
        return;
      }
  
      let startDateUTC, endDateUTC;
  
      // Construcción de fechas según la categoría de precio
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
      } else if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
        startDateUTC = dayjs(dateRange[0].startDate).format("YYYY-MM-DD");
        endDateUTC = dayjs(dateRange[0].endDate).hour(23).minute(59).second(59).format("YYYY-MM-DDTHH:mm:ss");
      } else if (priceCategory === "month" && selectedDay && selectedMonths) {
        const start = dayjs(selectedDay);
        const end = dayjs(selectedDay).add(selectedMonths, "month");
        startDateUTC = start.format("YYYY-MM-DD");
        endDateUTC = end.format("YYYY-MM-DD");
      } else {
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
            Authorization: `Bearer ${accessToken}`,
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
  
      // Primero cerrar el modal de solicitud
      setShowRentalModal(false);
  
      // Mostrar el mensaje de error como una alerta
      console.log("Respuesta del backend:", error.response?.data);
      const errorData = error.response?.data;

// Manejar errores específicos de campos
  let errorMessage = "No se pudo realizar la solicitud";
  if (errorData) {
    if (typeof errorData === "object") {
      // Si hay errores específicos de campos, toma el primero
      const fieldErrors = Object.values(errorData).flat();
      if (fieldErrors.length > 0) {
        errorMessage = fieldErrors[0]; // Toma el primer mensaje de error
      }
    } else if (typeof errorData === "string") {
      errorMessage = errorData; // Si el backend devuelve un string
    }
  }

  alert(errorMessage);
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/publish_item/`,
        { item_id: item.id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        setDialogOpen(true); // Agrega aquí para mostrar el diálogo
        navigate(0); // Refresca la página
      } else {
        alert("Hubo un problema al publicar el ítem.");
      }
    } catch (error) {
      console.error("Error publicando el ítem:", error);
      console.log("Respuesta del backend:", error.response?.data);
  
      // Manejar el mensaje de error específico
      if (
        error.response?.data?.error ===
        "No puedes alquilar un objeto sin completar tu perfil, revisa que tu perfil esté completo y estés identificado"
      ) {
        setErrorMessage(
          "No puedes alquilar un objeto sin completar tu perfil. Revisa que tu perfil esté completo y estés identificado."
        );
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (
        Array.isArray(error.response?.data) &&
        error.response.data.length > 0
      ) {
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
        <Typography 
  variant="h4" 
  component="h1" 
  gutterBottom
  sx={{ 
    wordBreak: 'break-word', 
    overflowWrap: 'break-word',
    maxWidth: '100%', 
    whiteSpace: 'normal' 
  }}
>
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
    <PublishConfirmationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
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
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImageClick(currentImageIndex)}
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
              {accessToken &&
                <Button sx={{ marginTop: 2 }}
                  onClick={toggleLike}
                  variant="outlined"
                  color={isLiked ? 'error' : 'primary'}
                  startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                >
                  {isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
                </Button>
                }
                {numLikes > 1 && (
                  <Typography
                    variant="body2"
                    sx={{
                      marginTop: 1,
                      color: 'red',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                    }}
                  >
                  <WhatshotIcon sx={{ fontSize: 20, marginRight: 1 }} />
                  ¡Este objeto es de mucho interes entre los usuarios!
                  </Typography>
                )}
                <Typography 
                  variant="body2"
                  sx={{
                    marginTop: 2,
                    color: '#2563eb',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 18, marginRight: 1 }} /> El objeto esta guardado en favoritos por {numLikes} usuarios
                </Typography>
            </Box>

            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexDirection: { xs: "column", md: "row" } }}>
                <Avatar sx={{ width: 100, height: 100}}
                    src = {userImage ? userImage : ""}
                  >
                  </Avatar>
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
                    {item.user_rating !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <StarRating rating={item.user_rating} />
                        </Box>
                    )}
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
                  </Box>
                  {!isOwner && isAuthenticated && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button color="error" onClick={() => setShowReportModal(true)}>Reportar</Button>
                    </Box>
                  )}
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap', 
                          maxWidth: '100%' 
                        }}
                      >
                        {item.description}
                      </Typography>

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
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MoneyIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Fianza</Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {item.deposit} € 
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DepositToolTip />
                      </Box>
                  </Box>
                </Stack>
                
                {isOwner && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <EditConfirmationDialog onConfirm={() => navigate(`/update-item/${id}`)} />
                    <DeleteConfirmationDialog onConfirm={handleDelete} />

                    {/* Solo mostrar si el usuario NO es "free" */}
                    {currentUser.pricing_plan !== "free" && !item.draft_mode && (
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
          
          <Typography variant="body2" color="textSecondary" sx={{ mt:1, mb: 2 }}>
            El limite para la seleccion del periodo de alquiler es de 3 años. Por tanto, la fecha va desde el <strong>{formDate(today)}</strong> hasta el <strong>{formDate(futureDate)}</strong>.
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
  <Box sx={{ width: '100%', overflowX: 'auto' }}>
    {/* Selector de día */}
    <Typography variant="subtitle1" gutterBottom>Selecciona un día:</Typography>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        '& .rdrCalendarWrapper': {
          maxWidth: '100%',
          minWidth: 'min-content',
          fontSize: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
        }
      }}
    >
      <Calendar
        date={selectedDay}
        onChange={(date) => setSelectedDay(date) & setStartDateUTC(date) & setEndDateUTC(date)}
        minDate={new Date()}
        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
        disabledDates={[...unavailabilityPeriods.flatMap(period => {
          const start = new Date(period.start_date);
          const end = new Date(period.end_date);
          const range = getDatesInRange(start, end);
          return range;
        })]}
      />
    </Box>

    {/* Selector de hora de inicio */}
    <Typography variant="subtitle1" gutterBottom mt={2}>Selecciona la hora de inicio:</Typography>
    <Select
      fullWidth
      value={selectedStartHour !== null ? selectedStartHour : ""}
      onChange={(e) => {
        const startHour = parseInt(e.target.value);
        setSelectedStartHour(startHour);
        setSelectedEndHour(startHour + 1); // Automatiza 1h después
      }}
      displayEmpty
    >
      <MenuItem disabled value="">
        Selecciona una hora
      </MenuItem>
      {Array.from({ length: 24 }, (_, i) => (
        <MenuItem key={i} value={i}>
          {i}:00
        </MenuItem>
      ))}
    </Select>

    {/* Selector de hora de fin */}
    <Typography variant="subtitle1" gutterBottom mt={2}>Selecciona la hora de fin:</Typography>
    <Select
      fullWidth
      value={selectedEndHour !== null ? selectedEndHour : ""}
      onChange={(e) => setSelectedEndHour(parseInt(e.target.value))}
      disabled={selectedStartHour === null}
      displayEmpty
    >
      <MenuItem disabled value="">
        Selecciona una hora
      </MenuItem>
      {Array.from({ length: 24 }, (_, i) => (
        <MenuItem key={i} value={i} disabled={i <= selectedStartHour}>
          {i}:00
        </MenuItem>
      ))}
    </Select>

    {/* Resumen de selección */}
    {selectedDay && selectedStartHour !== null && selectedEndHour !== null && (
      <Box 
        sx={{ 
          marginTop: 3, 
          padding: 2, 
          border: "1px solid #ccc", 
          borderRadius: 2, 
          backgroundColor: "#f9f9f9" 
        }}
      >
        <Typography variant="h6">Resumen de selección:</Typography>
        <Typography><strong>Día:</strong> {selectedDay.toLocaleDateString()}</Typography>
        <Typography><strong>Horas:</strong> {`${selectedStartHour}:00 - ${selectedEndHour}:00`}</Typography>
      </Box>
    )}
  </Box>
)}


        {priceCategory === "day" && (
          <Box
  sx={{
    width: '100%',
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'center',
    '& .rdrCalendarWrapper': {
      width: 'auto',
      maxWidth: '100%', // muy importante
      minWidth: 'min-content',
    }
  }}
>
  <DateRange
    ranges={isOwner || !isAuthenticated ? [] : dateRange}
    onChange={(ranges) => {
      if (!isOwner || isAuthenticated) {
        setDateRange([ranges.selection]);
        setStartDateUTC(ranges.selection.startDate)
        setEndDateUTC(ranges.selection.endDate)
      }
    }}
    minDate={new Date()}
    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
    disabledDates={[...bookedDates, ...unavailabilityPeriods.flatMap(period => {
      const start = new Date(period.start_date);
      const end = new Date(period.end_date);
      const range = getDatesInRange(start, end);
      return range;
    })]}
    showDateDisplay={false} // mejora visual en móvil
    moveRangeOnFirstSelection={false}
  />
</Box>

        )}

        {priceCategory === "month" && (
            <div> 
            {/* Selector de día */}
            <Typography>Selecciona un día:</Typography>
            <Calendar
              date={selectedDay}
              onChange={(date) => setSelectedDay(date) & setStartDateUTC(date)}
              minDate={new Date()} 
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
              disabledDates={[...unavailabilityPeriods.flatMap(period => {
                const start = new Date(period.start_date);
                const end = new Date(period.end_date);
                const range = getDatesInRange(start, end);
  
                return range;
              })]}
            />

            <Typography variant="subtitle1" gutterBottom mt={2}>Selecciona la cantidad de meses:</Typography>
              <Select
                fullWidth
                value={selectedMonths !== null ? selectedMonths : ""}
                onChange={(e) => setSelectedMonths(e.target.value)}
                displayEmpty
              >
                <MenuItem disabled value="">
                  Selecciona la cantidad de meses
                </MenuItem>
                {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1} mes(es)
                        </MenuItem>
                ))}
              </Select>
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

          {showRentalModal && priceCategory ==="month" && (
          <ConfirmModal
          title="Confirmar Solicitud"
          message={`¿Quieres solicitar el objeto "${item.title}" del ${startDateUTC.toLocaleDateString()} por ${selectedMonths} meses?`}
          onCancel={() => setShowRentalModal(false)}
          onConfirm={handleRentalRequest}
          />
          )}
           {showRentalModal && priceCategory !== "month" && (
          <ConfirmModal
          title="Confirmar Solicitud"
          message={`¿Quieres solicitar el objeto "${item.title}" del ${startDateUTC.toLocaleDateString()} al ${endDateUTC.toLocaleDateString()}?`}
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
          {openImageModal && (
            <Box 
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
              onClick={closeModal}
            >
              <IconButton 
                sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}
                onClick={closeModal}
              >
                ✖️
              </IconButton>

              <IconButton 
                sx={{ position: 'absolute', left: 20, color: 'white' }}
                onClick={(e) => { e.stopPropagation(); prevModalImage(); }}
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>

              <img 
                src={imageURLs[modalImageIndex]} 
                alt={`imagen ${modalImageIndex + 1}`} 
                style={{ maxHeight: '80vh', maxWidth: '90vw', objectFit: 'contain' }}
              />

              <IconButton 
                sx={{ position: 'absolute', right: 20, color: 'white' }}
                onClick={(e) => { e.stopPropagation(); nextModalImage(); }}
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>

              <Typography variant="caption" sx={{ color: 'white', mt: 2 }}>
                {modalImageIndex + 1} / {imageURLs.length}
              </Typography>
            </Box>
          )}
          {showReportModal && (
            <Box sx={{width: "100%", display: "flex", justifyContent: "center", alignContent: "center"}}>
            <Dialog maxWidth="sm" fullWidth open={showReportModal} onClose={() => setShowReportModal(false)}>
            <DialogTitle>Reportar usuario</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Cual es el motivo del reporte?
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="reportCategoryLabel">Motivo</InputLabel>
                <Select
                  labelId="reportCategoryLabel"
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  label="Motivo"
                >
                  <MenuItem value="Mensaje de Odio">Mensaje de Odio</MenuItem>
                  <MenuItem value="Información Engañosa">Información Engañosa</MenuItem>
                  <MenuItem value="Se hace pasar por otra persona">Se hace pasar por otra persona</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                autoFocus
                margin="dense"
                id="reportDescription"
                label="Descripción"
                type="text"
                fullWidth
                variant="outlined"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                multiline
                rows={4}
              />

            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowReportModal(false)} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={handleReportUser}
                color="error"
                disabled={!reportCategory || !reportDescription}
              >
                Enviar reporte
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        )}
          </Box>
          );
         
};

export default ShowItemScreen;