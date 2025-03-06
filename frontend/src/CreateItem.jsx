import { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import "../public/styles/CreateRental.css";
import Navbar from "./Navbar";

const CreateItemScreen = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cancel_type: "",
    price_category: "",
    price: ""
  });

  const [options, setOptions] = useState({
    categories: [],
    cancel_types: [],
    price_categories: []
  });

  // Cargar datos de los enums desde el backend
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await fetch("/api/enum-choices/");
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        } else {
          console.error("Error fetching enum choices");
        }
      } catch (error) {
        console.error("Error fetching enums:", error);
      }
    };
    fetchEnums();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Item created:", formData);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Item creado exitosamente");
        setFormData({
          title: "",
          description: "",
          category: "",
          cancel_type: "",
          price_category: "",
          price: ""
        });
      } else {
        alert("Error al crear el Item");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Ocurrió un error");
    }
  };

  return (
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Crear Publicación</h2>
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
              {options.categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
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
              {options.cancel_types.map((cancel) => (
                <option key={cancel.value} value={cancel.value}>
                  {cancel.label}
                </option>
              ))}
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
              {options.price_categories.map((price) => (
                <option key={price.value} value={price.value}>
                  {price.label}
                </option>
              ))}
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
          <button type="submit" className="rental-btn">Publicar</button>
        </form>
      </div>
    </div>
  );
};

export default CreateItemScreen;
