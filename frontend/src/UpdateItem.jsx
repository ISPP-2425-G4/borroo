import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";

const UpdateItemScreen = () => {
  const { id } = useParams(); // Obtener el ID del ítem desde la URL
  const navigate = useNavigate();

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

  // Cargar datos del ítem existente
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:8000/objetos/api/items/${id}/`);
        if (!response.ok) throw new Error("Error cargando el ítem.");
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        setErrorMessage("No se pudo cargar el ítem.");
      }
    };

    if (id) fetchItem();
  }, [id]);

  // Cargar datos de los enums desde el backend
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await fetch("http://localhost:8000/objetos/api/enum-choices/");
        if (!response.ok) throw new Error("Error cargando opciones.");
        const data = await response.json();
        setOptions(data);
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

    try {
      const response = await fetch(`http://localhost:8000/objetos/api/items/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al actualizar el Item");

      alert("¡Item actualizado exitosamente!");
      navigate("/");
    } catch (error) {
      console.error("Error updating item:", error);
      setErrorMessage("Ocurrió un error al actualizar el ítem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Editar Publicación</h2>
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

          {[{ name: "category", options: options.categories, icon: FiLayers },
            { name: "cancel_type", options: options.cancel_types, icon: FiXCircle },
            { name: "price_category", options: options.price_categories, icon: FiLayers }].map(({ name, options, icon: Icon }) => (
            <div className="input-group" key={name}>
              <Icon className="input-icon" />
              <select name={name} value={formData[name]} onChange={handleChange} required>
                <option value="" disabled>{`Selecciona ${name.replace("_", " ")}`}</option>
                {options.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ))}

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
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateItemScreen;
