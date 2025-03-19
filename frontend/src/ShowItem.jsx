import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiEdit, FiFileText, FiLayers, FiXCircle, FiDollarSign } from "react-icons/fi";
import { DateRange  } from "react-date-range";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [priceCategory, setPriceCategory]= useState(null)
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedStartHour, setSelectedStartHour] = useState(null);
  const [selectedEndHour, setSelectedEndHour] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

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
        
        if(data.price_category){
          setPriceCategory(data.price_category)
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

  useEffect(() => {
    if (!item) return;
  
    let calculatedPrice = 0;
  
    if (priceCategory === "hour" && selectedStartHour !== null && selectedEndHour !== null) {
      const hours = selectedEndHour - selectedStartHour;
      calculatedPrice = hours * item.price;
    }
  
    if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
      const days = Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24));
      calculatedPrice = days * item.price;
    }
  
    if (priceCategory === "month" && selectedDay && selectedMonths) {
      calculatedPrice = selectedMonths * item.price;
    }
  
    setTotalPrice(parseFloat(calculatedPrice.toFixed(2)));
  }, [priceCategory, selectedStartHour, selectedEndHour, dateRange, selectedDay, selectedMonths, item]);

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

  const handleRentalRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
        return;
      }
  
      let startDateUTC, endDateUTC;
  
      if (priceCategory === "hour" && selectedDay && selectedStartHour !== null && selectedEndHour !== null) {
        // Construir fecha con hora para alquiler por horas
        const start = new Date((selectedDay));
        start.setHours(selectedStartHour+1, 0, 0, 0);
  
        const end = new Date((selectedDay));
        end.setHours(selectedEndHour+1, 0, 0, 0);
  
        startDateUTC = start;
        endDateUTC = end;
      } 
      else if (priceCategory === "day" && dateRange[0].startDate && dateRange[0].endDate) {
        // Usar las fechas seleccionadas para alquiler por días
        startDateUTC = new Date(convertToCET(dateRange[0].startDate));
        endDateUTC = new Date(convertToCET(dateRange[0].endDate));
      } 
      else if (priceCategory === "month" && selectedDay && selectedMonths) {
        // Construir fechas para alquiler por meses
        const start = new Date(selectedDay);
        const end = new Date(selectedDay);
        end.setMonth(end.getMonth() + parseInt(selectedMonths));
  
        startDateUTC = convertToCET(start);
        endDateUTC = convertToCET(end);
      } 
      else {
        alert("Por favor, selecciona correctamente la fecha de inicio y fin.");
        return;
      }
  
      // Enviar la solicitud al servidor
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
  const convertToCET = (date) => {
    const cetOffset = 2; // CET es UTC+1, pero ten en cuenta el horario de verano
    const localDate = new Date(date);
    localDate.setHours(localDate.getHours() + cetOffset);
    return localDate.toISOString();
  };

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

        {priceCategory === "hour" && (
          <div> 
            {/* Selector de día */}
            <label>Selecciona un día:</label>
            <DatePicker
              selected={selectedDay}
              onChange={(date) => setSelectedDay(date)}
              minDate={new Date()} // Evita fechas pasadas
              excludeDates={[...requestedDates, ...bookedDates]} // Bloquea días ocupados
              dateFormat="yyyy/MM/dd"
              inline // Muestra el calendario directamente
            />

            {/* Selector de hora de inicio */}
            <label>Selecciona la hora de inicio:</label>
            <select
              value={selectedStartHour}
              onChange={(e) => {
                const startHour = parseInt(e.target.value);
                setSelectedStartHour(startHour);
                setSelectedEndHour(startHour + 1); // Automáticamente una hora después
              }}>
              <option value="" disabled>Selecciona una hora</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i}:00
                </option>
              ))}
            </select>

            {/* Selector de hora de fin */}
            <label>Selecciona la hora de fin:</label>
            <select
              value={selectedEndHour}
              onChange={(e) => setSelectedEndHour(parseInt(e.target.value))}
              disabled={selectedStartHour === null} // Deshabilita si no hay hora inicio
            >
              <option value="" disabled>Selecciona una hora</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i} disabled={i <= selectedStartHour}>
                  {i}:00
                </option>
              ))}
            </select>
          </div>
        )}

        {priceCategory === "day" && (
          <DateRange
            ranges={dateRange}
            onChange={(ranges) => {
              const start = ranges.selection.startDate;
              const end = ranges.selection.endDate;

              // Si el usuario selecciona el mismo día como inicio y fin, establecerlo correctamente
              if (start.toDateString() === end.toDateString()) {
                setDateRange([{ startDate: start, endDate: start, key: "selection" }]);
              } else {
                setDateRange([ranges.selection]);
              }
            }}
            minDate={new Date()}
            disabledDates={[...requestedDates, ...bookedDates]}
          />
        )}

        {priceCategory === "month" && (
          <div>
            <label>Selecciona la fecha de inicio:</label>
            <DatePicker
              selected={selectedDay}
              onChange={(date) => setSelectedDay(date)}
              minDate={new Date()} // Evita fechas pasadas
              excludeDates={[...requestedDates, ...bookedDates]} // Bloquea días ocupados
              dateFormat="yyyy/MM/dd"
              inline // Muestra el calendario directamente
            />

            <label>Selecciona la cantidad de meses:</label>
            <select onChange={(e) => setSelectedMonths(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} mes(es)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

        <h3>Total a pagar: <strong>{totalPrice} €</strong></h3>
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