import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram} from "react-icons/fa";
import "../../public/styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Enlaces principales */}
        <div className="footer-section">
          <h3>Enlaces</h3>
          <ul>
            <li><Link to="/">Landing Page</Link></li>
            <li><a href="https://github.com/ISPP-2425-G4/borroo" target="_blank" rel="noopener noreferrer">Repositorio en GitHub</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="footer-section">
          <h3>Contacto</h3>
          <p>Email: borroohelp@gmail.com</p>
        </div>

        {/* Redes Sociales */}
        <div className="footer-section">
          <h3>Redes Sociales</h3>
          <div className="social-links">
            <a href="https://facebook.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
        
      </div>

      {/* Footer Inferior */}
      <div className="footer-bottom">
        <p>&copy; 2025 Borroo. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
