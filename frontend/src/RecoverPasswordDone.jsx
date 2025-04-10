import Navbar from "./Navbar";
import "../public/styles/RecuperarContraseña.css";
import "../public/styles/Login.css";
import { Box } from "@mui/material";

const RecuperarContraseñaComplete = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar />
      <div className="recover-container">
      <h1>¡Listo!</h1>
        <p>Si el correo electrónico ingresado está asociado con una cuenta, recibirás un mensaje con un enlace para restablecer tu contraseña.</p>
        <p>Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam o intenta de nuevo.</p>
      </div>
    </Box>
  );
};

export default RecuperarContraseñaComplete;

