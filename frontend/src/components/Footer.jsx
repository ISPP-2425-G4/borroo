import "../../public/styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 Borroo. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/about">Sobre nosotros</a>
          <a href="/contact">Contacto</a>
          <a href="/privacy">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
