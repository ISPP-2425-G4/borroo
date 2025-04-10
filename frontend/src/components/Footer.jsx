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
            <li><Link to="https://sites.google.com/view/borroo?usp=sharing">Landing Page</Link></li>
            <li><a href="https://github.com/ISPP-2425-G4/borroo" target="_blank" rel="noopener noreferrer">Repositorio en GitHub</a></li>
            <li><Link to="/faq">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* Enlaces legales */}
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><a href="/privacy-policy">Política de Privacidad</a></li>
            <li><a href="/terms-and-conditions">Términos de Servicio</a></li>
            <li><a href="/sla">Acuerdo de Nivel de Servicio (SLA)</a></li>
            <li><a href="/licenses">Información de Licencias</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="footer-section">
          <h3>Contacto</h3>
          <p>Email: borroohelp@gmail.com</p>
        </div>
      </div>

      {/* Redes Sociales */}
        <div className="social-links">
          <a href="https://facebook.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
          <a href="https://x.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
          <a href="https://instagram.com/BorrooApp" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://linkedin.com/company/BorrooApp" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          <a href="https://youtube.com/c/BorrooApp" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
        </div>

      {/* Footer Inferior */}
      <div className="footer-bottom">
        <p>&copy; 2025 Borroo. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
