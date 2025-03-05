import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import "../public/styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Crear un objeto FormData
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // URL actualizada con la ruta correcta
      const response = await fetch("https://localhost:8000/usuarios/api/login/", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      // Verificar si la respuesta fue exitosa
      if (response.ok) {
        // Si hay redirección, navegamos a la página principal
        navigate("/");
      } else {
        // Intentar obtener el mensaje de error como JSON
        const data = await response.json();
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setError(error.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Usuario"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? "Procesando..." : "Ingresar"}
          </button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;