import { useState } from "react";
import { FiFileText, FiEdit, FiLayers, FiXCircle } from "react-icons/fi";
import "../public/styles/CreateRental.css";
import Navbar from "./Navbar";

const CreateRental = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    item_category: "",
    cancel_type: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Publicación creada:", formData);
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
          <div className="input-group">
            <FiLayers className="input-icon" />
            <select
              name="item_category"
              value={formData.item_category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Electronics">Electrónica</option>
              <option value="Furniture">Muebles</option>
              <option value="Vehicles">Vehículos</option>
              <option value="Other">Otros</option>
            </select>
          </div>
          <div className="input-group">
            <FiXCircle className="input-icon" />
            <select
              name="cancel_type"
              value={formData.cancel_type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona una política de cancelación</option>
              <option value="Flexible">Flexible</option>
              <option value="Moderate">Moderada</option>
              <option value="Strict">Estricto</option>
            </select>
          </div>
          <button type="submit" className="rental-btn">Publicar</button>
        </form>
      </div>
    </div>
  );
};

export default CreateRental;
