import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiImage, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PropTypes from 'prop-types';
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import { Box, Stack, Typography, Alert, CircularProgress, Container, Button } from "@mui/material";
import { styled } from "@mui/system";
//import DatePicker from 'react-datepicker';
import { DateRange } from "react-date-range";
import "react-datepicker/dist/react-datepicker.css";
import PublishConfirmationDialog from "./components/PublishConfirmationDialog";
import DepositToolTip from "./components/DepositToolTip";
import {
  FileInputContainer,
  HiddenFileInput,
  ImageUploadText,
  FormContainer,
  FormTitle,
  ErrorMessage,
  SubmitButton,
} from "./components/FormStyles";

import {
  ImagePreviewGallery
} from "./components/ImagePreview";

const InputGroup = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  marginBottom: "1.5rem",
  width: "100%",
}));

const InputIcon = styled(Box)(() => ({
  position: "absolute",
  left: "12px",
  color: "#666",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
}));

const StyledInput = styled("input")(({  error }) => ({
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: "8px",
  border: error ? "1px solid #d32f2f" : "1px solid #ddd",
  fontSize: "1rem",
  transition: "border 0.3s, box-shadow 0.3s",
  "&:focus": {
    outline: "none",
    border: "1px solid #4a90e2",
    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
  },
}));

const StyledTextarea = styled("textarea")(({  error }) => ({
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: "8px",
  border: error ? "1px solid #d32f2f" : "1px solid #ddd",
  fontSize: "1rem",
  minHeight: "120px",
  resize: "vertical",
  transition: "border 0.3s, box-shadow 0.3s",
  "&:focus": {
    outline: "none",
    border: "1px solid #4a90e2",
    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
  },
}));

const StyledSelect = styled("select")(({  error }) => ({
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: "8px",
  border: error ? "1px solid #d32f2f" : "1px solid #ddd",
  fontSize: "1rem",
  appearance: "none",
  backgroundColor: "white",
  transition: "border 0.3s, box-shadow 0.3s",
  "&:focus": {
    outline: "none",
    border: "1px solid #4a90e2",
    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
  },
}));

const SelectArrow = styled(Box)(() => ({
  position: "absolute",
  right: "15px", // Ajusta la posición de la flecha
  top: "50%",
  transform: "translateY(-50%)", // Centra verticalmente la flecha
  pointerEvents: "none", // Evita que la flecha bloquee clics
  fontSize: "1rem",
  color: "#666",
}));

const CreateItemScreen = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    cancel_type: "",
    price_category: "",
    price: "",
    deposit:"",
  });

  const [images, setImages] = useState([]);
  const [options, setOptions] = useState({
    categories: [],
    subcategories: [],
    cancel_types: [],
    price_categories: [],
  });

  const [unavailablePeriods, setUnavailablePeriods] = useState([]);

  const [datesRange, setDatesRange] =useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" }
    ]);   
  const [loading, setLoading] = useState(false);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEnums = async () => {
      setFetchingOptions(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/enum-choices/`, {
          withCredentials: true,
        });

        const data = response.data;

        setOptions({
          categories: data.categories || [],
          subcategories: data.subcategories || [],
          cancel_types: data.cancel_types || [],
          price_categories: data.price_categories || [],
        });
      } catch (error) {
        console.error("Error fetching enums:", error);
        setErrorMessage("No se pudieron cargar las opciones.");
      } finally {
        setFetchingOptions(false);
      }
    };
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    }

    fetchEnums();
  }, [navigate]);

  useEffect(() => {
    validateForm();
  }, [formData, images]);

  const validateForm = () => {
    const { title, description, category, subcategory, cancel_type, price_category, price, deposit } = formData;
    const isValid =
      title.trim() !== "" &&
      description.trim() !== "" &&
      category.trim() !== "" &&
      subcategory.trim() !== "" &&
      cancel_type.trim() !== "" &&
      price_category.trim() !== "" &&
      price.trim() !== "" &&
      deposit.trim() !== "" &&
      !isNaN(price) &&
      parseFloat(price) > 0 &&
      images.length > 0;
    
    setIsFormValid(isValid);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name==="deposit") {
      // Permitir solo números y máximo dos decimales
      const regex = /^\d{0,8}(\.\d{0,2})?$/;
      if (!regex.test(value) && value !== "") {
        return; // No actualiza el estado si el formato no es válido
      }
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error específico cuando el usuario corrige el campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const CATEGORY_SUBCATEGORIES = {
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
  
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: "" });
  
    const newSubcategories = CATEGORY_SUBCATEGORIES[selectedCategory] || [];
    setFilteredSubcategories(newSubcategories);
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prevImages) => [...prevImages, ...files]);
      
      // Limpiar error de imágenes si existe
      if (fieldErrors.image) {
        setFieldErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };
  const handleSaveAsDraft = (e) => {
    handleSubmit(e, true); // true indica que es un borrador
  };
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    document.getElementById('image-upload').click();
  };

  const convertToCET = (date) => {
    const cetOffset = 2; // CET es UTC+1, pero ten en cuenta el horario de verano
    const localDate = new Date(date);
    localDate.setHours(localDate.getHours() + cetOffset);
    return localDate.toISOString();
  };
  const handleAddPeriod = () => {
    const {startDate, endDate} = datesRange[0];
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    
    if (!startDate || !endDate || new Date(convertToCET(startDate)) >= new Date(convertToCET(endDate))) {
        setErrorMessage("Las fechas de inicio y fin no son válidas.");
        return;
    }

    setUnavailablePeriods([...unavailablePeriods, { start_date: new Date(convertToCET(startDate)).toISOString().split('T')[0], end_date: new Date(convertToCET(endDate)).toISOString().split('T')[0] }]);
    setDatesRange([{ startDate: new Date(), endDate: new Date(), key: "selection" }]); // Reset
    setErrorMessage('');
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    if(isDraft){
      setIsDraft(true);
      setLoadingDash(true);
    }else{
      setLoading(true);
    }

setErrorMessage("");
setFieldErrors({});
setShowErrorMessage(false);
setSubmitSuccess(false);

const errors = {};

const validateTextField = (field, label, maxLength = 255) => {
  const value = formData[field];
  if (!value) {
    errors[field] = `El ${label} es obligatorio.`;
  } else if (value.length > maxLength) {
    errors[field] = `El ${label} no puede exceder los ${maxLength} caracteres.`;
  } else if (!/^[A-Za-z]/.test(value)) {
    errors[field] = `El ${label} debe comenzar con una letra.`;
  }
};

const validatePriceField = (field, label) => {
  const value = formData[field];
  if (!value) {
    errors[field] = `El ${label} es obligatorio.`;
  } else if (isNaN(value) || parseFloat(value) <= 0) {
    errors[field] = `El ${label} debe ser un número mayor a 0.`;
  } else if (value.includes(".") && value.split(".")[1].length > 2) {
    errors[field] = `El ${label} solo puede tener hasta dos decimales.`;
  } else if (value.length > 10) {
    errors[field] = `El ${label} no puede superar los 10 dígitos en total.`;
  } else if (parseFloat(value) > 10000) {
    errors[field] = `El ${label} no puede superar los $10,000.`;
  }
};

const validateSelectField = (field, label, validOptions) => {
  const value = formData[field];
  if (!value) {
    errors[field] = `La ${label} es obligatoria.`;
  } else if (!validOptions.includes(value)) {
    errors[field] = `Selecciona una ${label.toLowerCase()} válida.`;
  }
};

// Validaciones individuales
validateTextField("title", "título", 255);
validateTextField("description", "descripción", 1000);

validatePriceField("price", "precio");
validatePriceField("deposit", "precio");

validateSelectField("category", "categoría", options.categories.map((opt) => opt.value));
validateSelectField("cancel_type", "política de cancelación", options.cancel_types.map((opt) => opt.value));
validateSelectField("price_category", "categoría de precio", options.price_categories.map((opt) => opt.value));

if (images.length === 0) {
  errors.image = "Por favor, selecciona al menos una imagen.";
}


    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setLoadingDash(false);
      setShowErrorMessage(true);
      return;
    }

    try {
      const formDataToSend = new FormData();
      const allowedKeys = ["title", "description", "category", "subcategory", "cancel_type", "price_category", "price", "deposit"];
      formDataToSend.append("draft_mode", isDraft ? "true" : "false");
      
      Object.keys(formData).forEach((key) => {
        if (allowedKeys.includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      // Agregar imágenes
      images.forEach((image) => {
        formDataToSend.append("image_files", image);
      });

      // Adjuntar los períodos de indisponibilidad
      formDataToSend.append('unavailable_periods', JSON.stringify(unavailablePeriods));
      
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
  
      if (response.status === 201) {
        setSubmitSuccess(true);
        setDialogOpen(true);  // Agrega aquí para mostrar el diálogo
        setTimeout(() => {
          if (isDraft) {
            navigate("/drafts");
          } else {
          navigate("/");
          }
        }, 2000);
      } else {
        throw new Error("Error al crear el Item.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage("Ocurrió un error al enviar el formulario.");
      }
    }finally {
      setLoading(false);
      setLoadingDash(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        <FormContainer elevation={3}>
          <FormTitle variant="h5">Crear Nueva Publicación</FormTitle>
          
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {isDraft ? '¡Item guardado exitosamente! Redirigiendo...' : '¡Item creado exitosamente! Redirigiendo...'}
              </Alert>
            )}
          

          {fetchingOptions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <InputIcon>
                  <FiFileText />
                </InputIcon>
                <StyledInput
                  type="text"
                  name="title"
                  placeholder="Título"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!fieldErrors.title}
                />
              </InputGroup>
              {fieldErrors.title && <ErrorMessage>{fieldErrors.title}</ErrorMessage>}
              
              <InputGroup>
                <InputIcon>
                  <FiEdit />
                </InputIcon>
                <StyledTextarea
                  name="description"
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!fieldErrors.description}
                />
              </InputGroup>
              {fieldErrors.description && <ErrorMessage>{fieldErrors.description}</ErrorMessage>}

              <InputGroup>
                <InputIcon>
                  <FiLayers />
                </InputIcon>
                <StyledSelect
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  error={!!fieldErrors.category}
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {options.categories.map(opt => 
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )}
                </StyledSelect>
                <SelectArrow>▼</SelectArrow>
              </InputGroup>
              {fieldErrors.category && <ErrorMessage>{fieldErrors.category}</ErrorMessage>}

              <InputGroup>
                <InputIcon>
                  <FiLayers />
                </InputIcon>
                <StyledSelect
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  error={!!fieldErrors.category}
                >
                <option value="" disabled>Selecciona una subcategoría</option>
                 {filteredSubcategories.map(({ value, label }) => (
                   <option key={value} value={value}>{label}</option>
                 ))}
                </StyledSelect>
                <SelectArrow>▼</SelectArrow>
              </InputGroup>
              {fieldErrors.subcategory && <ErrorMessage>{fieldErrors.subcategory}</ErrorMessage>}

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <InputIcon sx={{mt: 1.5}}>
                    <FiXCircle />
                  </InputIcon>
                  <StyledSelect
                    name="cancel_type"
                    value={formData.cancel_type}
                    onChange={handleChange}
                    error={!!fieldErrors.cancel_type}
                  >
                    <option value="" disabled>Política de cancelación</option>
                    {options.cancel_types.map(opt => 
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )}
                  </StyledSelect>
                  <SelectArrow>▼</SelectArrow>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CancelPolicyTooltip />
                </Box>
              </Stack>
              {fieldErrors.cancel_type && <ErrorMessage>{fieldErrors.cancel_type}</ErrorMessage>}
              
              <InputGroup>
                <InputIcon>
                  <FiLayers />
                </InputIcon>
                <StyledSelect
                  name="price_category"
                  value={formData.price_category}
                  onChange={handleChange}
                  error={!!fieldErrors.price_category}
                >
                  <option value="" disabled>Selecciona una categoría de precio</option>
                  {options.price_categories.map(opt => 
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )}
                </StyledSelect>
                <SelectArrow>▼</SelectArrow>
              </InputGroup>
              {fieldErrors.price_category && <ErrorMessage>{fieldErrors.price_category}</ErrorMessage>}

              <InputGroup>
                <InputIcon>
                  <FiDollarSign />
                </InputIcon>
                <StyledInput
                  type="number"
                  step="0.01"
                  name="price"
                  placeholder="Precio"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!fieldErrors.price}
                />
              </InputGroup>
              {fieldErrors.price && <ErrorMessage>{fieldErrors.price}</ErrorMessage>}

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <InputGroup>
                <InputIcon>
                  <FiDollarSign />
                </InputIcon>
                <StyledInput
                  type="number"
                  step="0.01"
                  name="deposit"
                  placeholder="Fianza"
                  value={formData.deposit}
                  onChange={handleChange}
                  error={!!fieldErrors.deposit}
                />
              </InputGroup>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DepositToolTip />
                </Box>
              </Stack>
              {fieldErrors.deposit && <ErrorMessage>{fieldErrors.deposit}</ErrorMessage>}

              <FileInputContainer onClick={triggerFileSelect}>
                <FiImage size={32} color="#4a90e2" />
                <ImageUploadText>
                  Haz clic para seleccionar imágenes
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

              {/* Formulario para seleccionar los períodos de indisponibilidad con un solo calendario */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography>Seleccionar período de indisponibilidad:</Typography>
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
                  {/* Resumen de los períodos seleccionados con estilo */}
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
                          <Typography variant="h6">Resumen de selección:</Typography>
                          {unavailablePeriods.map((period, index) => (
                              <Typography key={index}>
                                  <strong>Desde:</strong> {new Date(period.start_date).toLocaleDateString()} -  
                                  <strong> Hasta:</strong> {new Date(period.end_date).toLocaleDateString()}
                              </Typography>
                          ))}
                      </Box>
                  )}
                  {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <SubmitButton 
                type="button" 
                disabled={!isFormValid ||loadingDash}
                onClick={handleSaveAsDraft}
                sx={{
                  flex: 1,
                  backgroundColor: (!isFormValid || loadingDash) ? '#cccccc' : '#555555',
                  '&:hover': {
                    backgroundColor: (!isFormValid || loadingDash) ? '#cccccc' : '#333333'
                  }
                }}
              >
                {loadingDash ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FiUpload />
                    <span>Guardar como Borrador</span>
                  </>
                )}
              </SubmitButton>
              <SubmitButton 
                type="submit" 
                disabled={!isFormValid || loading}
                sx={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <FiUpload />
                    <span>Publicar</span>
                  </>
                )}
              </SubmitButton>
              
              </Stack>
              
              {showErrorMessage && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Por favor, revisa los errores del formulario antes de enviar.
                </Alert>
              )}
          </form>
        )}
        </FormContainer>
      </Container>
      {/* Aquí va el diálogo de confirmación de publicación */}
      <PublishConfirmationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
  </Box>
  );
};

const InputField = ({ icon, error, ...props }) => (
  <InputGroup>
    <InputIcon>{icon}</InputIcon>
    <StyledInput {...props} error={!!error} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputGroup>
);

const TextareaField = ({ icon, error, ...props }) => (
  <InputGroup>
    <InputIcon>{icon}</InputIcon>
    <StyledTextarea {...props} error={!!error} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputGroup>
);

const SelectField = ({ icon, options, placeholder, error, ...props }) => (
  <InputGroup>
    <InputIcon>{icon}</InputIcon>
    <StyledSelect {...props} error={!!error}>
      <option value="" disabled>{placeholder}</option>
      {options.length > 0 ? (
        options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
      ) : (
        <option disabled>Cargando...</option>
      )}
    </StyledSelect>
    <SelectArrow>▼</SelectArrow>
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputGroup>
);

SelectField.propTypes = {
  icon: PropTypes.element.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
  error: PropTypes.string,
};

InputField.propTypes = {
  icon: PropTypes.element.isRequired,
  error: PropTypes.string,
};

TextareaField.propTypes = {
  icon: PropTypes.element.isRequired,
  error: PropTypes.string,
};

export default CreateItemScreen;