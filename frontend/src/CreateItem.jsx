import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../public/styles/CreateItem.css";

const CreateItemScreen = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cancel_type: "",
    price_category: "",
    price: "",
  });

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
        const response = await fetch("http://localhost:8000/objetos/enum-choices/", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error cargando opciones.");

        const data = await response.json();

        if (!data.categories || !data.cancel_types || !data.price_categories) {
          throw new Error("Datos de la API incompletos.");
        }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/objetos/full/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("¡Item creado exitosamente!");
        setFormData({
          title: "",
          description: "",
          category: "",
          cancel_type: "",
          price_category: "",
          price: "",
        });
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

InputField.propTypes = {
  icon: PropTypes.element.isRequired,
  // other props can be added here as needed
};
const TextareaField = ({ icon, ...props }) => (
  <div className="input-group">
    <span className="input-icon">{icon}</span>
    <textarea {...props} required />
  </div>
);
TextareaField.propTypes = {
  icon: PropTypes.element.isRequired,
  // other props can be added here as needed
};

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
    <span className="select-arrow">▼</span> {/* Flecha añadida manualmente */}
  </div>
);
SelectField.propTypes = {
  icon: PropTypes.element.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
  // other props can be added here as needed
};

export default CreateItemScreen;
