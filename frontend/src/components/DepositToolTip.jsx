import { useState, useRef, useEffect } from "react";
import { FiHelpCircle } from "react-icons/fi";
import "../../public/styles/CancelPolicyTooltip.css";

const DepositToolTip = () => {
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
          <h4>Política de Fianza</h4>
          <p><strong>🔹 El cliente no paga ningún depósito por adelantado, solo paga si causa algún daño durante su uso.</strong></p>
          <p><strong>🔹  Solo puedes pedir a tus clientes que paguen el valor del daño causado, hasta el importe máximo</strong></p>
          <p><strong>🔹 Más información </strong><a href="/deposit" target="_blank" rel="noopener noreferrer">aquí</a></p>
        </div>
      )}
    </div>
  );
};

export default DepositToolTip;
