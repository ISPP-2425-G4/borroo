import { useState, useRef, useEffect } from "react";
import { FiHelpCircle } from "react-icons/fi";
import "../../public/styles/CancelPolicyTooltip.css";

const CancelPolicyTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const toggleTooltip = () => setShowTooltip(!showTooltip);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="tooltip-wrapper" ref={tooltipRef}>
      <FiHelpCircle className="help-icon" onClick={toggleTooltip} />
      {showTooltip && (
        <div className="tooltip-box">
          <h4>Políticas de Cancelación</h4>
          <p><strong>🔹 Flexible</strong><br />➜ 24h antes: reembolso total.<br />➜ Menos de 24h: 80% reembolso.<br />➜ Después del inicio: no hay reembolso.</p>
          <p><strong>🔹 Medio</strong><br />➜ 48h antes: reembolso total.<br />➜ Entre 24-48h: 50% reembolso.<br />➜ Menos de 24h: no hay reembolso.</p>
          <p><strong>🔹 Estricto</strong><br />➜ 7 días antes: 50% reembolso.<br />➜ Menos de 7 días: no hay reembolso.</p>
        </div>
      )}
    </div>
  );
};

export default CancelPolicyTooltip;
