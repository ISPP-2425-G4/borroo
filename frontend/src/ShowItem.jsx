import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiArrowLeft } from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";

const ShowItemScreen = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar datos del ítem desde el backend
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:8000/objetos/api/items/${id}/`);
        if (!response.ok) throw new Error("Error cargando el ítem.");
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        setErrorMessage("No se pudo cargar el ítem.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (!item) return <p>No se encontró el ítem.</p>;

  return (
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Detalles de la Publicación</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="item-details">
          <p><FiFileText /> <strong>Título:</strong> {item.title}</p>
          <p><FiEdit /> <strong>Descripción:</strong> {item.description}</p>
          <p><FiLayers /> <strong>Categoría:</strong> {item.category}</p>
          <p><FiXCircle /> <strong>Política de cancelación:</strong> {item.cancel_type}</p>
          <p><FiLayers /> <strong>Categoría de precio:</strong> {item.price_category}</p>
          <p><FiDollarSign /> <strong>Precio:</strong> {item.price} €</p>
        </div>

        <button className="rental-btn" onClick={() => navigate("/")}>
          <FiArrowLeft /> Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default ShowItemScreen;
