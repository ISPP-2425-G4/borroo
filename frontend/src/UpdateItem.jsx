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
import axios from 'axios';
import CancelPolicyTooltip from "./components/CancelPolicyTooltip";


const UpdateItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [options, setOptions] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const [images, setImages] = useState([]); // Imágenes nuevas
  const [existingImages, setExistingImages] = useState([]); // Imágenes actuales (IDs y URLs)
  const [removedImages, setRemovedImages] = useState([]); // Imágenes actuales eliminadas

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const itemData = itemResponse.data;

        // Verificar si el usuario actual es el propietario del objeto
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser || currentUser.id !== itemData.user) {
          alert("No tienes permiso para acceder a esta página.");
          navigate("/");
          return;
        }

        const enumResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/objetos/enum-choices/`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const enumData = enumResponse.data;

        setFormData(itemData);
        setOptions(enumData);

        // Obtener las imágenes con ID y URL
        if (itemData.images && itemData.images.length > 0) {
          const imgs = await Promise.all(
            itemData.images.map(async (imgId) => {
              const imgResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`,
                {
                  headers: { "Content-Type": "application/json" },
                }
              );
              const imgData = imgResponse.data;
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
  }, [id, navigate]);

  const validateForm = () => {
    const { title, description, category, cancel_type, price_category, price } = formData;
    const isValid =
      title.trim() !== "" &&
      description.trim() !== "" &&
      category.trim() !== "" &&
      cancel_type.trim() !== "" &&
      price_category.trim() !== "" &&
      price.trim() !== "" &&
      !isNaN(price) &&
      parseFloat(price) > 0;
    
    setIsFormValid(isValid);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      // Permitir solo números y máximo dos decimales
      const regex = /^\d{0,8}(\.\d{0,2})?$/;
      if (!regex.test(value) && value !== "") {
        return; // No actualiza el estado si el formato no es válido
      }
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validateForm(); // Llama a la validación cada vez que cambia un campo
  };

  // Manejar imágenes nuevas seleccionadas
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); // Solo permitimos nuevas imágenes, no acumulamos
    validateForm(); // Validar después de añadir imágenes
  };

  // Eliminar una imagen seleccionada
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Eliminar una imagen actual visualmente
  const handleRemoveExistingImage = (index) => {
    const removedImage = existingImages[index];
    setRemovedImages([...removedImages, removedImage]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const errors = {};

    if (!formData.title || !formData.description || !formData.category || !formData.cancel_type || !formData.price_category || !formData.price) {
      setErrorMessage("Por favor, completa todos los campos.");
      return;
    }

    if (!formData.title) {
      errors.title = "El título es obligatorio.";
    } else if (formData.title.length > 255) {
      errors.title = "El título no puede exceder los 255 caracteres.";
    } else if (!/^[A-Za-z]/.test(formData.title)) {
      errors.title = "El título debe comenzar con una letra.";
    }

    if (!formData.description) {
      errors.description = "La descripción es obligatoria.";
    } else if (formData.description.length > 1000) {
      errors.description = "La descripción no puede exceder los 1000 caracteres.";
    } else if (!/^[A-Za-z]/.test(formData.description)) {
      errors.description = "La descripción debe comenzar con una letra.";
    }

    if (!formData.price) {
      errors.price = "El precio es obligatorio.";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser un número mayor a 0.";
    } else if (formData.price.includes(".") && formData.price.split(".")[1].length > 2) {
      errors.price = "El precio solo puede tener hasta dos decimales.";
    } else if (formData.price.length > 10) {
      errors.price = "El precio no puede superar los 10 dígitos en total.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
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
      }

      // 3️⃣ Agregar IDs de imágenes actuales que no se eliminaron
      const remainingImageIds = existingImages.map(img => img.id);
      remainingImageIds.forEach(id => formDataToSend.append("remaining_image_ids", id));

      // Depuración: Mostrar el contenido de formDataToSend
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // 4️⃣ Enviar solicitud PUT al backend
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/full/${id}/`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },  // Indica que estás enviando datos tipo FormData
          withCredentials: true,  // Equivalente a 'credentials: "include"'
        }
      );

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
          {fieldErrors.title && <div className="error-message">{fieldErrors.title}</div>}
          <div className="input-group">
            <FiFileText className="input-icon" />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
  
          {/* Descripción */}
          {fieldErrors.description && <div className="error-message">{fieldErrors.description}</div>}
          <div className="input-group">
            <FiEdit className="input-icon" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
  
          {/* Categorías y opciones */}
          {options && (
            <>
              {/* Categoría */}
              <div className="input-group">
                <FiLayers className="input-icon" />
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {options.categories.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
  
              {/* Política de Cancelación con Tooltip arriba */}
            <div className="field-group">
              <div className="field-label">
                <CancelPolicyTooltip /> {/* 🔹 Ahora aparece al lado del título, no dentro del input */}
              </div>
              <div className="input-group">
                <FiXCircle className="input-icon" />
                <select
                  name="cancel_type"
                  value={formData.cancel_type || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecciona una política de cancelación</option>
                  {options.cancel_types.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

  
              {/* Categoría de Precio */}
              <div className="input-group">
                <FiLayers className="input-icon" />
                <select
                  name="price_category"
                  value={formData.price_category || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecciona una categoría de precio</option>
                  {options.price_categories.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </>
          )}
  
          {/* Precio */}
          {fieldErrors.price && <div className="error-message">{fieldErrors.price}</div>}
          <div className="input-group">
            <FiDollarSign className="input-icon" />
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
  
          {/* Imágenes actuales */}
          {existingImages.length > 0 && (
            <div className="image-gallery">
              <p>Imágenes actuales:</p>
              {existingImages.map((img, index) => (
                <div key={img.id} className="image-item">
                  <img src={img.url} alt="existing" className="item-image" />
                  <button type="button" onClick={() => handleRemoveExistingImage(index)}>
                    <FiTrash2 /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
  
          {/* Imágenes nuevas seleccionadas */}
          {images.length > 0 && (
            <div className="image-gallery">
              <p>Imágenes nuevas seleccionadas:</p>
              {images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={URL.createObjectURL(image)} alt="new" className="item-image" />
                  <button type="button" onClick={() => handleRemoveImage(index)}>
                    <FiTrash2 /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
  
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <button type="submit" className="rental-btn" disabled={!isFormValid}>Actualizar</button>
        </form>
      </div>
    </div>
  );
  
};

export default UpdateItemScreen;