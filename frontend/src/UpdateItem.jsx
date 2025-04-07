import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon
} from "@mui/icons-material";
import Navbar from "./Navbar";
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import SaveConfirmationDialog from "./components/SaveConfirmationDialog";
import { DateRange } from "react-date-range";
import { Delete } from "@mui/icons-material";
import DepositToolTip from "./components/DepositToolTip";


const UpdateItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [unavailablePeriods, setUnavailablePeriods] = useState([]);
  const [datesRange, setDatesRange] =useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" }
    ]);
  const [options, setOptions] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const itemData = itemResponse.data;

        // Verificar si el usuario actual es el propietario del objeto
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser || currentUser.id !== itemData.user) {
          alert("No tienes permiso para acceder a esta página.");
          navigate("/");
          return;
        }

        const enumResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/enum-choices/`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const enumData = enumResponse.data;

        setFormData(itemData);
        setUnavailablePeriods(
          (itemData.unavailable_periods || []).map((p) => ({
            id: p.id,
            start_date: dayjs(p.start_date).format("YYYY-MM-DD"),
            end_date: dayjs(p.end_date).format("YYYY-MM-DD")
          }))
        );
        setOptions(enumData);

        setFilteredSubcategories(getSubcategories(itemData.category));
        // Obtener las imágenes con ID y URL
        if (itemData.images && itemData.images.length > 0) {
          const imgs = await Promise.all(
            itemData.images.map(async (imgId) => {
              const imgResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`,
                {
                  headers: { "Content-Type": "application/json" },
                }
              );
              const imgData = imgResponse.data;
              return { id: imgId, url: imgData.image };
            })
          );
          setExistingImages(imgs);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("No se pudieron cargar los datos.");
      }
    };

    if (id) fetchData();
  }, [id, navigate]);
  

  const validateForm = () => {
    if (!formData) return;
    
    const { title, description, category, subcategory, cancel_type, price_category, price, deposit } = formData;
    const isValid =
      title?.trim() !== "" &&
      description?.trim() !== "" &&
      category?.trim() !== "" &&
      subcategory?.trim() !== "" &&
      cancel_type?.trim() !== "" &&
      price_category?.trim() !== "" &&
      price?.trim() !== "" &&
      deposit?.trim() !== "" &&
      !isNaN(price) &&
      parseFloat(price) > 0;
    
    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name=== "deposit") {
      // Permitir solo números y máximo dos decimales
      const regex = /^\d{0,8}(\.\d{0,2})?$/;
      if (!regex.test(value) && value !== "") {
        return; // No actualiza el estado si el formato no es válido
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  // Manejar imágenes nuevas seleccionadas
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); // Solo permitimos nuevas imágenes, no acumulamos
  };

  // Eliminar una imagen seleccionada
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Eliminar una imagen actual visualmente
  const handleRemoveExistingImage = (index) => {
    const removedImage = existingImages[index];
    setRemovedImages([...removedImages, removedImage]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const formatLocalDate = (date) => {
    // Esto formatea la fecha en "YYYY-MM-DD" usando la hora local
    return dayjs(date).format("YYYY-MM-DD");
  };

  const handleAddPeriod = () => {
    const {startDate, endDate} = datesRange[0];
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    
    if (!startDate || !endDate || !dayjs(startDate).isBefore(dayjs(endDate))) {
      setErrorMessage("Las fechas de inicio y fin no son válidas.");
        return;
    }

    setUnavailablePeriods([...unavailablePeriods, { start_date: formatLocalDate(startDate), end_date: formatLocalDate(endDate) }]);
    setDatesRange([{ startDate: new Date(), endDate: new Date(), key: "selection" }]); // Reset
    setErrorMessage('');
  };

  const handleRemovePeriod = (index) => {
    setUnavailablePeriods(unavailablePeriods.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});
    setLoading(true);

    const errors = {};

    if (!formData.title || !formData.description || !formData.category || !formData.subcategory || !formData.cancel_type || !formData.price_category || !formData.price || !formData.deposit) {
      setErrorMessage("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    if (!formData.title) {
      errors.title = "El título es obligatorio.";
    } else if (formData.title.length > 255) {
      errors.title = "El título no puede exceder los 255 caracteres.";
    } else if (!/^[A-Za-z]/.test(formData.title)) {
      errors.title = "El título debe comenzar con una letra.";
    }

    if (!formData.description) {
      errors.description = "La descripción es obligatoria.";
    } else if (formData.description.length > 1000) {
      errors.description = "La descripción no puede exceder los 1000 caracteres.";
    } else if (!/^[A-Za-z]/.test(formData.description)) {
      errors.description = "La descripción debe comenzar con una letra.";
    }

    if (!formData.price) {
      errors.price = "El precio es obligatorio.";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser un número mayor a 0.";
    } else if (formData.price.includes(".") && formData.price.split(".")[1].length > 2) {
      errors.price = "El precio solo puede tener hasta dos decimales.";
    } else if (formData.price.length > 10) {
      errors.price = "El precio no puede superar los 10 dígitos en total.";
    }
    if (!formData.deposit) {
      errors.deposit = "El precio es obligatorio.";
    } else if (isNaN(formData.deposit) || parseFloat(formData.deposit) <= 0) {
      errors.deposit = "El precio debe ser un número mayor a 0.";
    } else if (formData.deposit.includes(".") && formData.deposit.split(".")[1].length > 2) {
      errors.deposit = "El precio solo puede tener hasta dos decimales.";
    } else if (formData.deposit.length > 10) {
      errors.deposit = "El precio no puede superar los 10 dígitos en total.";
    } else if (formData.deposit > 10000) {
      errors.deposit = "El precio no puede superar los $10,000.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();

      // 1️⃣ Agregar los campos de texto
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          formDataToSend.append(key, formData[key]?.toString() || "");
        }
      });

      // 2️⃣ Manejo de imágenes en el FormData
      if (images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append("image_files", image);
        });
      }

      // 3️⃣ Agregar IDs de imágenes actuales que no se eliminaron
      const remainingImageIds = existingImages.map(img => img.id);
      remainingImageIds.forEach(id => formDataToSend.append("remaining_image_ids", id));

      // Adjuntar los períodos de indisponibilidad
      formDataToSend.append('unavailable_periods', JSON.stringify(unavailablePeriods));


      // Depuración: Mostrar el contenido de formDataToSend
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const token = localStorage.getItem("access_token");  // O donde estés almacenando el token

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
        formDataToSend,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setDialogOpen(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);


    } catch (error) {
      console.error("Error actualizando el ítem:", error);
      if (error.response) {
        console.error("Detalles del error:", error.response.data);
    }
      setErrorMessage("Ocurrió un error al actualizar el ítem.");
    } finally {
      setLoading(false);
    }
  };

  const getSubcategories = (category) => {
    const subcategories = {
      technology: [
        { value: "computers", label: "Ordenadores" },
        { value: "computer_accessories", label: "Accesorios de ordenador" },
        { value: "smartphones", label: "Smartphones" },
        { value: "tablets", label: "Tablets" },
        { value: "cameras", label: "Cámaras" },
        { value: "consoles", label: "Consolas" },
        { value: "tv", label: "Televisores" },
        { value: "monitors", label: "Monitores" },
        { value: "smarthome", label: "Hogar inteligente" },
        { value: "audio", label: "Audio" },
        { value: "smartwatchs", label: "Smartwatches" },
        { value: "printers_scanners", label: "Impresoras y escáneres" },
        { value: "drones", label: "Drones" },
        { value: "projectors", label: "Proyectores" },
        { value: "technology_others", label: "Otros (Tecnología)" },
        { value: "none", label: "Ninguno" },
      ],
      sports: [
        { value: "cycling", label: "Ciclismo" },
        { value: "gym", label: "Gimnasio" },
        { value: "calisthenics", label: "Calistenia" },
        { value: "running", label: "Running" },
        { value: "ball_sports", label: "Deportes de pelota" },
        { value: "racket_sports", label: "Deportes de raqueta" },
        { value: "paddle_sports", label: "Deportes de remo" },
        { value: "martial_arts", label: "Artes marciales" },
        { value: "snow_sports", label: "Deportes de nieve" },
        { value: "skateboarding", label: "Skate" },
        { value: "beach_sports", label: "Deportes de playa" },
        { value: "pool_sports", label: "Deportes de piscina" },
        { value: "river_sports", label: "Deportes de río" },
        { value: "mountain_sports", label: "Deportes de montaña" },
        { value: "extreme_sports", label: "Deportes extremos" },
        { value: "sports_others", label: "Otros (Deporte)" },
        { value: "none", label: "Ninguno" },
      ],
      diy: [
        { value: "electric_tools", label: "Herramientas eléctricas" },
        { value: "manual_tools", label: "Herramientas manuales" },
        { value: "machines", label: "Máquinas" },
        { value: "electricity", label: "Electricidad" },
        { value: "plumbing", label: "Fontanería" },
        { value: "woodworking", label: "Carpintería" },
        { value: "painting", label: "Pintura" },
        { value: "gardening", label: "Jardinería" },
        { value: "decoration", label: "Decoración" },
        { value: "diy_others", label: "Otros (Bricolaje)" },
        { value: "none", label: "Ninguno" },
      ],
      clothing: [
        { value: "summer_clothing", label: "Ropa de verano" },
        { value: "winter_clothing", label: "Ropa de invierno" },
        { value: "mevent_clothing", label: "Ropa de evento para hombre" },
        { value: "wevent_clothing", label: "Ropa de evento para mujer" },
        { value: "sport_event_apparel", label: "Ropa de evento deportivo" },
        { value: "mshoes", label: "Zapatos para hombre" },
        { value: "wshoes", label: "Zapatos para mujer" },
        { value: "suits", label: "Trajes" },
        { value: "dresses", label: "Vestidos" },
        { value: "jewelry", label: "Joyería" },
        { value: "watches", label: "Relojes" },
        { value: "bags", label: "Bolsos" },
        { value: "sunglasses", label: "Gafas de sol" },
        { value: "hats", label: "Sombreros" },
        { value: "clothing_others", label: "Otros (Ropa)" },
        { value: "none", label: "Ninguno" },
      ],
      furniture_and_logistics: [
        { value: "home_furniture", label: "Muebles de hogar" },
        { value: "home_appliances", label: "Electrodomésticos" },
        { value: "event_equipment", label: "Equipamiento para eventos" },
        { value: "kids_furniture", label: "Muebles para niños" },
        { value: "office_furniture", label: "Muebles de oficina" },
        { value: "kitchen", label: "Cocina" },
        { value: "bathroom", label: "Baño" },
        { value: "garden_furniture", label: "Muebles de jardín" },
        { value: "decoration_ambience", label: "Decoración y ambiente" },
        { value: "furniture_and_logistics_others", label: "Otros (Mobiliario y logística)" },
        { value: "none", label: "Ninguno" },
      ],
      entertainment: [
        { value: "videogames", label: "Videojuegos" },
        { value: "board_games", label: "Juegos de mesa" },
        { value: "books", label: "Libros" },
        { value: "movies", label: "Películas" },
        { value: "music", label: "Música" },
        { value: "instruments", label: "Instrumentos" },
        { value: "party", label: "Fiesta" },
        { value: "camping", label: "Camping" },
        { value: "travel", label: "Viaje" },
        { value: "other_entertainment", label: "Otros (Entretenimiento)" },
        { value: "none", label: "Ninguno" },
      ],
    };
  
    return subcategories[category] || [];
  };
  
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
  
    // Actualizar formData con la nueva categoría y resetear subcategoría
    setFormData((prevFormData) => ({
      ...prevFormData,
      category: selectedCategory,
      subcategory: "",
    }));
  
    // Obtener subcategorías y actualizar el estado
    setFilteredSubcategories(getSubcategories(selectedCategory));
  };



  if (!isLoaded) {
    return (
      <Container maxWidth="md">
        <Navbar />
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="h6" ml={2}>Cargando...</Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  const isSubmitDisabled = loading || !isFormValid;

  return (
    <Container maxWidth="md">
      <Navbar />
      <Paper elevation={3} sx={{ p: 4, mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Editar Publicación
        </Typography>
        
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
  
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Título */}
            <TextField
              label="Título"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              error={!!fieldErrors.title}
              helperText={fieldErrors.title}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon />
                  </InputAdornment>
                ),
              }}
            />
  
            {/* Descripción */}
            <TextField
              label="Descripción"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              error={!!fieldErrors.description}
              helperText={fieldErrors.description}
              fullWidth
              multiline
              rows={4}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditIcon />
                  </InputAdornment>
                ),
              }}
            />
  
            {/* Categorías y opciones */}
            {options && (
              <>
                {/* Categoría */}
                <FormControl fullWidth required>
                  <InputLabel id="category-label" >Categoría</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleCategoryChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    }
                    sx={{mt:1.5}}
                  >
                    <MenuItem value="" disabled>
                      Selecciona una categoría
                    </MenuItem>
                    {options.categories.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>


                <FormControl fullWidth required>
                  <InputLabel id="subcategory-label">Subcategoría</InputLabel>
                  <Select
                    labelId="subcategory-label"
                    name="subcategory"
                    value={formData.subcategory || ""}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    }
                    sx={{mt:1.5}}

                  >
                    <MenuItem value="" disabled>
                      Selecciona una subcategoría
                    </MenuItem>
                    {filteredSubcategories.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
  
                {/* Política de Cancelación con Tooltip */}
                <Box sx={{mb:12}}>
                  <Box display="flex" alignItems="center" mb={1}
                  >
                    <Typography variant="subtitle2">Política de Cancelación</Typography>
                    <Box ml={1}>
                      <CancelPolicyTooltip />
                    </Box>
                  </Box>
                  <FormControl fullWidth required>
                    <InputLabel id="cancel-type-label">Tipo de Cancelación</InputLabel>
                    <Select
                      labelId="cancel-type-label"
                      name="cancel_type"
                      value={formData.cancel_type || ""}
                      onChange={handleChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <CancelIcon />
                        </InputAdornment>
                      }
                      sx={{mt:1.5}}

                    >
                      <MenuItem value="" disabled>
                        Selecciona una política de cancelación
                      </MenuItem>
                      {options.cancel_types.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
  
                {/* Categoría de Precio */}
                <FormControl fullWidth required>
                  <InputLabel id="price-category-label">Categoría de Precio</InputLabel>
                  <Select
                    labelId="price-category-label"
                    name="price_category"
                    value={formData.price_category || ""}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    }
                    sx={{mt:1.5}}

                  >
                    <MenuItem value="" disabled>
                      Selecciona una categoría de precio
                    </MenuItem>
                    {options.price_categories.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
  
            {/* Precio */}
            <TextField
              label="Precio"
              name="price"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.price || ""}
              onChange={handleChange}
              error={!!fieldErrors.price}
              helperText={fieldErrors.price}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
             <Box display="flex" alignItems="center" mb={1}
                  >
                    <Typography variant="subtitle2">Política de Fianza</Typography>
                    <Box ml={1}>
                      <DepositToolTip />
                    </Box>
                  </Box>
            {/* Deposit */}
            <TextField
              label="Fianza"
              name="deposit"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.deposit || ""}
              onChange={handleChange}
              error={!!fieldErrors.deposit}
              helperText={fieldErrors.deposit}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
  
            {/* Imágenes actuales */}
            {existingImages.length > 0 && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Imágenes actuales:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {existingImages.map((img, index) => (
                    <Box key={img.id} sx={{ position: 'relative', width: 150, height: 150 }}>
                      <img
                        src={img.url}
                        alt="existing"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExistingImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
  
            {/* Imágenes nuevas seleccionadas */}
            {images.length > 0 && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Imágenes nuevas seleccionadas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt="new"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
  
            {/* Input para seleccionar archivos */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              Subir Imágenes
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </Button>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  <Typography variant="h6">Seleccionar período de indisponibilidad:</Typography>

  <DateRange
    ranges={datesRange}
    onChange={(ranges) => setDatesRange([ranges.selection])}
    minDate={new Date()}
  />

  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleAddPeriod} 
    sx={{ marginTop: 2 }}
  >
    Añadir Período
  </Button>

  {/* Resumen de períodos seleccionados */}
  {unavailablePeriods.length > 0 && (
    <Box 
      sx={{ 
        marginTop: 2, 
        padding: 2, 
        border: "1px solid #ccc", 
        borderRadius: 4, 
        backgroundColor: "#f9f9f9" 
      }}
    >
      <Typography variant="h6">Períodos de Indisponibilidad</Typography>
      {unavailablePeriods.map((period, index) => (
        <Box 
          key={index} 
          sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 1 }}
        >
          <Typography>
            <strong>Desde:</strong> {new Date(period.start_date).toLocaleDateString()} -  
            <strong> Hasta:</strong> {new Date(period.end_date).toLocaleDateString()}
          </Typography>
          <IconButton onClick={() => handleRemovePeriod(index)} color="error">
            <Delete />
          </IconButton>
        </Box>
      ))}
    </Box>
  )}

  {errorMessage && <Typography color="error">{errorMessage}</Typography>}
</Box>
            {/* Botón de envío */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitDisabled}
              sx={{ mt: 3 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Actualizando...
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
          </Stack>
        </Box>
      </Paper>
      <SaveConfirmationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Container>
  );
};

export default UpdateItemScreen;