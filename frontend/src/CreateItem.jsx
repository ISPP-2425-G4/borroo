import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";


const CreateItemScreen = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cancel_type: "",
    price_category: "",
    price: "",
  });
  const navigate = useNavigate();

  const [options, setOptions] = useState({
    categories: [],
    cancel_types: [],
    price_categories: [],
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar datos de los enums desde el backend
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await fetch("http://localhost:8000/objetos/enum-choices/", {
          method: "GET",
          credentials: "include", 
        });

        if (!response.ok) {
          throw new Error("Error cargando opciones del formulario.");
        }

        const data = await response.json();


        if (
          !data.categories ||
          !data.cancel_types ||
          !data.price_categories
        ) {
          throw new Error("Respuesta de API inválida. Faltan datos.");
        }

        setOptions({
          categories: Array.isArray(data.categories) ? data.categories : [],
          cancel_types: Array.isArray(data.cancel_types) ? data.cancel_types : [],
          price_categories: Array.isArray(data.price_categories) ? data.price_categories : [],
        });

      } catch (error) {
        console.error("Error fetching enums:", error);
        setErrorMessage("No se pudieron cargar las opciones. Inténtalo de nuevo.");
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
      const response = await fetch("http://localhost:8000/objetos/api/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Crear Publicación</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiFileText className="input-icon" />
            <input
              type="text"
              name="title"
              placeholder="Título"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FiEdit className="input-icon" />
            <textarea
              name="description"
              placeholder="Descripción"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Select dinámico para Categoría */}
          <div className="input-group">
            <FiLayers className="input-icon" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona una categoría</option>
              {options.categories.length > 0 ? (
                options.categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))
              ) : (
                <option disabled>Cargando categorías...</option>
              )}
            </select>
          </div>

          {/* Select dinámico para Política de Cancelación */}
          <div className="input-group">
            <FiXCircle className="input-icon" />
            <select
              name="cancel_type"
              value={formData.cancel_type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona una política de cancelación</option>
              {options.cancel_types.length > 0 ? (
                options.cancel_types.map((cancel) => (
                  <option key={cancel.value} value={cancel.value}>
                    {cancel.label}
                  </option>
                ))
              ) : (
                <option disabled>Cargando políticas...</option>
              )}
            </select>
          </div>

          {/* Select dinámico para Categoría de Precio */}
          <div className="input-group">
            <FiLayers className="input-icon" />
            <select
              name="price_category"
              value={formData.price_category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona una categoría de precio</option>
              {options.price_categories.length > 0 ? (
                options.price_categories.map((price) => (
                  <option key={price.value} value={price.value}>
                    {price.label}
                  </option>
                ))
              ) : (
                <option disabled>Cargando categorías de precio...</option>
              )}
            </select>
          </div>

          <div className="input-group">
            <FiDollarSign className="input-icon" />
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="Precio"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="rental-btn" disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateItemScreen;
