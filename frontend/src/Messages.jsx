import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Box, Typography, List, ListItem, ListItemText, Paper, TextField, Button, Divider } from "@mui/material";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.id) {
                    alert("Debes iniciar sesión.");
                    navigate("/login");
                    return;
                }
                /*
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/mensajes/conversaciones/`, {
                    params: { user: user.id }
                });
                setConversations(response.data);
                */

                // Datos de prueba
                const fakeConversations = [
                    { id: 1, otherUserName: "Juan Pérez" },
                    { id: 2, otherUserName: "María López" },
                    { id: 3, otherUserName: "Carlos Rodríguez" },
                    { id: 4, otherUserName: "Juan Pérez" },
                    { id: 5, otherUserName: "María López" },
                    { id: 6, otherUserName: "Carlos Rodríguez" },
                    { id: 7, otherUserName: "Juan Pérez" },
                    { id: 8, otherUserName: "María López" },
                    { id: 9, otherUserName: "Carlos Rodríguez" },
                    { id: 10, otherUserName: "Juan Pérez" },
                    { id: 11, otherUserName: "María López" },
                    { id: 12, otherUserName: "Carlos Rodríguez" },
                    { id: 13, otherUserName: "Juan Pérez" },
                    { id: 14, otherUserName: "María López" },
                    { id: 15, otherUserName: "Carlos Rodríguez" },
                    { id: 16, otherUserName: "Juan Pérez" },
                    { id: 17, otherUserName: "María López" },
                    { id: 18, otherUserName: "Carlos Rodríguez" },
                    { id: 1, otherUserName: "Juan Pérez" },
                    { id: 2, otherUserName: "María López" },
                    { id: 3, otherUserName: "Carlos Rodríguez" },
                    { id: 4, otherUserName: "Juan Pérez" },
                    { id: 5, otherUserName: "María López" },
                    { id: 6, otherUserName: "Carlos Rodríguez" },
                    { id: 7, otherUserName: "Juan Pérez" },
                    { id: 8, otherUserName: "María López" },
                    { id: 9, otherUserName: "Carlos Rodríguez" },
                    { id: 10, otherUserName: "Juan Pérez" },
                    { id: 11, otherUserName: "María López" },
                    { id: 12, otherUserName: "Carlos Rodríguez" },
                    { id: 13, otherUserName: "Juan Pérez" },
                    { id: 14, otherUserName: "María López" },
                    { id: 15, otherUserName: "Carlos Rodríguez" },
                    { id: 16, otherUserName: "Juan Pérez" },
                    { id: 17, otherUserName: "María López" },
                    { id: 18, otherUserName: "Carlos Rodríguez" },
                ];
                setConversations(fakeConversations);
            } catch (error) {
                console.error("Error al obtener conversaciones:", error);
            }
        };

        fetchConversations();
    }, [navigate]);

    const fetchMessages = async (conversationId) => {
        try {
            /*
            setSelectedConversation(conversationId);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/mensajes/${conversationId}/`);
            setMessages(response.data);
            */
            setSelectedConversation(conversationId);

            const fakeMessages = {
                1: [
                    { id: 1, sender_id: 1, text: "Hola, ¿cómo estás?" },
                    { id: 2, sender_id: 2, text: "Todo bien, ¿y tú?" },
                ],
                2: [
                    { id: 3, sender_id: 1, text: "¿Tienes disponible el objeto?" },
                    { id: 4, sender_id: 2, text: "Sí, lo puedes recoger mañana." },
                ],
                3: [
                    { id: 5, sender_id: 1, text: "Gracias por el alquiler." },
                    { id: 6, sender_id: 2, text: "De nada, cualquier cosa me avisas." },
                ],
            };
    
            setMessages(fakeMessages[conversationId] || []);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            /*
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/mensajes/enviar/`, {
                conversation_id: selectedConversation,
                sender_id: user.id,
                text: newMessage,
            });
            

            setMessages([...messages, response.data]);
            */
            const newMsg = {
                id: messages.length + 1,
                sender_id: currentUser.id, // Simulación de usuario autenticado
                text: newMessage,
            };
    
            setMessages([...messages, newMsg]);
            setNewMessage("");
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", mt: 10, bgcolor: "#f5f5f5" }}>
            <Navbar />
            <Box sx={{ display: "flex", flexGrow: 1, padding: 2 }}>
                
                {/* Lista de conversaciones */}
                <Paper sx={{ 
                    width: 320, 
                    padding: 2, 
                    marginRight: 2,
                    maxHeight: "70vh", 
                    overflowY: "auto", 
                    borderRadius: 3, 
                    boxShadow: 3
                }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
                        Conversaciones
                    </Typography>
                    <List>
                        {conversations.length === 0 ? (
                            <Typography variant="body2" sx={{ textAlign: "center", color: "gray" }}>
                                No tienes conversaciones.
                            </Typography>
                        ) : (
                            conversations.map((conv) => (
                                <ListItem 
                                    key={conv.id} 
                                    button 
                                    selected={selectedConversation === conv.id}
                                    onClick={() => fetchMessages(conv.id)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: selectedConversation === conv.id ? "primary.light" : "transparent",
                                        "&:hover": { bgcolor: "primary.light" }
                                    }}
                                >
                                    <ListItemText primary={conv.otherUserName} />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Chat */}
                <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 3, borderRadius: 3, boxShadow: 3 }}>
                    {selectedConversation ? (
                        <>
                            {/* Mensajes */}
                            <Box sx={{ 
                                flexGrow: 1, 
                                overflowY: "auto", 
                                maxHeight: "60vh", 
                                padding: 2, 
                                borderRadius: 2, 
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                flexDirection: "column",
                            }}>
                                {messages.map((msg) => (
                                    <Box 
                                        key={msg.id} 
                                        sx={{
                                            alignSelf: msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                                            mb: 1,
                                            maxWidth: "70%"
                                        }}
                                    >
                                        <Paper sx={{ 
                                            padding: 1.5, 
                                            borderRadius: 3, 
                                            bgcolor: msg.sender_id === currentUser.id  ? "primary.main" : "grey.300", 
                                            color: msg.sender_id === currentUser.id ? "white" : "black" 
                                        }}>
                                            {msg.text}
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Input de mensaje */}
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    placeholder="Escribe un mensaje..." 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    sx={{ bgcolor: "white", borderRadius: 2 }}
                                />
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleSendMessage} 
                                    sx={{ ml: 2, borderRadius: 2 }}
                                >
                                    Enviar
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ 
                            flexGrow: 1, 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "center", 
                            alignItems: "center",
                            textAlign: "center"
                        }}>
                            <img src="/logo.png" alt="Logo" style={{ width: 120, marginBottom: 20 }} />
                            <Typography variant="h5" color="textSecondary" sx={{ fontWeight: "bold" }}>
                                Selecciona una conversación para ver los mensajes
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default Messages;