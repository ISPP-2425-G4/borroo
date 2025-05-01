import PropTypes from 'prop-types';
import "../../public/styles/Modal.css";

const SuccessModal = ({ title, message, primaryLabel, onPrimaryAction, secondaryLabel, onSecondaryAction }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          {secondaryLabel && onSecondaryAction && (
            <button className="modal-btn secondary-btn" onClick={onSecondaryAction}>
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && onPrimaryAction && (
            <button className="modal-btn primary-btn" onClick={onPrimaryAction}>
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

SuccessModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  primaryLabel: PropTypes.string,
  onPrimaryAction: PropTypes.func,
  secondaryLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,
};

export default SuccessModal;
