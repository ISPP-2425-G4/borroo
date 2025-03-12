import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail, FiInfo, FiPhone, FiMapPin, FiHome, FiFlag, FiCheckCircle } from "react-icons/fi";
import "../public/styles/Login.css";

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFormErrors({});
  
    // Validar que las contraseñas coincidan en el frontend
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
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
  
      const response = await fetch("http://localhost:8000/usuarios/full/", {
        method: "POST",
        body: submitFormData,
        credentials: "include",
      });
  
      if (response.ok) {
        // Registro exitoso y obtenemos los tokens
        const data = await response.json();
        
        // Guardar los tokens JWT en localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate("/");
      } else {
        // Manejar errores de formulario desde el backend
        const data = await response.json();
        
        if (typeof data === 'object' && !Array.isArray(data)) {
          // Si la respuesta contiene errores de formulario
          setFormErrors(data);
        } else {
          // Error general
          throw new Error("Error al registrar usuario");
        }
      }
    } catch (error) {
      setError(error.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar errores de campo específicos
  const getFieldError = (fieldName) => {
    return formErrors[fieldName] ? 
      <div className="field-error">{formErrors[fieldName].join(', ')}</div> : null;
  };

  return (
    <div className="login-container">
    <div  className="login-spacer"> </div>
      <div className="login-box signup-box">
        <h2>Registrarse</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
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
          {getFieldError('username')}
          
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
          {getFieldError('name')}
          
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
          {getFieldError('surname')}
          
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
          {getFieldError('email')}
          
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
          {getFieldError('phone_number')}
          
          <div className="input-group">
            <FiFlag className="input-icon" />
            <input
              type="text"
              name="country"
              placeholder="País"
              required
              value={formData.country}
              onChange={handleChange}
            />
          </div>
          {getFieldError('country')}
          
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
          {getFieldError('city')}
          
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
          {getFieldError('address')}
          
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
          {getFieldError('postal_code')}
          
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
          {getFieldError('pricing_plan')}
          
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
          {getFieldError('password')}
          
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
          {getFieldError('password2')}
          
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
  );
};

export default Signup;