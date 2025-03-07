import { useState, useEffect } from "react";
import { FiSearch, FiUser, FiHeart, FiShoppingCart, FiMenu, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../public/styles/Navbar.css"; 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      // Opcional: llamar al backend para cerrar la sesión del lado del servidor
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Podrías enviar el ID del usuario si es necesario
        body: JSON.stringify({ user_id: user?.id })
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Eliminar la información del usuario del localStorage
      localStorage.removeItem('user');
      setUser(null);
      setDropdownOpen(false);
      console.log("Usuario ha cerrado sesión"); // Imprimir en consola al cerrar sesión
      
      // Redirigir a la página principal
      navigate('/');
    }
  };

  return (
    <header className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="logo">BORROO</Link>
        
        {/* Search Bar & Filters */}
        <div className="search-filters">
        <div className="search-container">
          <input type="text" placeholder="Buscar..." className="search" />
          <button className="search-btn">
            <FiSearch size={20} />
          </button>
        </div>

          {/* Filtros */}
          <div className="filters">
            {/* Precio (Rango numérico) */}
            <div className="filter price-filter">
              <label>Precio:</label>
              <div className="price-inputs">
                <input type="number" placeholder="Min" min="0" className="price-input" />
                <span> - </span>
                <input type="number" placeholder="Max" min="0" className="price-input" />
              </div>
            </div>

            {/* Categoría */}
            <div className="filter">
              <label>Categoría:</label>
              <select>
                <option>💻 Tecnología</option>
                <option>⚽ Deporte</option>
                <option>🛠️ Bricolaje</option>
                <option>👕 Ropa</option>
                <option>📦 Mobiliario y Logística</option>
                <option>🎮 Entretenimiento</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="nav-icons">
          {/* Usuario: Condicional basado en si hay usuario o no */}
          <div className="relative login1-container">
            <button 
              className="login1-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FiUser size={24} className="nav-icon" />
              {user && <span className="username-display">{user.username}</span>}
            </button>
            
            {/* Menú desplegable que cambia según si hay usuario o no */}
            <div className={`login1-menu ${dropdownOpen ? 'visible' : ''}`}>
              {user ? (
                <>
                  <div className="user-info">
                    <strong>Hola, {user.name}</strong>
                    <p>{user.email}</p>
                    {user.is_verified && (
                      <span className="verified-badge">✓ Verificado</span>
                    )}
                    <p className="plan-badge">Plan: {user.pricing_plan}</p>
                  </div>
                  <Link to="/profile" className="nav-link">Mi Perfil</Link> 
                  <Link to="/my-rentals" className="nav-link">Mis Alquileres</Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut size={16} />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Inicio sesión</Link> 
                  <Link to="/signup" className="nav-link">Registrarse</Link> 
                </>
              )}
            </div>
          </div>
          
          <FiHeart size={24} className="nav-icon" />
          <FiShoppingCart size={24} className="nav-icon" />
          
          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu size={24} />
          </button>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/create-item" className="nav-link">Poner en alquiler</Link>
      </nav>
    </header>
  );
};


export default Navbar;
