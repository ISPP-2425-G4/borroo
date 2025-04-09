import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const SendMessageButton = ({ userId }) => {
  const navigate = useNavigate();
  
  const handleSendMessage = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      let conversationId;

      try {
        // Intentar obtener la conversación existente
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/chats/get_chat_with/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Conversations data:", response.data);
        conversationId = response.data.id;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No existe una conversación previa, creando una nueva.");
          // Crear una nueva conversación
          const createResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/chats/`,
            { otherUserId: userId },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          conversationId = createResponse.data.id;
        } else {
          throw error; // Si el error no es 404, relanzarlo
        }
      }

      // Redirigir a la página de mensajes con la conversación seleccionada
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <Button onClick={handleSendMessage}>
      Enviar mensaje
    </Button>
  );
};

SendMessageButton.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default SendMessageButton;
