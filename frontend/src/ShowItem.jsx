import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiEdit, FiLayers, FiXCircle, FiDollarSign, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";

const ShowItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [imageURLs, setImageURLs] = useState([]); // URLs de imágenes
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // 🔹 Obtener datos del ítem
        const response = await fetch(`http://localhost:8000/objetos/full/${id}/`);
        if (!response.ok) throw new Error("Error cargando el ítem.");
        const data = await response.json();
        setItem(data);

        // 🔹 Obtener las URLs de las imágenes usando los IDs
        if (data.images && data.images.length > 0) {
          const urls = await Promise.all(
            data.images.map(async (imgId) => {
              try {
                const imgResponse = await fetch(`http://localhost:8000/objetos/item-images/${imgId}/`);
                if (!imgResponse.ok) throw new Error("Error cargando la imagen.");
                const imgData = await imgResponse.json();
                
                console.log(`Imagen cargada: ${imgData.image}`);
                return imgData.image; // Solo nos quedamos con la URL de la imagen
              } catch (error) {
                console.error(`Error al cargar la imagen ${imgId}:`, error);
                return null; // Retornar null para evitar que la Promise falle
              }
            })
          );
          
          // Filtrar imágenes válidas (sin errores)
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

  // 🔹 Función para eliminar el ítem
  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este ítem?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/objetos/full/${itemId}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error eliminando el ítem.");

      alert("Ítem eliminado correctamente.");
      navigate("/");
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

  if (!item) return <p>No se encontró el ítem.</p>;

  return (
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Detalles de la Publicación</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Contenedor de imágenes */}
        {imageURLs.length > 0 && (
          <div className="image-gallery">
            {imageURLs.map((url, index) => (
              <img key={index} src={url} alt="Imagen del ítem" className="item-image" />
            ))}
          </div>
        )}

        <div className="item-details">
          <p><FiFileText /> <strong>Título:</strong> {item.title}</p>
          <p><FiEdit /> <strong>Descripción:</strong> {item.description}</p>
          <p><FiLayers /> <strong>Categoría:</strong> {item.category_display}</p>
          <p><FiXCircle /> <strong>Política de cancelación:</strong> {item.cancel_type_display}</p>
          <p><FiLayers /> <strong>Categoría de precio:</strong> {item.price_category_display}</p>
          <p><FiDollarSign /> <strong>Precio:</strong> {item.price} €</p>
        </div>

        {/* Botones de acción */}
        <div className="button-group">
          <button className="rental-btn edit-btn" onClick={() => navigate(`/update-item/${id}`)}>
            <FiEdit /> Editar
          </button>

          <button className="rental-btn delete-btn" onClick={() => handleDelete(id)}>
            <FiTrash2 /> Eliminar
          </button>

          <button className="rental-btn" onClick={() => navigate("/")}>
            <FiArrowLeft /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowItemScreen;
