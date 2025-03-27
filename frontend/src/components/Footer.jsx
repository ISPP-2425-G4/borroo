import { Link } from "react-router-dom";
import { FaFacebook, FaXTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa6";
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
            <li><Link to="/faq">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* Enlaces legales */}
        <div className="footer-section">
          <h3>Enlaces Legales</h3>
          <ul>
            <li><a href="/politica-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a></li>
            <li><a href="/terminos-servicio" target="_blank" rel="noopener noreferrer">Términos de Servicio</a></li>
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
            <a href="https://x.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
            <a href="https://instagram.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com/company/BorrooApp" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://youtube.com/c/BorrooApp" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
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
