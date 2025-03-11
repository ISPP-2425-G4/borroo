import { useState } from "react";
import { FiUser, FiHeart, FiShoppingCart, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginAnchorEl, setLoginAnchorEl] = useState(null);

  const handleLoginClick = (event) => {
    setLoginAnchorEl(event.currentTarget);
  };

  const handleLoginClose = () => {
    setLoginAnchorEl(null);
  };

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
        height: "40px",
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
          display: { xs: "none", md: "flex" },
          gap: 2,
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
      </Box>

      {/* Iconos de acciones */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <MenuItem onClick={handleLoginClose} component={Link} to="/login">
            Iniciar sesión
          </MenuItem>
          <MenuItem onClick={handleLoginClose} component={Link} to="/signup">
            Registrarse
          </MenuItem>
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
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
