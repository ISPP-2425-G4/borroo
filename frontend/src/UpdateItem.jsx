import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiFileText,
  FiEdit,
  FiLayers,
  FiXCircle,
  FiDollarSign,
  FiTrash2,
} from "react-icons/fi";
import "../public/styles/CreateItem.css";
import Navbar from "./Navbar";

const UpdateItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [options, setOptions] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [images, setImages] = useState([]); // Imágenes nuevas
  const [imagePreviews, setImagePreviews] = useState([]); // Previews de imágenes nuevas
  const [existingImages, setExistingImages] = useState([]); // Imágenes actuales (IDs y URLs)
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs de imágenes a eliminar

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemResponse = await fetch(`http://localhost:8000/objetos/full/${id}/`);
        if (!itemResponse.ok) throw new Error("Error cargando el ítem.");
        const itemData = await itemResponse.json();

        const enumResponse = await fetch("http://localhost:8000/objetos/enum-choices/");
        if (!enumResponse.ok) throw new Error("Error cargando opciones.");
        const enumData = await enumResponse.json();

        setFormData(itemData);
        setOptions(enumData);

        // Obtener las imágenes con ID y URL
        if (itemData.images && itemData.images.length > 0) {
          const imgs = await Promise.all(
            itemData.images.map(async (imgId) => {
              const imgResponse = await fetch(`http://localhost:8000/objetos/item-images/${imgId}/`);
              const imgData = await imgResponse.json();
              return { id: imgId, url: imgData.image };
            })
          );
          setExistingImages(imgs);
        }

        setIsLoaded(true);
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

  // Manejar imágenes nuevas seleccionadas
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); // Solo permitimos nuevas imágenes, no acumulamos
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    e.target.value = "";
  };

  // Limpiar imágenes nuevas seleccionadas
  const handleClearImages = () => {
    setImages([]);
    setImagePreviews([]);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();

      // 1️⃣ Agregar los campos de texto
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          formDataToSend.append(key, formData[key]?.toString() || "");
        }
      });

      // 2️⃣ Manejo de imágenes en el FormData
      if (images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append("image_files", image);
        });
      } else if (existingImages.length === 0) {
        // Si no hay imágenes nuevas y todas fueron eliminadas, enviamos `image_files` vacío
        formDataToSend.append("image_files", "");
      }

      // 3️⃣ Agregar IDs de imágenes a eliminar
      imagesToDelete.forEach((imageId) => {
        formDataToSend.append("images_to_delete", imageId);
      });

      // 4️⃣ Enviar solicitud PUT al backend
      const response = await fetch(`http://localhost:8000/objetos/full/${id}/`, {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Respuesta del servidor:", errorResponse);
        throw new Error("Error al actualizar el ítem.");
      }

      alert("¡Ítem actualizado exitosamente!");
      navigate("/");
    } catch (error) {
      console.error("Error actualizando el ítem:", error);
      setErrorMessage("Ocurrió un error al actualizar el ítem.");
    }
  };

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
          {/* Título */}
          <div className="input-group">
            <FiFileText className="input-icon" />
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          {/* Descripción */}
          <div className="input-group">
            <FiEdit className="input-icon" />
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>

          {/* Categorías y opciones */}
          {options && (
            <>
              {[
                { name: "category", options: options.categories, icon: FiLayers },
                { name: "cancel_type", options: options.cancel_types, icon: FiXCircle },
                { name: "price_category", options: options.price_categories, icon: FiLayers },
              ].map(({ name, options, icon: Icon }) => (
                <div className="input-group" key={name}>
                  <Icon className="input-icon" />
                  <select name={name} value={formData[name] || ""} onChange={handleChange} required>
                    <option value="" disabled>{`Selecciona ${name.replace("_", " ")}`}</option>
                    {options.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}

          {/* Precio */}
          <div className="input-group">
            <FiDollarSign className="input-icon" />
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          {/* Imágenes actuales */}
          {existingImages.length > 0 && (
            <div className="image-gallery">
              <p>Imágenes actuales:</p>
              {existingImages.map((img) => (
                <div key={img.id} className="image-item">
                  <img src={img.url} alt="existing" className="item-image" />

                </div>
              ))}
            </div>
          )}

          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <button type="submit" className="rental-btn">Actualizar</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateItemScreen;
