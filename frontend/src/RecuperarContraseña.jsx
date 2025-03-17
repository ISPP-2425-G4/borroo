import Navbar from "./Navbar";
import { useState } from "react";
import "../public/styles/RecuperarContraseña.css";
import { FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../public/styles/Login.css";
import { Box } from "@mui/material";

const RecuperarContraseña = () => {
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
          {password },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // Equivalente a `credentials: "include"` en fetch
          }
        );
  
        if (response.status === 200) {
          navigate("/");
        } else {
          const data = response.data;
          throw new Error(data.error || "Error al iniciar sesión");
        }
      } catch (error) {
        // Manejar el error 404 (usuario no encontrado o credenciales incorrectas)
        if (error.response && error.response.status === 404) {
          setError("El correo no está registrado.");
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
      <div className="recover-container">
      <div className="login-box">
        <h2>Ingrese su nueva contraseña</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
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
            {loading ? "Procesando..." : "Restablecer contraseña"}
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

export default RecuperarContraseña;