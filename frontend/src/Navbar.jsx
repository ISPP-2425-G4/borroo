import { useState, useEffect } from "react";
import { FiUser, FiHeart, FiShoppingCart, FiMenu } from "react-icons/fi";
import { Link, useNavigate  } from "react-router-dom";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import axios from 'axios';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loginAnchorEl, setLoginAnchorEl] = useState(null);
  const navigate = useNavigate();
  const handleLoginClick = (event) => {
    setLoginAnchorEl(event.currentTarget);
  };

  const handleLoginClose = () => {
    setLoginAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Opcional: llamar al backend para cerrar la sesión del lado del servidor
      await axios.post(
        "/api/logout",
        { user_id: user?.id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Eliminar la información del usuario del localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      console.log("Usuario ha cerrado sesión"); // Imprimir en consola al cerrar sesión
      
      // Redirigir a la página principal
      navigate('/');
    }
  };
  // Obtener información del usuario al cargar el componente
  useEffect(() => {
    // Verificar si hay información de usuario en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("Usuario autenticado:", parsedUser); // Imprimir en consola si hay usuario
    } else {
      console.log("No hay usuario autenticado"); // Imprimir en consola si no hay usuario
    }
  }, []);

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "#2563eb",
        color: "white",
        p: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        width: "100%",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1100,
        height: "60px",
      }}
    >
      {/* Logo */}
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{
          textDecoration: "none",
          color: "white",
          fontWeight: "bold",
        }}
      >
        BORROO
      </Typography>

      {/* Enlaces de navegación (visible en pantallas medianas y mayores) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          ml:14
        }}
      >
        <Typography
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "white",
            "&:hover": { color: "#fbbf24" },
          }}
        >
          Inicio
        </Typography>
        <Typography
          component={Link}
          to="/create-item"
          sx={{
            textDecoration: "none",
            color: "white",
            "&:hover": { color: "#fbbf24" },
          }}
        >
          Poner en alquiler
        </Typography>
        <Typography
          component={Link}
          to="/pricing-plan"
          sx={{
            textDecoration: "none",
            color: "white",
            "&:hover": { color: "#fbbf24" },
          }}
        >
          Plan de suscripción
        </Typography>
      </Box>

      {/* Iconos de acciones */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong>Hola, {user.name}</strong>
        {user.pricing_plan === 'premium' && (
          <img 
            src="../public/premium.png" 
            alt="Premium" 
            style={{ width: '24px', height: '24px' }} 
          />
        )}
      </div>
    ) : (
      <strong></strong>
)}
        {/* Icono de usuario con menú */}
        <IconButton onClick={handleLoginClick} sx={{ color: "white" }}>
          <FiUser size={24} />
        </IconButton>
        <Menu
          anchorEl={loginAnchorEl}
          open={Boolean(loginAnchorEl)}
          onClose={handleLoginClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
         {user ? (
            <MenuItem onClick={handleLogout}>
              Cerrar sesión
            </MenuItem>
          ) : (
            <>
              <MenuItem onClick={handleLoginClose} component={Link} to="/login">
                Iniciar sesión
              </MenuItem>
              <MenuItem onClick={handleLoginClose} component={Link} to="/signup">
                Registrarse
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Otros iconos */}
        <IconButton sx={{ color: "white" }}>
          <FiHeart size={24} />
        </IconButton>
        <IconButton sx={{ color: "white" }}>
          <FiShoppingCart size={24} />
        </IconButton>

        {/* Menú hamburguesa (visible en pantallas pequeñas) */}
        <IconButton
          onClick={() => setMenuOpen(!menuOpen)}
          sx={{ color: "white", display: { md: "none" } }}
        >
          <FiMenu size={24} />
        </IconButton>
      </Box>

      {/* Menú de navegación para pantallas pequeñas */}
      {menuOpen && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#2563eb",
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "white",
              mb: 1,
              "&:hover": { color: "#fbbf24" },
            }}
          >
            Inicio
          </Typography>
          <Typography
            component={Link}
            to="/create-item"
            sx={{
              textDecoration: "none",
              color: "white",
              "&:hover": { color: "#fbbf24" },
            }}
          >
            Poner en alquiler
          </Typography>
          <Typography
          component={Link}
          to="/pricing-plan"
          sx={{
            textDecoration: "none",
            color: "white",
            "&:hover": { color: "#fbbf24" },
          }}
        >
          Plan de suscripción
        </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;