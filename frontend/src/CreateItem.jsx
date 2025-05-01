import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiImage, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import { Box, Stack, Typography, Alert, CircularProgress, Container, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  top: "50%", 
  transform: "translateY(-50%)", 
}));

const StyledInput = styled("input")(({   error }) => ({
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

const StyledTextarea = styled("textarea")(({   error }) => ({
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: "8px",
  border: error ? "1px solid #d32f2f" : "1px solid #ddd",
  fontSize: "1rem",
  minHeight: "120px",
  resize: "vertical",
  fontFamily: 'inherit', 
  transition: "border 0.3s, box-shadow 0.3s",
  "&:focus": {
    outline: "none",
    border: "1px solid #4a90e2",
    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
  },
}));

const StyledSelect = styled("select")(({   error }) => ({
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
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: `right 1rem center`, 
  backgroundSize: '16px 12px',
  paddingRight: '2.5rem', 
}));

// --- Componente Principal ---
const CreateItemScreen = () => {
  // --- State ---
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

  // --- Hooks para Responsividad ---
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta si es pantalla pequeña (menor que 'sm')

  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setFullYear(today.getFullYear() + 3);

  const formDate = (date) => date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  // --- Effects ---
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
        setErrorMessage("No se pudieron cargar las opciones del formulario.");
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
  }, [formData, images]); // Recalcular validación cuando cambian datos o imágenes

  // --- Funciones ---
  const validateForm = () => {
    const { title, description, category, subcategory, cancel_type, price_category, price, deposit } = formData;
    // Validación básica (puedes hacerla más robusta si quieres)
    const isValid =
      title.trim() !== "" &&
      description.trim() !== "" &&
      category.trim() !== "" &&
      subcategory.trim() !== "" &&
      cancel_type.trim() !== "" &&
      price_category.trim() !== "" &&
      price.trim() !== "" &&
      deposit.trim() !== "" &&
      !isNaN(price) && parseFloat(price) > 0 &&
      !isNaN(deposit) && parseFloat(deposit) >= 0 && // Permitir fianza 0
      images.length > 0;

    setIsFormValid(isValid);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación específica para precio y fianza mientras se escribe
    if (name === "price" || name === "deposit") {
      const regex = /^\d{0,8}(\.\d{0,2})?$/; // Hasta 8 dígitos enteros, opcionalmente 2 decimales
      if (!regex.test(value) && value !== "") {
        return; // No actualiza si el formato no es válido
      }
    }

    setFormData({ ...formData, [name]: value });

    // Limpiar error específico cuando el usuario modifica el campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Objeto para mapear subcategorías (como lo tenías)
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
      ],};

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: "" }); // Resetea subcategoría

    // Filtra las subcategorías basadas en la categoría seleccionada
    const newSubcategories = CATEGORY_SUBCATEGORIES[selectedCategory] || [];
    setFilteredSubcategories(newSubcategories);

    // Limpia error de categoría si existe
     if (fieldErrors.category) {
       setFieldErrors(prev => ({...prev, category: undefined }));
     }
     // Limpia error de subcategoría también
      if (fieldErrors.subcategory) {
       setFieldErrors(prev => ({...prev, subcategory: undefined }));
     }
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Limitar número de imágenes si es necesario (ej. máximo 10)
    const totalImages = images.length + files.length;
    if (totalImages > 10) {
        setErrorMessage("Puedes subir un máximo de 10 imágenes.");
        
        return; // No añadir si se excede
    }

    if (files.length > 0) {
      setImages((prevImages) => [...prevImages, ...files]);

      // Limpiar error de imágenes si existe
      if (fieldErrors.image) {
        setFieldErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
     // Validar de nuevo por si quitamos la última imagen
    validateForm();
  };

  const triggerFileSelect = () => {
    document.getElementById('image-upload')?.click(); // Usar optional chaining por si acaso
  };


  const handleAddPeriod = () => {
    const {startDate, endDate} = datesRange[0];

    // Validar fechas antes de añadir
    if (!startDate || !endDate || startDate >= endDate) {
        setErrorMessage("La fecha de fin debe ser posterior a la fecha de inicio.");
        // Opcionalmente, mostrar error cerca del botón/calendario
        return;
    }
    // Evitar añadir duplicados o solapamientos si es necesario (lógica más compleja)

    // Formatear fechas a YYYY-MM-DD para el backend
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];

    setUnavailablePeriods([...unavailablePeriods, { start_date: formattedStartDate, end_date: formattedEndDate }]);
    setDatesRange([{ startDate: new Date(), endDate: new Date(), key: "selection" }]); // Resetear selector
    setErrorMessage(''); // Limpiar mensaje de error si había uno
  };

  const handleSaveAsDraft = (e) => {
     // Evita validación estricta si es borrador, pero valida lo mínimo (ej. título)
     if (!formData.title.trim()) {
         setFieldErrors({ title: 'El título es necesario para guardar como borrador.' });
         setShowErrorMessage(true);
         return;
     }
     handleSubmit(e, true); // Llama a handleSubmit marcando como borrador
   };


  const handleSubmit = async (e, isDraftParam = false) => {
    e.preventDefault();
    setIsDraft(isDraftParam); // Actualiza estado local isDraft
    setLoading(isDraftParam ? false : true); // Activa loading principal solo si no es borrador
    setLoadingDash(isDraftParam ? true : false); // Activa loading de borrador si es borrador

    setErrorMessage("");
    setFieldErrors({});
    setShowErrorMessage(false);
    setSubmitSuccess(false);

    const errors = {};

    // --- Validación Detallada ---
    if (!isDraftParam) { // Solo validación completa si NO es borrador
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

        validateTextField("title", "título", 255);
        validateTextField("description", "descripción", 1000);
        validatePriceField("price", "precio");
        validatePriceField("deposit", "fianza"); // Cambiado label a fianza
        validateSelectField("category", "categoría", options.categories.map((opt) => opt.value));
        validateSelectField("subcategory", "subcategoría", filteredSubcategories.map((opt) => opt.value)); // Validar contra subcategorías filtradas
        validateSelectField("cancel_type", "política de cancelación", options.cancel_types.map((opt) => opt.value));
        validateSelectField("price_category", "categoría de precio", options.price_categories.map((opt) => opt.value));

        if (images.length === 0) {
          errors.image = "Debes seleccionar al menos una imagen.";
        }
    } else {
        // Validación mínima para borrador (ej. solo título)
        if (!formData.title.trim()) {
            errors.title = 'El título es necesario para guardar como borrador.';
        }
        // Podrías añadir otras validaciones mínimas si lo deseas
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setLoadingDash(false);
      setShowErrorMessage(true);
      return; // Detiene el envío si hay errores
    }

    // --- Envío del Formulario ---
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("draft_mode", isDraftParam ? "true" : "false");

      // Añadir campos principales
      Object.keys(formData).forEach((key) => {
         if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') { // Enviar solo si tiene valor
           formDataToSend.append(key, formData[key]);
         }
      });

      // Añadir imágenes (solo si las hay)
      if (images.length > 0) {
          images.forEach((image) => {
            // Asegurarse de que 'image' es un objeto File
            if (image instanceof File) {
                formDataToSend.append("image_files", image, image.name);
            }
          });
      }


      // Añadir períodos de indisponibilidad (solo si los hay)
      if (unavailablePeriods.length > 0) {
          formDataToSend.append('unavailable_periods', JSON.stringify(unavailablePeriods));
      }

      const accessToken = localStorage.getItem("access_token");
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // FormData establece 'Content-Type': 'multipart/form-data' automáticamente
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        setSubmitSuccess(true);
        // Mostrar diálogo de confirmación si NO es borrador
        if (!isDraftParam) {
            setDialogOpen(true);
        }
        // Redirigir después de un tiempo
        setTimeout(() => {
          if (isDraftParam) {
            navigate("/drafts"); // O a donde quieras que vayan los borradores
          } else {
            navigate("/"); // O a la página del item creado: navigate(`/item/${response.data.id}`)
          }
        }, 2000); // 2 segundos para ver el mensaje/diálogo
      } else {
        // Si el backend devuelve un status != 201 pero no lanza error
        throw new Error(response.data?.detail || "Error al crear el Item.");
      }
    } catch (error) {
      console.error("Error submitting form:", error.response || error);
      // Mejor manejo de errores del backend
      const errorData = error.response?.data;
      let backendErrorMsg = "Ocurrió un error al enviar el formulario.";
      if (errorData) {
          if (typeof errorData === 'string') {
              backendErrorMsg = errorData;
          } else if (errorData.detail) {
              backendErrorMsg = errorData.detail;
          } else if (errorData.non_field_errors) {
              backendErrorMsg = errorData.non_field_errors.join(', ');
          } else {
              // Extraer errores de campos específicos si existen
              const fieldSpecificErrors = Object.keys(errorData)
                  .map(key => `${key}: ${errorData[key].join(', ')}`)
                  .join('; ');
              if (fieldSpecificErrors) backendErrorMsg = fieldSpecificErrors;
          }
      }
      setErrorMessage(backendErrorMsg);
      setShowErrorMessage(true); // Mostrar alerta general si hay error de backend

    } finally {
      setLoading(false);
      setLoadingDash(false);
    }
  };


  // --- JSX ---
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, mt: { xs: 9, md: 10 }, pl:{xs:2, sm:3}, pr:{xs:5, sm:4} }}>
        <FormContainer elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <FormTitle variant="h5" sx={{ mb: { xs: 2, md: 3 } }}>Crear Nueva Publicación</FormTitle>

          {/* --- Mensajes de Estado --- */}
          {errorMessage && !submitSuccess && ( <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage("")}>{errorMessage}</Alert> )}
          {submitSuccess && ( <Alert severity="success" sx={{ mb: 3 }}>{isDraft ? '¡Borrador guardado exitosamente! Redirigiendo...' : '¡Item creado exitosamente! Redirigiendo...'}</Alert> )}

          {/* --- Loader mientras cargan opciones --- */}
          {fetchingOptions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}> <CircularProgress /> </Box>
          ) : (
            // --- Formulario Principal ---
            <form onSubmit={handleSubmit} noValidate>
              {/* Título */}
              <InputGroup>
                <InputIcon><FiFileText /></InputIcon>
                <StyledInput name="title" placeholder="Título" value={formData.title} onChange={handleChange} error={!!fieldErrors.title} required />
              </InputGroup>
              {fieldErrors.title && <ErrorMessage>{fieldErrors.title}</ErrorMessage>}

              {/* Descripción */}
              <InputGroup>
                <InputIcon><FiEdit /></InputIcon>
                <StyledTextarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} error={!!fieldErrors.description} required />
              </InputGroup>
              {fieldErrors.description && <ErrorMessage>{fieldErrors.description}</ErrorMessage>}

              {/* Categoría */}
              <InputGroup>
                <InputIcon><FiLayers /></InputIcon>
                <StyledSelect name="category" value={formData.category} onChange={handleCategoryChange} error={!!fieldErrors.category} required>
                  <option value="" disabled>Selecciona una categoría</option>
                  {options.categories.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </StyledSelect>
              </InputGroup>
              {fieldErrors.category && <ErrorMessage>{fieldErrors.category}</ErrorMessage>}

               {/* Subcategoría */}
              <InputGroup>
                <InputIcon><FiLayers /></InputIcon>
                <StyledSelect name="subcategory" value={formData.subcategory} onChange={handleChange} error={!!fieldErrors.subcategory} required disabled={!formData.category || filteredSubcategories.length === 0}>
                  <option value="" disabled>Selecciona una subcategoría</option>
                  {filteredSubcategories.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </StyledSelect>
              </InputGroup>
              {fieldErrors.subcategory && <ErrorMessage>{fieldErrors.subcategory}</ErrorMessage>}

              {/* Política de Cancelación y Tooltip */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
                <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
                  <InputIcon><FiXCircle /></InputIcon>
                  <StyledSelect name="cancel_type" value={formData.cancel_type} onChange={handleChange} error={!!fieldErrors.cancel_type} required>
                    <option value="" disabled>Política de cancelación</option>
                    {options.cancel_types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </StyledSelect>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'initial'}, pt: { xs: 1, sm: 0 },  }}>
                  <CancelPolicyTooltip />
                </Box>
              </Stack>
              {fieldErrors.cancel_type && <ErrorMessage>{fieldErrors.cancel_type}</ErrorMessage>}

              {/* Categoría de Precio */}
              <InputGroup>
                <InputIcon><FiLayers /></InputIcon>
                <StyledSelect name="price_category" value={formData.price_category} onChange={handleChange} error={!!fieldErrors.price_category} required>
                  <option value="" disabled>Categoría de precio</option>
                  {options.price_categories.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </StyledSelect>
              </InputGroup>
              {fieldErrors.price_category && <ErrorMessage>{fieldErrors.price_category}</ErrorMessage>}

              {/* Precio */}
              <InputGroup>
                <InputIcon><FiDollarSign /></InputIcon>
                <StyledInput type="number" inputMode="decimal" step="0.01" min="0.01" name="price" placeholder="Precio" value={formData.price} onChange={handleChange} error={!!fieldErrors.price} required />
              </InputGroup>
              {fieldErrors.price && <ErrorMessage>{fieldErrors.price}</ErrorMessage>}

               {/* Fianza y Tooltip */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
                <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
                  <InputIcon><FiDollarSign /></InputIcon>
                  <StyledInput type="number" inputMode="decimal" step="0.01" min="0" name="deposit" placeholder="Fianza (0 si no aplica)" value={formData.deposit} onChange={handleChange} error={!!fieldErrors.deposit} required />
                </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'initial'}, pt: { xs: 1, sm: 0 } }}>
                  <DepositToolTip />
                </Box>
              </Stack>
              {fieldErrors.deposit && <ErrorMessage>{fieldErrors.deposit}</ErrorMessage>}

              {/* Input de Imágenes */}
              <FileInputContainer onClick={triggerFileSelect} sx={{mb: 2, p: {xs: 1.5, sm: 2} }}>
                <FiImage size={isMobile ? 28 : 32} color="#4a90e2" />
                <ImageUploadText sx={{ fontSize: { xs: '0.9rem', sm: '1rem'}, my: 0.5 }}>
                  Haz clic para seleccionar imágenes
                </ImageUploadText>
                <ImageUploadText variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem'} }}>
                  (Máx 10 imágenes. Mantén Ctrl/Cmd para seleccionar varias)
                </ImageUploadText>
                <HiddenFileInput id="image-upload" type="file" multiple accept="image/*" onChange={handleImageChange} />
              </FileInputContainer>
              {fieldErrors.image && <ErrorMessage>{fieldErrors.image}</ErrorMessage>}

              {/* Galería de previsualización */}
              {images.length > 0 && (
                <ImagePreviewGallery images={images} onRemove={handleRemoveImage} sx={{ mb: 3 }} />
              )}

              {/* Selector de Fechas Indisponibles */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3, border: '1px solid #ddd', borderRadius: '8px', p: {xs: 1, sm: 2} }}>
                  <Typography sx={{ fontWeight: 'medium', fontSize: { xs: '0.95rem', sm: '1rem'} }}>Añadir períodos de indisponibilidad (opcional):</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt:1, mb: 2 }}>
                    El limite para la seleccion del periodo de alquiler es de 3 años. Por tanto, la fecha va desde el <strong>{formDate(today)}</strong> hasta el <strong>{formDate(futureDate)}</strong>.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', mx: {xs: -1, sm: 0} /* Evitar overflow horizontal */ }}>
                    <DateRange
                        ranges={datesRange}
                        onChange={(ranges) => setDatesRange([ranges.selection])}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
                        months={isMobile ? 1 : 2} 
                        direction={isMobile ? "vertical" : "horizontal"} // Vertical puede ser mejor en móvil
                        showDateDisplay={!isMobile} // Ocultar display superior si molesta en móvil
                        rangeColors={['#4a90e2']}
                        className="responsive-date-range" // Clase por si necesitas CSS extra
                    />
                  </Box>
                  <Button variant="contained" color="primary" onClick={handleAddPeriod} sx={{ alignSelf: 'center', mt: 1 }}>
                      Añadir Período
                  </Button>
                  {/* Resumen de períodos */}
                  {unavailablePeriods.length > 0 && (
                      <Box sx={{ mt: 2, p: 1.5, border: "1px solid #e0e0e0", borderRadius: 1, backgroundColor: "#f9f9f9" }}>
                          <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>Períodos añadidos:</Typography>
                          {unavailablePeriods.map((period, index) => (
                              <Typography key={index} variant="body2">
                                  <strong>Desde:</strong> {new Date(period.start_date).toLocaleDateString()} - <strong>Hasta:</strong> {new Date(period.end_date).toLocaleDateString()}
                              </Typography>
                          ))}
                      </Box>
                  )}
              </Box> {/* Fin Box DateRange */}

              {/* Botones de Acción */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <SubmitButton
                  type="button"
                  disabled={loadingDash || loading} // Deshabilitar si alguno está cargando
                  onClick={handleSaveAsDraft}
                  variant="outlined"
                  sx={{ flex: { sm: 1 }, width: { xs: '100%', sm: 'auto' } }} 
                >
                  {loadingDash ? (
                    <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Guardando...</>
                  ) : (
                    <><FiUpload style={{ marginRight: '8px' }} /> Guardar como Borrador</>
                  )}
                </SubmitButton>
                <SubmitButton
                  type="submit"
                  disabled={!isFormValid || loading || loadingDash}
                  variant="contained"
                  sx={{ flex: { sm: 1 }, width: { xs: '100%', sm: 'auto' } }} 
                >
                  {loading ? (
                    <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Publicando...</>
                  ) : (
                    <><FiUpload style={{ marginRight: '8px' }} /> Publicar</>
                  )}
                </SubmitButton>
              </Stack>

              {/* Mensaje final de advertencia si hay errores de campo */}
              {showErrorMessage && Object.keys(fieldErrors).length > 0 && !submitSuccess && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  Por favor, revisa los campos marcados con errores.
                </Alert>
              )}
            </form>
          )} {/* Fin del else (!fetchingOptions) */}
        </FormContainer>
      </Container>

      {/* Diálogo de confirmación (solo para publicación exitosa) */}
      <PublishConfirmationDialog open={dialogOpen && !isDraft} onClose={() => setDialogOpen(false)} />

    </Box> // Fin Box principal
  );
};


export default CreateItemScreen;