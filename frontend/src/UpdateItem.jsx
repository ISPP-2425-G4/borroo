import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";

const UpdateItemScreen = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null); // 🔥 Ahora empieza en null
  const [options, setOptions] = useState(null); // 🔥 También empieza en null
  const [isLoaded, setIsLoaded] = useState(false); // 🔥 Indica si los datos están listos
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar datos del ítem existente y opciones de enums
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener ítem
        const itemResponse = await fetch(`http://localhost:8000/objetos/full/${id}/`);
        if (!itemResponse.ok) throw new Error("Error cargando el ítem.");
        const itemData = await itemResponse.json();

        // Obtener opciones de enums
        const enumResponse = await fetch("http://localhost:8000/objetos/enum-choices/");
        if (!enumResponse.ok) throw new Error("Error cargando opciones.");
        const enumData = await enumResponse.json();

        // Guardar datos en el estado
        setFormData(itemData);
        setOptions(enumData);
        setIsLoaded(true); // 🔥 Solo ahora se muestra el formulario
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("No se pudieron cargar los datos.");
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/objetos/full/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al actualizar el ítem");

      alert("¡Ítem actualizado exitosamente!");
      navigate("/");
    } catch (error) {
      console.error("Error updating item:", error);
      setErrorMessage("Ocurrió un error al actualizar el ítem.");
    }
  };

  // 🔥 Mostrar "Cargando..." si los datos aún no están listos
  if (!isLoaded) {
    return (
      <div className="rental-container">
        <Navbar />
        <div className="rental-box">
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

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
              <select 
                  name={typeof name === "string" ? name : "default"} 
                  value={formData[name] || ""} 
                  onChange={handleChange} 
                  required
                >
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

          <button type="submit" className="rental-btn">
            Actualizar
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateItemScreen;
