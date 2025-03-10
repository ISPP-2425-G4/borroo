import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";
import "../public/styles/ItemDetails.css";
import Navbar from "./Navbar";
import Modal from "./Modal";

const ShowItemScreen = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7), // Por defecto, 7 días de alquiler
      key: "selection",
    },
  ]);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Cargar datos del ítem desde el backend
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:8000/objetos/full/${id}/`);
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

  // Función para eliminar el ítem
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este ítem?")) return;

    try {
      const response = await fetch(`http://localhost:8000/objetos/full/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar el ítem.");

      alert("Ítem eliminado correctamente.");
      navigate("/"); // Redirige al inicio
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("No se pudo eliminar el ítem.");
    }
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
  if (!item) {
    navigate("/");
    return null;
  }

  const handleRequestRental = () => {
    setShowRentalModal(false);
    //TODO: Enviar solicitud de alquiler al backend
    alert("Solicitud de alquiler enviada.");
    
  };

  return (
    <div className="item-details-container">
      <Navbar />
      <div className="content-container">
        <div className="image-slider">
          <p>Imágenes del ítem (por implementar)</p>
        </div>

        <h2 className="item-title">{item.title}</h2> {/* Título centrado */}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="item-details">
          <p><FiFileText /> <strong>Descripción:</strong> {item.description}</p>
          <p><FiLayers /> <strong>Categoría:</strong> {item.category_display}</p>
          <p><FiXCircle /> <strong>Política de cancelación:</strong> {item.cancel_type_display}</p>
          <p><FiDollarSign /> <strong>Precio:</strong> {item.price} € / {item.price_category_display}</p>
        </div>

        {/* Calendario */}
        <div className="calendar-container">
          <h3>Selecciona un rango de fechas para el alquiler</h3>
          <DateRange
            ranges={dateRange}
            onChange={(ranges) => setDateRange([ranges.selection])}
            minDate={new Date()} // No se pueden seleccionar fechas pasadas
          />
        </div>
        {/* Botón para solicitar el alquiler */}
        <button className="rental-btn" onClick={() => setShowRentalModal(true)}>
          Solicitar alquiler
        </button>

        {/* Botones de acción - TODO si está autorizado*/}
        <div className="button-group">
          <button className="btn edit-btn" onClick={() => navigate(`/update-item/${id}`)}>
            <FiEdit /> Editar
          </button>

          <button className="btn delete-btn" onClick={handleDelete}>
            <FiTrash2 /> Eliminar
          </button>

          <button className="btn" onClick={() => navigate("/")}>
            <FiArrowLeft /> Volver al inicio
          </button>

          {/* Modal para confirmar alquiler */}
          { showRentalModal && (
            <Modal 
              title="Confirmar Solicitud" 
              message={`¿Quieres solicitar el objeto "${item.title}" del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}?`} 
              onCancel={() => setShowRentalModal(false)} 
              onConfirm={handleRequestRental} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowItemScreen;
