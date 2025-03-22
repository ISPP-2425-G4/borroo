import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { Box, Button, Card, CardContent, CardMedia, Typography, Skeleton } from "@mui/material";
import Modal from "./Modal";
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = "../public/default_image.png";

const RentRequestBoard = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseType, setResponseType] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true); // Estado de carga de las solicitudes
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.id) {
                    alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                    navigate("/login");
                    return;
                }
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/rentas/full/rental_requests/`,
                    { params: { user: user.id } }
                );


                const data = response.data;
                const rentas = data.results ?? data; // Si `results` no existe, usa `data` directamente
                
                // De momento hacemos peticiones de los usuarios y objetos, pero es muy ineficiente
                // y se puede mejorar con una sola petición al backend bien serializado
                const rentasEnriquecidas = await Promise.all(
                    rentas.map(async (renta) => {
                        const [usuarioResponse, itemResponse] = await Promise.all([
                            axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${renta.renter}/`),
                            axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/${renta.item}/`)
                        ]);
        
                        const usuario = usuarioResponse.data;
                        const item = itemResponse.data;
                        const imageUrl = item.images?.length > 0
                            ? await obtenerImagen(item.images[0])
                            : DEFAULT_IMAGE;
        
                        return { 
                            ...renta, 
                            renter: usuario,
                            item: item,
                            imageUrl
                        };
                    })
                );
        
                setRequests(rentasEnriquecidas);
                setLoading(false); // Datos cargados
            } catch (error) {
                console.error("Error al obtener solicitudes de alquiler:", error);
            }
        };

        fetchRequests();
    }, []);

    const obtenerImagen = async (imgId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
            );
            return response.data.image;
        } catch (error) {
            console.error(`Error al cargar la imagen ${imgId}:`, error);
            return DEFAULT_IMAGE;
        }
    };

    const handleResponse = async (renta, responseType) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) {
                alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                return;
            }
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/rentas/full/${renta.id}/respond_request/`,
                {
                    response: responseType,
                    rent: renta.id
                }
            );
            console.log(response.data);

            // Filtrar la solicitud aceptada/rechazada de la lista
            setRequests((prevRequests) =>
                prevRequests.filter((request) => request.id !== renta.id)
            );
            setOpenModal(false);
        } catch (error) {
            console.error(`Error al procesar la solicitud:`, error.response?.data || error.message);
        }
    };

    const openConfirmModal = (renta, responseType) => {
        setSelectedRequest(renta);
        setResponseType(responseType);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 10, p: 2 }}>
            <Navbar />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Solicitudes de Alquiler
            </Typography>

            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 2,
                        width: "100%", // Aseguramos que el contenedor ocupe el 100% del ancho
                        maxWidth: "800px",
                        maxHeight: "75vh",
                        overflowY: "auto",
                        overflowX: "hidden", // Evitamos el desbordamiento horizontal
                    }}
                >
                    {[...Array(5)].map((_, index) => (
                        <Card
                            key={index}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                boxShadow: 3,
                                p: 2,
                                width: "100%", 
                                maxWidth: "750px",
                                minHeight: "150px",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <Skeleton variant="rectangular" width={150} height={150} sx={{ mr: 2 }} />
                            <CardContent sx={{ flex: 1 }}>
                                <Skeleton width="60%" height={25} sx={{ mb: 1 }} />
                                <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                                <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                                <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                                <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                                    <Skeleton width={80} height={47} />
                                    <Skeleton width={90} height={47} />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : requests.length === 0 ? (
                <Typography>No hay solicitudes de alquiler disponibles.</Typography>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 2,
                        width: "100%",
                        maxWidth: "800px",
                        maxHeight: "75vh",
                        overflowY: "auto",
                        overflowX: "hidden", // Aseguramos que no haya desbordamiento horizontal
                    }}
                >
                    {requests.map((request) => (
                        <Card
                            key={request.id}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                boxShadow: 3,
                                p: 2,
                                width: "100%",
                                maxWidth: "750px",
                                minHeight: "150px",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    width: 150,
                                    height: 150,
                                    objectFit: "cover",
                                    borderRadius: "2px",
                                    mr: 2,
                                    boxShadow: 1,
                                }}
                                image={request.imageUrl}
                                alt={request.title}
                            />
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                                    <a 
                                        href={`show-item/${request.item.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        {request.item.title}
                                    </a>
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                    Solicitado por:{" "}
                                    <a 
                                        href={`/perfil/${request.renter.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ 
                                            textDecoration: "none",
                                            color: "#1976d2",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {request.renter.name} {request.renter.surname}
                                    </a>
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Inicio: {new Date(request.start_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Fin: {new Date(request.end_date).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => openConfirmModal(request, "accepted")}
                                    >
                                        Aceptar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => openConfirmModal(request, "rejected")}
                                    >
                                        Rechazar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {openModal && (
                <Modal
                    title={`Confirmar solicitud`}
                    message={`¿Estás seguro de que quieres ${responseType === "accepted" ? "aceptar" : "rechazar"} esta solicitud?`}
                    onCancel={closeModal}
                    onConfirm={() => handleResponse(selectedRequest, responseType)}
                />
            )}
        </Box>
    );
};

export default RentRequestBoard;