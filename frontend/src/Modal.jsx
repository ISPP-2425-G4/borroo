import PropTypes from 'prop-types';
import "../public/styles/Modal.css";

const Modal = ({ title, message, onCancel, onConfirm }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="modal-btn cancel-btn" onClick={onCancel}>Cancelar</button>
            <button className="modal-btn confirm-btn" onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    );
  };

  Modal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };
  
  export default Modal;