import { Link } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import "../public/styles/Login.css";

const Login = () => {
  return (
    <div className="login-container">
        
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <form>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input type="text" placeholder="Usuario" required />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input type="password" placeholder="Contraseña" required />
          </div>
          <button type="submit" className="login-btn">Ingresar</button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;