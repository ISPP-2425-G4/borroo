import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "../public/styles/Subscription.css";

const SubscriptionScreen = () => {
  const [currentPlan, setCurrentPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); 
  const token = localStorage.getItem("access_token"); 

  const planLabels = {
    free: "Gratis",
    premium: "Premium",
  };

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.pricing_plan); // 'free' o 'premium'
    }
  }, [user, token]);

  const handlePlanChange = async (targetPlan) => {
    if (!user || currentPlan === targetPlan) return;

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${user.id}/${targetPlan === 'premium' ? 'upgrade_to_premium' : 'downgrade_to_free'}/`;

      await axios.post(url, null, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = { ...user, pricing_plan: targetPlan };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentPlan(targetPlan);
      alert(`¡Plan actualizado a ${planLabels[targetPlan]}!`);
    } catch (err) {
      console.error("Error al cambiar el plan:", err);
      alert("Hubo un error al cambiar el plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rental-container">
      <Navbar />
      <div className="rental-box">
        <h2>Gestión de Suscripción</h2>

        <div className="plan-options">
          {/* Plan Free */}
          <div className={`plan-card ${currentPlan === 'free' ? 'active' : ''}`}>
            <h3>Plan</h3>
            <h3>Gratis</h3>
            <p className="plan-price">0 € / mes</p>
            <ul>
              <li>✅ Límite de 10 productos activos</li>
              <li>✅ Hasta 15 borradores</li>
              <li>✅ Incluye anuncios</li>
              <li>🚫 Sin productos destacados</li>
            </ul>
            {/* Mostrar el botón solo si hay token */}
            {token && currentPlan !== 'free' && (
              <button
                onClick={() => handlePlanChange('free')}
                disabled={loading}
              >
                Cambiar a Gratis
              </button>
            )}
          </div>

          {/* Plan Premium */}
          <div className={`plan-card ${currentPlan === 'premium' ? 'active' : ''}`}>
            <h3>Plan</h3>
            <h3>Premium</h3>
            <p className="plan-price">5 € / mes</p>
            <ul>
              <li>⭐ Productos destacados</li>
              <li>🚫 Sin anuncios</li>
              <li>🔓 Sin límite de productos activos</li>
              <li>🔓 Sin límite de borradores</li>
            </ul>
            {/* Mostrar el botón solo si hay token */}
            {token && currentPlan !== 'premium' && (
              <button
                onClick={() => handlePlanChange('premium')}
                disabled={loading}
              >
                Mejorar a Premium
              </button>
            )}
          </div>
        </div>

        {loading && <p>Cambiando de plan...</p>}
      </div>
    </div>
  );
};

export default SubscriptionScreen;
