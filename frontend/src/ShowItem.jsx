import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiEdit, FiFileText, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";
import "../public/styles/ItemDetails.css";
import Navbar from "./Navbar";
import Modal from "./Modal";
import axios from 'axios';

const ShowItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");  // 🔹 Nuevo estado para el nombre del usuario
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: addDays(new Date(), 7), key: "selection" },
  ]);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice actual

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`
        );
        const data = response.data;
        setItem(data);

        if (data.user) {
          fetchUserName(data.user);
        }

        if (data.images && data.images.length > 0) {
          const urls = await Promise.all(
            data.images.map(async (imgId) => {
              try {
                const imgResponse = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
                );
                const imgData = imgResponse.data;
                return imgData.image;
              } catch (error) {
                console.error(`Error al cargar la imagen ${imgId}:`, error);
                return null;
              }
            })
          );

          setImageURLs(urls.filter((url) => url !== null));
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        setErrorMessage("No se pudo cargar el ítem.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  const fetchUserName = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${userId}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const userData = response.data;
      console.log("Usuario recibido:", userData); // Verificar respuesta
      setUserName(userData.name); // Ajusta si el nombre del usuario tiene otra key
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserName("Usuario desconocido"); // En caso de error, mostrar un texto genérico
    }
  };

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este ítem?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${itemId}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Ítem eliminado correctamente.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("No se pudo eliminar el ítem.");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageURLs.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageURLs.length) % imageURLs.length);
  };

  if (loading) {
    return (
      <div className="rental-container">
        <Navbar />
        <div className="rental-box">
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!item) return <p>No se encontró el ítem.</p>;

  return (
    <div className="item-details-container">
      <Navbar />
      <div className="content-container">
      <h2 className="item-title">{item.title}</h2>
        {/* 🔹 Carrusel de imágenes */}
        {imageURLs.length > 0 && (
          <div className="image-container">
            <button className="slider-btn left" onClick={prevImage}>&lt;</button>
            <img src={imageURLs[currentImageIndex]} alt="Imagen del ítem" className="slider-image" />
            <button className="slider-btn right" onClick={nextImage}>&gt;</button>
            <p className="image-counter">{currentImageIndex + 1} / {imageURLs.length}</p>
          </div>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="item-details">
          <p><FiFileText /> <strong>Descripción:</strong> {item.description}</p>
          <p><FiLayers /> <strong>Categoría:</strong> {item.category_display}</p>
          <p><FiXCircle /> <strong>Política de cancelación:</strong> {item.cancel_type_display}</p>
          <p><FiDollarSign /> <strong>Precio:</strong> {item.price} € / {item.price_category_display}</p>
          <p><strong>Publicado por:</strong> {userName}</p>
        </div>

        {/* 🔹 Calendario */}
        <div className="calendar-container">
          <h3>Selecciona un rango de fechas para el alquiler</h3>
          <DateRange
            ranges={dateRange}
            onChange={(ranges) => setDateRange([ranges.selection])}
            minDate={new Date()}
          />
        </div>

        <button className="rental-btn" onClick={() => setShowRentalModal(true)}>Solicitar alquiler</button>

        {/* 🔹 Botones de acción */}
        <div className="button-group">
          <button className="btn edit-btn" onClick={() => navigate(`/update-item/${id}`)}><FiEdit /> Editar</button>
          <button className="rental-btn delete-btn" onClick={() => handleDelete(id)}><FiTrash2 /> Eliminar</button>
          <button className="btn" onClick={() => navigate("/")}><FiArrowLeft /> Volver al inicio</button>

          {showRentalModal && (
            <Modal
              title="Confirmar Solicitud"
              message={`¿Quieres solicitar el objeto "${item.title}" del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}?`}
              onCancel={() => setShowRentalModal(false)}
              onConfirm={() => alert("Solicitud de alquiler enviada.")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowItemScreen;