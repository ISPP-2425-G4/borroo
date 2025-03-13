import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import "../public/styles/Login.css";
import axios from 'axios';
import Navbar from "./Navbar";
import { Box } from "@mui/material";

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
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/login/`,
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Equivalente a `credentials: "include"` en fetch
        }
      );

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        const data = response.data;
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      // Manejar el error 404 (usuario no encontrado o credenciales incorrectas)
      if (error.response && error.response.status === 404) {
        setError("El usuario no existe o los datos son incorrectos.");
      } else {
        // Manejar otros errores
        setError(error.message || "Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Navbar />
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Procesando..." : "Ingresar"}
          </button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
        </p>
      </div>
    </div>
    </Box>
  );
};

export default Login;