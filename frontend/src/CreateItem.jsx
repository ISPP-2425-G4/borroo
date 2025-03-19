import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../public/styles/CreateItem.css";
import PropTypes from 'prop-types';
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";
import { Box } from "@mui/system";

const CreateItemScreen = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cancel_type: "",
    price_category: "",
    price: "",
  });

  const [images, setImages] = useState([]);
  const [options, setOptions] = useState({
    categories: [],
    cancel_types: [],
    price_categories: [],
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setIsFormValid] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/enum-choices/`, {
          withCredentials: true,
        });

        const data = response.data;

        setOptions({
          categories: data.categories || [],
          cancel_types: data.cancel_types || [],
          price_categories: data.price_categories || [],
        });
      } catch (error) {
        console.error("Error fetching enums:", error);
        setErrorMessage("No se pudieron cargar las opciones.");
      }
    };
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    }

    fetchEnums();
  }, [navigate]);

  const validateForm = () => {
    const { title, description, category, cancel_type, price_category, price } = formData;
    const isValid =
      title.trim() !== "" &&
      description.trim() !== "" &&
      category.trim() !== "" &&
      cancel_type.trim() !== "" &&
      price_category.trim() !== "" &&
      price.trim() !== "" &&
      !isNaN(price) &&
      parseFloat(price) > 0;
    
    setIsFormValid(isValid);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      // Permitir solo números y máximo dos decimales
      const regex = /^\d{0,8}(\.\d{0,2})?$/;
      if (!regex.test(value) && value !== "") {
        return; // No actualiza el estado si el formato no es válido
      }
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validateForm(); // Llama a la validación cada vez que cambia un campo
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    validateForm(); // Validar después de añadir imágenes
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, isDraft = false)  => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({});
    setShowErrorMessage(false);

    const errors = {};
    
    if(!formData.title || !formData.description || !formData.category || !formData.cancel_type || !formData.price_category || !formData.price) {
      setErrorMessage("Por favor, completa todos los campos.");
      setLoading(false);
      setShowErrorMessage(true);
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
      errors.description = "La descripcAión no puede exceder los 1000 caracteres.";
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

    if (images.length === 0) {
      setErrorMessage("Por favor, selecciona al menos una imagen.");
      setLoading(false);
      setShowErrorMessage(true);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setShowErrorMessage(true);
      return;
    }

    try {
      const formDataToSend = new FormData();
      const allowedKeys = ["title", "description", "category", "cancel_type", "price_category", "price"];
      
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
      formDataToSend.append("draft_mode", isDraft ? "true" : "false");
      // Agregar imágenes
      images.forEach((image) => {
        formDataToSend.append("image_files", image);
      });
  
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/`, formDataToSend, {
        withCredentials: true,
      });
  
      // Log para verificar la respuesta del servidor
      console.log("Respuesta del servidor:", response);
  
      if (response.status === 201) {
        if (isDraft){
          alert("¡Item guardado como borrador exitosamente!");
        }
        else{
        alert("¡Item creado exitosamente!");}
        setFormData({
          title: "",
          description: "",
          category: "",
          cancel_type: "",
          price_category: "",
          price: "",
        });
        setImages([]);
        navigate("/");
      } else {
        throw new Error("Error al crear el Item.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Ocurrió un error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveAsDraft = (e) => {
    handleSubmit(e, true); // true indica que es un borrador
  };
  const isSubmitDisabled = loading || !formData.title || !formData.description || !formData.category || !formData.cancel_type || !formData.price_category || !formData.price;

  return (
    <div 
      style={{width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      <Navbar />
      <div style={{ marginTop: "6rem",  backgroundColor: "white", padding: "2rem", borderRadius: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", maxHeight: "100%", overflowY: "auto", width: "100%", marginBottom: "2rem"}}> 
        <h2>Crear Publicación</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit} style={{width: "60vw"}}>
          <InputField
            icon={<FiFileText />}
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleChange}
            />
          {fieldErrors.title && <div className="error-message" >{fieldErrors.title}</div>} 
          <TextareaField
            icon={<FiEdit />}
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleChange}
          />
          {fieldErrors.description && <div className="error-message">{fieldErrors.description}</div>}

          <SelectField
            icon={<FiLayers />}
            name="category"
            options={options.categories}
            value={formData.category}
            onChange={handleChange}
            placeholder="Selecciona una categoría"
          />
          {fieldErrors.category && <div className="error-message">{fieldErrors.category}</div>}
          <Box sx={{display:"flex", flexDirection:"row", gap:2, width:"100%"}}>
          <SelectField
            icon={<FiXCircle />}
            name="cancel_type"
            options={options.cancel_types}
            value={formData.cancel_type}
            onChange={handleChange}
            placeholder="Selecciona una política de cancelación"
            
          />

          <CancelPolicyTooltip />
          
          </Box>
          {fieldErrors.cancel_type && <div className="error-message">{fieldErrors.cancel_type}</div>}
          
          <SelectField
            icon={<FiLayers />}
            name="price_category"
            options={options.price_categories}
            value={formData.price_category}
            onChange={handleChange}
            placeholder="Selecciona una categoría de precio"
          />
          {fieldErrors.price_category && <div className="error-message">{fieldErrors.price_category}</div>}

          <InputField
            icon={<FiDollarSign />}
            type="number"
            step="0.01"
            name="price"
            placeholder="Precio"
            value={formData.price}
            onChange={handleChange}
          />
          {fieldErrors.price && <div className="error-message">{fieldErrors.price}</div>}

          {/* ✅ Input para subir múltiples imágenes */}
          {/* <p className="instruction-text">⚠️ Para seleccionar varios archivos, mantén presionada la tecla <strong>Ctrl</strong> (Windows) o <strong>Cmd</strong> (Mac) mientras eliges los archivos.</p> */}
          <div className="input-group">
            <label className="input-icon">📷</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Imágenes nuevas seleccionadas */}
          {images.length > 0 && (
            <div className="image-gallery">
              <p>Imágenes nuevas seleccionadas:</p>
              {images.map((image, index) => (
                <div key={index}style={{display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center"}}>
                  <img src={URL.createObjectURL(image)} alt="new" className="item-image" />
                  <button type="button" onClick={() => handleRemoveImage(index)}>
                    <FiTrash2 /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
          {fieldErrors.image && <div className="error-message">{fieldErrors.image}</div>}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 3 }}>
  <button 
    type="button" 
    className={`primary-btn ${isSubmitDisabled ? "disabled-btn" : ""}`} 
    disabled={isSubmitDisabled}
    onClick={handleSaveAsDraft}
    style={{
      flex: 1,
      backgroundColor: isSubmitDisabled ? "#cccccc" : "#555555",
      color: "white",
      padding: "12px",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: isSubmitDisabled ? "not-allowed" : "pointer",
      transition: "background-color 0.3s"
    }}
  >
    Guardar como Borrador
  </button>

  <button 
    type="submit" 
    className={`primary-btn ${isSubmitDisabled ? "disabled-btn" : ""}`} 
    disabled={isSubmitDisabled}
    style={{
      flex: 1,
      backgroundColor: isSubmitDisabled ? "#cccccc" : "#1976d2",
      color: "white",
      padding: "12px",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: isSubmitDisabled ? "not-allowed" : "pointer",
      transition: "background-color 0.3s"
    }}
  >
    {loading ? "Publicando..." : "Publicar"}
  </button>
</Box>
          {/* ✅ Mensaje de error */}
          <Box sx={{display:"flex", flexDirection:"row", gap:2, mt:2, alignContent:"center", alignItems:"center", justifyContent:"center"}}>
          {showErrorMessage && ( <div className="error-message">Por favor, revisa los errores.</div> ) }
          </Box>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ icon, ...props }) => (
  <div className="input-group">
    <span className="input-icon">{icon}</span>
    <input {...props} required />
  </div>
);

const TextareaField = ({ icon, ...props }) => (
  <div className="input-group">
    <span className="input-icon">{icon}</span>
    <textarea {...props} required />
  </div>
);

const SelectField = ({ icon, options, placeholder, ...props }) => (
  <div className="input-group">
    <span className="input-icon">{icon}</span>
    <select {...props} required>
      <option value="" disabled>{placeholder}</option>
      {options.length > 0 ? (
        options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
      ) : (
        <option disabled>Cargando...</option>
      )}
    </select>
    <span className="select-arrow">▼</span>
  </div>
);

SelectField.propTypes = {
  icon: PropTypes.element.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
};
InputField.propTypes = {
  icon: PropTypes.element.isRequired,
  error: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
};
TextareaField.propTypes = {
  icon: PropTypes.element.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
};

export default CreateItemScreen;