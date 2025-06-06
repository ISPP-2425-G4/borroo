import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PropTypes from 'prop-types';
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import PublishConfirmationDialog from "./components/PublishConfirmationDialog";
import { Box, Stack, Typography, Alert, CircularProgress, Paper, Container } from "@mui/material";
import { styled } from "@mui/system";


const FormContainer = styled(Paper)(() => ({
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  width: "100%",
  maxWidth: "800px",
  margin: "2rem auto",

  
}));

const FormTitle = styled(Typography)(() => ({
  fontSize: "1.75rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
  color: "#333",
}));

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

const ErrorMessage = styled(Typography)(() => ({
  color: "#d32f2f",
  fontSize: "0.8rem",
  marginTop: "-12px",
  marginBottom: "12px",
}));


const SubmitButton = styled("button")(({ disabled }) => ({
  width: "100%",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: disabled ? "#cccccc" : "#4a90e2",
  color: "white",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    background: disabled ? "#cccccc" : "#3a7bc8",
  },
}));


const CreateItemRequestView = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    cancel_type: "",
    price_category: "",
    price: "",
    deposit: "",
  });

  const [options, setOptions] = useState({
    categories: [],
    subcategories: [],
    cancel_types: [],
    price_categories: [],
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  }, [formData]);

  const validateForm = () => {
    const { title, description, category, subcategory, cancel_type,price_category, price, deposit } = formData;
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
      parseFloat(price) > 0
    
    setIsFormValid(isValid);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "deposit") {
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

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: "" });
  
    let newSubcategories = [];
  
    if (selectedCategory === "technology") {
      newSubcategories = [
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

      ];
    } else if (selectedCategory === "sports") {
      newSubcategories = [
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

      ];
    } else if (selectedCategory === "diy") {
      newSubcategories = [
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

      ];
    } else if (selectedCategory === "clothing") {
      newSubcategories = [
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

      ];
    } else if (selectedCategory === "furniture_and_logistics") {
      newSubcategories = [
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

      ];
    } else if (selectedCategory === "entertainment") {
      newSubcategories = [
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
      ];
    }
    setFilteredSubcategories(newSubcategories);
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setErrorMessage("");
    setFieldErrors({});
    setShowErrorMessage(false);
    setSubmitSuccess(false);

    const errors = {};
    
    if(!formData.title) {
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
    } else if (formData.price > 10000) {
      errors.price = "El precio no puede superar los $10,000.";
    }

    if (!formData.deposit) {
      errors.price = "El precio es obligatorio.";
    } else if (isNaN(formData.deposit) || parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser un número mayor a 0.";
    } else if (formData.deposit.includes(".") && formData.price.split(".")[1].length > 2) {
      errors.price = "El precio solo puede tener hasta dos decimales.";
    } else if (formData.deposit.length > 10) {
      errors.price = "El precio no puede superar los 10 dígitos en total.";
    } else if (formData.deposit > 10000) {
      errors.price = "El precio no puede superar los $10,000.";
    }

    if(!formData.category) {
      errors.category = "La categoría es obligatoria.";
    } else if (!options.categories.map((opt) => opt.value).includes(formData.category)) {
      errors.category = "Selecciona una categoría válida.";
    }

    if(!formData.cancel_type) {
      errors.cancel_type = "La política de cancelación es obligatoria.";
    } else if (!options.cancel_types.map((opt) => opt.value).includes(formData.cancel_type)) {
      errors.cancel_type = "Selecciona una política de cancelación válida.";
    }

    if(!formData.price_category) {
      errors.price_category = "La categoría de precio es obligatoria.";
    } else if (!options.price_categories.map((opt) => opt.value).includes(formData.price_category)) {
      errors.price_category = "Selecciona una categoría de precio válida.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setShowErrorMessage(true);
      return;
    }

    try {
      const formDataToSend = new FormData();
      const allowedKeys = ["title", "description", "category", "subcategory", "cancel_type", "price_category", "price", "deposit"];
      
      Object.keys(formData).forEach((key) => {
        if (allowedKeys.includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      // Obtener usuario autenticado desde localStorage o contexto
      const user = JSON.parse(localStorage.getItem("user")); 
      if (user && user.id) {
        formDataToSend.append("user", user.id);
      } else {
        throw new Error("Usuario no autenticado");
      }
  

      const accessToken = localStorage.getItem("access_token");

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/objetos/create_item_request/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
  
      if (response.status === 201) {
        setSubmitSuccess(true);
        setDialogOpen(true);  // Agrega aquí para mostrar el diálogo
        setTimeout(() => {
          navigate("/list_item_requests");
        }, 2000);
      } else {
        throw new Error("Error al crear el Item.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.response?.data?.message || "Ocurrió un error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, mt: { xs: 9, md: 10 }, pl:{xs:2, sm:3}, pr:{xs:5, sm:4} }}>
        <FormContainer elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <FormTitle variant="h5">Crear Nuevo Anuncio</FormTitle>
          
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {'¡Item creado exitosamente! Redirigiendo...'}
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

              <Stack direction={{xs:"column", sm:"row"}} spacing={2} sx={{ mb: 2, alignItems:"center" }}>
                <Box sx={{ flex: 1, position: "relative", width: "100%" }}>
                  <InputIcon >
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
                <Box sx={{ mt: { xs: 1, sm: 0 }, ml: { xs: 0, sm: 2 }, alignSelf:{xs:"flex-start", sm:"center"}}}>
                  
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
                  error={!!fieldErrors.price}
                />
              </InputGroup>
              

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

export default CreateItemRequestView;