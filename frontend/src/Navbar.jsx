import { useState } from "react";
import {  FiUser, FiHeart, FiShoppingCart, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import "../public/styles/Navbar.css"; 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo">BORROO</Link>
        
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/create-item" className="nav-link">Poner en alquiler</Link>
      </nav>

        <div className="nav-icons">
          <div className="relative login1-container">
            <button className="login1-btn">
              <FiUser size={24} className="nav-icon" />
            </button>
            <div className="login1-menu">
              <Link to="/login" className="nav-link">Inicio sesión</Link> 
              <Link to="/signup" className="nav-link">Registrarse</Link> 
            </div>
          </div>
          
          <FiHeart size={24} className="nav-icon" />
          <FiShoppingCart size={24} className="nav-icon" />
          
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu size={24} />
          </button>
        </div>
      </div>
            
    </header>
  );
};


export default Navbar;
