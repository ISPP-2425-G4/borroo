import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import { Box, Typography, List, ListItem, ListItemText, Paper, TextField, Button, Divider, Avatar } from "@mui/material";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState(null);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.id) {
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
                    { id: 1, participants: [1, 2], created_at: "2025-04-04T10:00:00Z", otherUserName: "JuanPérez_04" },
                    { id: 2, participants: [1, 3], created_at: "2025-04-03T12:30:00Z", otherUserName: "MaríaLpz" },
                    { id: 3, participants: [1, 4], created_at: "2025-04-02T15:15:00Z", otherUserName: "CarlosRod" }
                ];
                setConversations(fakeConversations);
            } catch (error) {
                console.error("Error al obtener conversaciones:", error);
            }
        };

        fetchConversations();
    }, [navigate]);

    const fetchMessages = async (conversation) => {
        try {
            /*
            setSelectedConversation(conversationId);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/conversations/${conversationId}/menssages/`);
            setMessages(response.data);
            */
            setSelectedConversation(conversation);
            const otherUserId = conversation.participants.find(id => id !== currentUser.id);

            // Obtener datos del otro usuario
            const userResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${otherUserId}/`);
            setOtherUser(userResponse.data);

            // Datos de prueba
            const fakeMessages = {
                1: [
                    { id: 1, conversation: 1, sender: 1, content: "Hola, ¿cómo estás?", timestamp: "2025-04-04T10:05:00Z", is_read: true },
                    { id: 2, conversation: 1, sender: 2, content: "Todo bien, ¿y tú?", timestamp: "2025-04-04T10:06:30Z", is_read: true }
                ],
                2: [
                    { id: 3, conversation: 2, sender: 1, content: "¿Tienes disponible el objeto?", timestamp: "2025-04-03T12:35:00Z", is_read: true },
                    { id: 4, conversation: 2, sender: 3, content: "Sí, lo puedes recoger mañana.", timestamp: "2025-04-03T12:40:00Z", is_read: false }
                ],
                3: [
                    { id: 5, conversation: 3, sender: 1, content: "Gracias por el alquiler.", timestamp: "2025-04-02T15:20:00Z", is_read: true },
                    { id: 6, conversation: 3, sender: 4, content: "De nada, cualquier cosa me avisas.", timestamp: "2025-04-02T15:22:00Z", is_read: false }
                ]
            };
            setMessages(fakeMessages[conversation.id] || []);
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
                conversation: selectedConversation.id,
                sender: currentUser.id,
                content: newMessage,
                timestamp: new Date().toISOString(),
                is_read: false
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
                                    selected={selectedConversation?.id === conv.id}
                                    onClick={() => fetchMessages(conv)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: selectedConversation?.id === conv.id ? "primary.light" : "transparent",
                                        "&:hover": { bgcolor: "primary.light" }
                                    }}
                                >
                                    <ListItemText primary={`${conv.otherUserName}`} />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Chat */}
                <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 3, borderRadius: 3, boxShadow: 3 }}>
                    {selectedConversation ? (
                        <>
                            {/* Encabezado del chat con el otro usuario */}
                            {otherUser && (
                                <Box 
                                    sx={{ display: "flex", alignItems: "center", mb: 2, padding: 2, bgcolor: "white", borderRadius: 2, boxShadow: 2,  cursor: "pointer" }}
                                    onClick={() => navigate(`/perfil/${otherUser.username}`)}
                                >
                                    <Avatar src={otherUser.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                                        <Typography variant="h6">
                                                {otherUser.username}
                                        </Typography>
                                </Box>
                            )}

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
                                            alignSelf: msg.sender === currentUser.id ? "flex-end" : "flex-start",
                                            mb: 1,
                                            maxWidth: "70%"
                                        }}
                                    >
                                        <Paper sx={{ 
                                            padding: 1.5, 
                                            borderRadius: 3, 
                                            bgcolor: msg.sender === currentUser.id ? "primary.main" : "grey.300", 
                                            color: msg.sender === currentUser.id ? "white" : "black" 
                                        }}>
                                            <Typography variant="body2">{msg.content}</Typography>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: "block", 
                                                    textAlign: "right",
                                                    mt: 0.5,
                                                    color: msg.sender === currentUser.id ? "rgba(255, 255, 255, 0.69)" : "gray" }}>
                                                {new Date(msg.timestamp).toLocaleString()} {msg.is_read ? "✔✔" : "✔"}
                                            </Typography>
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
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
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