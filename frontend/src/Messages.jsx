import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import { Box, Typography, List, ListItem, ListItemText, Paper, TextField, Button, Divider, Avatar, Badge, Tooltip } from "@mui/material";
import { es } from "date-fns/locale";
import { format } from "date-fns";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const { conversationId } = useParams();
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState({ username: "Cargando..." });
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({});
    const accessToken = localStorage.getItem("access_token");
    const messageInputRef = useRef(null);

    // Focus en el input de mensaje al cargar la página
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedConversation) return; 
            if (document.activeElement !== messageInputRef.current) {
                event.preventDefault();
                messageInputRef.current?.focus();
    
                // Insertar la tecla en el input manualmente
                setTimeout(() => {
                    const input = messageInputRef.current;
                    if (input) {
                        input.value += event.key; // Agregar la tecla al input
                        const eventInput = new Event("input", { bubbles: true });
                        input.dispatchEvent(eventInput); // Disparar el evento input
                    }
                }, 0);
            }
        };
    
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedConversation]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (!user?.id) {
            navigate("/login");
            return;
        }
        setCurrentUser(user);
    }, [navigate]);

    
    const fetchMessages = useCallback(async (conversation) => {
        try {
            if (!conversation || !currentUser.id) return;
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/chats/${conversation.id}/messages/`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const otherUserId = conversation.user1 === currentUser.id ? conversation.user2 : conversation.user1;
            const userResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${otherUserId}/`);
            setOtherUser(userResponse.data);
            setMessages(response.data);

        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        }
    }, [accessToken, currentUser.id]); 

    const handleSelectConversation = useCallback((conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation);
    }, [fetchMessages]);
    
    useEffect(() => {
        const fetchSelectedChatMessages = async () => {
            try {
                if (!conversationId) return;
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/chats/${conversationId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                handleSelectConversation(response.data);
            } catch (error) {
                console.error("Error al cargar mensajes:", error);
            }
        };

        fetchSelectedChatMessages();
    }, [conversationId, accessToken, handleSelectConversation]); 

    useEffect(() => {
        if (!selectedConversation) return;
    
        const intervalId = setInterval(() => {
            fetchMessages(selectedConversation);
        }, 2000); // Actualiza cada 2 segundos los mensajes
    
        return () => clearInterval(intervalId);
    }, [selectedConversation, fetchMessages]); 

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chats/get_my_chats/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setConversations(response.data.sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)));
                
            } catch (error) {
                console.error("Error al obtener conversaciones:", error);
            }
        };

        fetchConversations();
        const intervalId = setInterval(() => {
            fetchConversations();
        }, 2000); // Actualiza cada 2 segundos

        return () => clearInterval(intervalId);
    }, [navigate, accessToken]);


    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/chats/${selectedConversation.id}/send_message/`,
                { content: newMessage },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            
            setMessages([...messages, response.data]);
            setNewMessage("");
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
    
        const now = new Date();
        const messageDate = new Date(timestamp);
        
        const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
        if (diffInDays === 0) {
            return format(messageDate, "HH:mm", { locale: es });
        } else if (diffInDays === 1) {
            return "Ayer";
        } else if (diffInDays === 2) {
            return "Antes de ayer";
        } else {
            return format(messageDate, "dd/MM/yyyy", { locale: es });
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", mt: 8, bgcolor: "#f5f5f5" }}>
            <Navbar />
            <Box sx={{ display: "flex", flexGrow: 1, padding: 2 }}>

                {/* Lista de conversaciones */}
                <Paper sx={{ 
                    width: 320, 
                    padding: 2, 
                    marginRight: 2,
                    maxHeight: "82vh", 
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
                            conversations
                            .filter((conv) => conv.lastMessage)
                            .map((conv) => (
                                <ListItem 
                                    key={conv.id} 
                                    button 
                                    selected={selectedConversation?.id === conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: selectedConversation?.id === conv.id ? "primary.light" : "transparent",
                                        "&:hover": { bgcolor: "primary.light", color: "white" }
                                    }}
                                >
                                    <Avatar sx={{ mr: 2 }}>{conv.otherUserName.charAt(0).toUpperCase()}</Avatar>
                                    <ListItemText 
                                        primary={conv.otherUserName} 
                                        secondary={
                                            <>
                                                <Tooltip title={conv.lastMessage} arrow>
                                                    <Typography variant="body2" sx={{ color: selectedConversation?.id === conv.id ? "white" : "gray", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {conv.lastMessage ? conv.lastMessage : "Sin mensajes"}
                                                    </Typography>
                                                </Tooltip>
                                                <Typography variant="caption" sx={{ color: selectedConversation?.id === conv.id ? "white" : "gray", fontWeight: "bold" }}>
                                                    {formatDate(conv.lastMessageTimestamp)}
                                                </Typography>
                                            </>
                                        }
                                    />
                                {conv.unreadCount > 0 && (
                                    <Badge badgeContent={conv.unreadCount} sx={{ "& .MuiBadge-badge": { backgroundColor: "rgb(255, 45, 45)", color: "white" } }} >
                                        <Typography sx={{ visibility: "hidden" }}></Typography>
                                    </Badge>
                                )}
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Chat */}
                <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 3, borderRadius: 3, boxShadow: 3, maxHeight: "80vh", }}>
                    {selectedConversation ? (
                        <>
                            {/* Encabezado del chat con el otro usuario */}
                            {otherUser && (
                                <Box 
                                    sx={{ display: "flex", alignItems: "center", mb: 2, padding: 2, bgcolor: "white", borderRadius: 2, boxShadow: 2,  cursor: "pointer" }}
                                    onClick={() => navigate(`/perfil/${otherUser.username}`)}
                                >
                                    <Avatar src={otherUser.image} sx={{ width: 40, height: 40, mr: 2 }} />
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
                                            color: msg.sender === currentUser.id ? "white" : "black", 
                                            wordWrap: "break-word", 
                                            whiteSpace: "normal"  
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
                                    inputRef={messageInputRef}
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