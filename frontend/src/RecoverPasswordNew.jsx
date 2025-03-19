import Navbar from "./Navbar";
import { useState } from "react";
import "../public/styles/RecuperarContraseña.css";
import { FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../public/styles/Login.css";
import { Box } from "@mui/material";

import { useSearchParams } from "react-router-dom";

const RecuperarContraseña = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
  
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/usuarios/password_reset_confirm/${token}/`, // Agregar el token a la URL
          { password },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // Para enviar cookies si es necesario
          }
        );
  
        if (response.status === 200) {
          navigate("/");
        } else {
          const data = response.data;
          throw new Error(data.error || "Error al iniciar sesión");
        }
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
      
          if (status === 404) {
            setError("El correo no está registrado.");
          } else if (status === 400) {
            setError(data?.error || "Solicitud incorrecta");
          } else {
            setError(data?.message || "Error al conectar con el servidor");
          }
        } else {
          setError("Error al conectar con el servidor");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }

    }
  
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