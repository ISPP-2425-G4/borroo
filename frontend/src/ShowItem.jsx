import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiEdit, FiFileText, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../public/styles/ItemDetails.css";
import Navbar from "./Navbar";
import Modal from "./Modal";
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";



const ShowItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");  // 🔹 Nuevo estado para el nombre del usuario
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice actual
  const [requestedDates, setRequestedDates] = useState([]); // Solicitudes (amarillo), de momento en gris
  const [bookedDates, setBookedDates] = useState([]);
  const [isOwner, setIsOwner] = useState(false); // Estado para verificar si el usuario es el propietario

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
          // Verificar si el usuario actual es el propietario del ítem
          const currentUser = JSON.parse(localStorage.getItem("user"));
          if (currentUser && currentUser.id === data.user) {
            setIsOwner(true);
          }
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
        // Obtener fechas ocupadas
        const rentResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/rentas/full/item/${id}/`
        );
        const rents = rentResponse.data;

        const requested = [];
        const booked = [];
        rents.forEach((rent) => {
          const start = new Date(rent.start_date);
          const end = new Date(rent.end_date);
          const days = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
          }
          if (rent.rent_status === "requested") {
            requested.push(...days);
          } else if (rent.rent_status === "BOOKED") {
            booked.push(...days);
          }
        });

        setRequestedDates(requested);
        setBookedDates(booked);
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

  const handleRentalRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
        return;
      }

      const startDateUTC = new Date(dateRange[0].startDate).toISOString();
      const endDateUTC = new Date(dateRange[0].endDate).toISOString();

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/rentas/full/first_request/`,
        {
          item: id,
          start_date: startDateUTC,
          end_date: endDateUTC,
          renter: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      if (response.status === 201) {
        alert("Solicitud de alquiler enviada correctamente.");
        setShowRentalModal(false);
      } else {
        alert("Hubo un problema con la solicitud.");
      }
    } catch (error) {
      console.error("Error al solicitar alquiler:", error);
      alert(error.response?.data?.error || "No se pudo realizar la solicitud.");
    }
  };  

  return (
    <div className="item-details-container">
      <Navbar />
      <div className="content-container">
        <h2 className="item-title">{item.title}</h2>
        <h2 className="item-title">{item.draft_mode}</h2>
  
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
  
          {/* 🔹 Política de cancelación con tooltip */}
          <div className="cancel-policy-wrapper">
          <div className="policy-label">
            <FiXCircle />
            <strong>Política de cancelación:</strong>
          </div>
          <p className="policy-value">{item.cancel_type_display}</p>
          <CancelPolicyTooltip />
          </div>
  
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
            disabledDates={[...requestedDates, ...bookedDates]}
          />
        </div>
  
        {/* 🔹 Botón de solicitar alquiler */}
        {!isOwner && (
          <button className="rental-btn" onClick={() => setShowRentalModal(true)}>Solicitar alquiler</button>
        )}
  
        {/* 🔹 Botones de acción */}
        {isOwner && (
          <div className="button-group">
            <button className="btn edit-btn" onClick={() => navigate(`/update-item/${id}`)}>
              <FiEdit /> Editar
            </button>
            <button className="rental-btn delete-btn" onClick={() => handleDelete(id)}>
              <FiTrash2 /> Eliminar
            </button>
          </div>
        )}
  {item.draft_mode && (
  <div style={{ 
    backgroundColor: "#fff8c4", 
    padding: "1rem", 
    borderRadius: "8px", 
    margin: "1rem 0", 
    textAlign: "center", 
    border: "1px solid #e0c243" 
  }}>
    <h3 style={{ color: "#b58900", marginBottom: "1rem" }}>📌 BORRADOR</h3>
    <button 
      className="rental-btn" 
      style={{
        backgroundColor: "#1976d2",
        color: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
        border: "none"
      }}
      onClick={() => {
        // 🔜 Aquí iría tu función handlePublish() cuando la tengas
        alert("Aquí irá la llamada a publicar el ítem");
      }}
    >
      Publicar
    </button>
  </div>
)}
        <button className="btn" onClick={() => navigate("/")}>
          <FiArrowLeft /> Volver al inicio
        </button>
  
        {showRentalModal && (
          <Modal
            title="Confirmar Solicitud"
            message={`¿Quieres solicitar el objeto "${item.title}" del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}?`}
            onCancel={() => setShowRentalModal(false)}
            onConfirm={() => handleRentalRequest()}
          />
        )}
      </div>
    </div>
  );
  
};

export default ShowItemScreen;