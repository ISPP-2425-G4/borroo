import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../public/styles/CreateItem.css";
import PropTypes from 'prop-types';
import axios from 'axios';

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

    fetchEnums();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    // Agregar nuevas imágenes sin eliminar las anteriores
    setImages((prevImages) => [...prevImages, ...files]);
  
    // Generar y agregar vistas previas de las nuevas imágenes
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
  
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
      console.log(user);
      if (user && user.id) {
        formDataToSend.append("user", user.id);
      } else {
        throw new Error("Usuario no autenticado");
      }
  
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
        alert("¡Item creado exitosamente!");
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
  
  

  return (
    <div className="create-item-container">
      <Navbar />
      <div className="form-box">
        <h2>Crear Publicación</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <InputField
            icon={<FiFileText />}
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleChange}
          />

          <TextareaField
            icon={<FiEdit />}
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleChange}
          />

          <SelectField
            icon={<FiLayers />}
            name="category"
            options={options.categories}
            value={formData.category}
            onChange={handleChange}
            placeholder="Selecciona una categoría"
          />

          <SelectField
            icon={<FiXCircle />}
            name="cancel_type"
            options={options.cancel_types}
            value={formData.cancel_type}
            onChange={handleChange}
            placeholder="Selecciona una política de cancelación"
          />

          <SelectField
            icon={<FiLayers />}
            name="price_category"
            options={options.price_categories}
            value={formData.price_category}
            onChange={handleChange}
            placeholder="Selecciona una categoría de precio"
          />

          <InputField
            icon={<FiDollarSign />}
            type="number"
            step="0.01"
            name="price"
            placeholder="Precio"
            value={formData.price}
            onChange={handleChange}
          />

          {/* ✅ Input para subir múltiples imágenes */}
          <p className="instruction-text">⚠️ Para seleccionar varios archivos, mantén presionada la tecla <strong>Ctrl</strong> (Windows) o <strong>Cmd</strong> (Mac) mientras eliges los archivos.</p>
          <div className="input-group">
            <label className="input-icon">📷</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
          </button>
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