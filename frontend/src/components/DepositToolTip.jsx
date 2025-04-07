import { useState, useRef, useEffect } from "react";
import { FiHelpCircle } from "react-icons/fi";
import "../../public/styles/CancelPolicyTooltip.css";

const tooltipContent = [
  "🔹 El cliente no paga ningún depósito por adelantado, solo paga si causa algún daño durante su uso.",
  "🔹 Solo puedes pedir a tus clientes que paguen el valor del daño causado, hasta el importe máximo",
];

const DepositToolTip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="tooltip-wrapper" ref={tooltipRef}>
      <FiHelpCircle className="help-icon" onClick={() => setShowTooltip(prev => !prev)} />
      {showTooltip && (
        <div className="tooltip-box">
          <h4>Política de Fianza</h4>
          {tooltipContent.map((text, index) => (
            <p key={index}><strong>{text}</strong></p>
          ))}
          <p>
            <strong>🔹 Más información </strong>
            <a href="/deposit" target="_blank" rel="noopener noreferrer">aquí</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default DepositToolTip;
