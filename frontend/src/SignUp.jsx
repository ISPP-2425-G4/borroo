import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail, FiInfo } from "react-icons/fi";
import "../public/styles/Login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFormErrors({});

    // Validar que las contraseñas coincidan en el frontend
    if (password1 !== password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Crear un objeto FormData para el envío
      const formData = new FormData();
      formData.append("username", username);
      formData.append("name", name);
      formData.append("surname", surname);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("password1", password1);
      formData.append("password2", password2);

      // URL actualizada con la ruta correcta
      const response = await fetch("https://localhost:8000/usuarios/api/register/", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        // Registro exitoso
        navigate("/login");
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
      <div className="login-box">
        <h2>Registrarse</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Nombre de usuario"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {getFieldError('username')}
          
          <div className="input-group">
            <FiInfo className="input-icon" />
            <input
              type="text"
              placeholder="Nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {getFieldError('name')}
          
          <div className="input-group">
            <FiInfo className="input-icon" />
            <input
              type="text"
              placeholder="Apellido"
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
          {getFieldError('surname')}
          
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {getFieldError('email')}
          
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPassword1(e.target.value);
              }}
            />
          </div>
          {getFieldError('password')}
          
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
          {getFieldError('password1') || getFieldError('password2')}
          
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