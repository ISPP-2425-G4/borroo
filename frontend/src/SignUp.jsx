import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail, FiInfo, FiPhone, FiMapPin, FiHome, FiFlag, FiCheckCircle } from "react-icons/fi";
import "../public/styles/Login.css";
import axios from 'axios';
import Navbar from "./Navbar";
import { Box, TextField, Autocomplete } from "@mui/material";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    password2: "",
    phone_number: "",
    country: "",
    city: "",
    address: "",
    postal_code: "",
    pricing_plan: "free" // Valor por defecto
  });
  
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all?lang=es");
        const countryOptions = response.data.map(country => ({
          value: country.cca2,
          label: country.translations.spa.common
        }));
        setCountries(countryOptions);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCountryChange = (event, value) => {
    // Si value es un objeto (selección de la lista)
    if (value && typeof value === 'object') {
      setFormData(prevData => ({
        ...prevData,
        country: value.label
      }));
    } 
    // Si value es un string (entrada manual)
    else if (typeof value === 'string') {
      setFormData(prevData => ({
        ...prevData,
        country: value
      }));
    }
    // Si value es null (borrado)
    else {
      setFormData(prevData => ({
        ...prevData,
        country: ""
      }));
    }
  };

  const handleCountryKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevenir el envío del formulario
      
      // Obtener el texto actual del campo
      const inputValue = event.target.value.toLowerCase();
      
      // Filtrar países que coincidan con lo que está escribiendo
      const filteredCountries = countries.filter(country => 
        country.label.toLowerCase().includes(inputValue)
      );
      
      // Si hay resultados filtrados, seleccionar el primero
      if (filteredCountries.length > 0) {
        setFormData(prevData => ({
          ...prevData,
          country: filteredCountries[0].label
        }));
      } else {
        // Si no hay coincidencias, mantener el texto ingresado
        setFormData(prevData => ({
          ...prevData,
          country: event.target.value
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFormErrors({});
  
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
  
    // Validaciones manuales
    const errors = {};
  
    // Validar que el teléfono siga el formato indicado en el models.py
    if (!/^\+?[0-9]{7,15}$/.test(formData.phone_number)) {
      errors.phone_number = "Introduce un número de teléfono válido.";
    }
  
    // Validar que nombres, apellidos, país, ciudad y dirección comiencen con una letra
    const textFields = ["name", "surname", "country", "city", "address"];
    textFields.forEach(field => {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(formData[field])) {
        errors[field] = `El campo ${field} debe comenzar con una letra.`;
      }
    });

    // Validar la contraseña
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos un carácter especial.";
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos un número.";
    }
    if (formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
  
    // Validar que todos los campos obligatorios estén completos
    const requiredFields = ["username", "name", "surname", "email", "phone_number", "country", "city", "address", "postal_code", "password", "password2"];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = "Este campo es obligatorio.";
      }
    });

    // Verificar si el nombre de usuario ya existe
    try {
      const usernameCheckResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/check_username/`,
        { params: { username: formData.username } }
      );

      if (usernameCheckResponse.data.exists) {
        errors.username = "El nombre de usuario ya existe.";
      }
    } catch (error) {
      console.error("Error verificando el nombre de usuario:", error);
      setError("Error verificando el nombre de usuario");
      setLoading(false);
      return;
    }

    // Verificar si el correo electrónico ya existe
    try {
      const emailCheckResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/check_email/`,
        { params: { email: formData.email } }
      );

      if (emailCheckResponse.data.exists) {
        errors.email = "El correo electrónico ya existe.";
      }
    } catch (error) {
      console.error("Error verificando el correo electrónico:", error);
      setError("Error verificando el correo electrónico");
      setLoading(false);
      return;
    }
  
    // Si hay errores, detener el envío del formulario
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
  
    try {
      // Crear un objeto FormData para el envío
      const submitFormData = new FormData();
  
      // Añadir todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (key !== 'password2') { // No enviamos password2 al backend
          submitFormData.append(key, formData[key]);
        }
      });
  
      // Añadir campos adicionales requeridos por el backend
      submitFormData.append("password1", formData.password); // Por compatibilidad
  
      // Log para verificar los datos que se están enviando
      console.log("Datos enviados:", Object.fromEntries(submitFormData.entries()));
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/`,
        submitFormData,
        {
          withCredentials: true, // Equivalente a 'credentials: "include"'
        }
      );
  
      // Log para verificar la respuesta del servidor
      console.log("Respuesta del servidor:", response);
  
      if (response.status === 201) {
        // Registro exitoso y obtenemos los tokens
        const data = response.data;
  
        // Guardar los tokens JWT en localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        // Manejar errores de formulario desde el backend
        const data = response.data;
  
        if (typeof data === 'object' && !Array.isArray(data)) {
          // Si la respuesta contiene errores de formulario
          setFormErrors(data);
        } else {
          // Error general
          throw new Error("Error al registrar usuario");
        }
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      if (error.response) {
        const data = error.response.data;
  
        // Si el error proviene del campo postal_code
        if (data.postal_code) {
          setError("Código postal incorrecto. Verifique e intente de nuevo.");
        } else {
          setError(error.message || "Error al conectar con el servidor");
        }
  
        // Guardar errores específicos en el estado para mostrarlos debajo del campo correspondiente
        setFormErrors(data);
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar />
      <div className="login-container">
        <div className="login-spacer"> </div>
        <div className="login-box signup-box">
          <h2>Registrarse</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Nombre de usuario */}
            {formErrors.username && <div className="field-error">{formErrors.username}</div>}
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
  
            {/* Nombre */}
            {formErrors.name && <div className="field-error">{formErrors.name}</div>}
            <div className="input-group">
              <FiInfo className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
  
            {/* Apellido */}
            {formErrors.surname && <div className="field-error">{formErrors.surname}</div>}
            <div className="input-group">
              <FiInfo className="input-icon" />
              <input
                type="text"
                name="surname"
                placeholder="Apellido"
                required
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
  
            {/* Correo electrónico */}
            {formErrors.email && <div className="field-error">{formErrors.email}</div>}
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
  
            {/* Número de teléfono */}
            {formErrors.phone_number && <div className="field-error">{formErrors.phone_number}</div>}
            <div className="input-group">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                name="phone_number"
                placeholder="Número de teléfono"
                required
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
  
            {/* País */}
            {formErrors.country && <div className="field-error">{formErrors.country}</div>}
            <div className="input-group">
              <FiFlag className="input-icon" />
              <Autocomplete
                options={countries}
                getOptionLabel={(option) => {
                  // Maneja los casos donde option puede ser string u objeto
                  if (typeof option === 'string') return option;
                  return option?.label || '';
                }}
                onChange={handleCountryChange}
                onKeyDown={handleCountryKeyDown}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="country"
                    placeholder="País"
                    variant="outlined"
                    fullWidth
                    error={!!formErrors.country}
                    required
                  />
                )}
                freeSolo
                autoSelect
                filterOptions={(options, state) => {
                  // Esto mantiene visible la lista filtrada de opciones
                  return options.filter(option => 
                    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                  );
                }}
                value={formData.country ? 
                  (countries.find(c => c.label === formData.country) || formData.country) : 
                  null
                }
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    padding: '0.5rem',
                  }
                }}
              />
            </div>
  
            {/* Ciudad */}
            {formErrors.city && <div className="field-error">{formErrors.city}</div>}
            <div className="input-group">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="city"
                placeholder="Ciudad"
                required
                value={formData.city}
                onChange={handleChange}
              />
            </div>
  
            {/* Dirección */}
            {formErrors.address && <div className="field-error">{formErrors.address}</div>}
            <div className="input-group">
              <FiHome className="input-icon" />
              <input
                type="text"
                name="address"
                placeholder="Dirección"
                required
                value={formData.address}
                onChange={handleChange}
              />
            </div>
  
            {/* Código postal */}
            {formErrors.postal_code && <div className="field-error">{formErrors.postal_code}</div>}
            <div className="input-group">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="postal_code"
                placeholder="Código postal (ej. 12345 o 12345-6789)"
                required
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>
  
            {/* Plan de precios */}
            {formErrors.pricing_plan && <div className="field-error">{formErrors.pricing_plan}</div>}
            <div className="input-group">
              <FiCheckCircle className="input-icon" />
              <select
                name="pricing_plan"
                value={formData.pricing_plan}
                onChange={handleChange}
                required
              >
                <option value="free">Plan Free</option>
                <option value="basic">Plan Basic</option>
                <option value="premium">Plan Premium</option>
              </select>
            </div>
  
            {/* Contraseña */}
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
  
            {/* Confirmar contraseña */}
            {formErrors.password2 && <div className="field-error">{formErrors.password2}</div>}
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                name="password2"
                placeholder="Confirmar contraseña"
                required
                value={formData.password2}
                onChange={handleChange}
              />
            </div>
  
            {/* Botón de envío */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Crear cuenta"}
            </button>
          </form>
          <p className="register-link">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </Box>
  );
};

export default Signup;