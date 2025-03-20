import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { Box, Button,Card, CardContent, CardMedia, Typography } from "@mui/material";

const DEFAULT_IMAGE = "../public/default_image.png";

const RentRequestBoard = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.id) {
                    alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                    return;
                }
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/rentas/full/rental_requests/`,
                    { params: { user: user.id } }
                );
                console.log("Datos recibidos del backend:", response.data);

                const data = response.data;
                const rentas = data.results ?? data; // Si `results` no existe, usa `data` directamente

                // Obtener las imágenes asociadas a cada renta
                const rentasConImagen = await Promise.all(
                    rentas.map(async (renta) => {
                        const imageUrl =
                            renta.item?.images?.length > 0
                                ? await obtenerImagen(renta.item.images[0])
                                : DEFAULT_IMAGE;
                        return { ...renta, imageUrl };
                    })
                );
                setRequests(rentasConImagen);
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
        } catch (error) {
            console.error(`Error al procesar la solicitud:`, error.response?.data || error.message);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 10, p: 2 }}>
            <Navbar />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Solicitudes de Alquiler
            </Typography>

            {requests.length === 0 ? (
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
                        "&::-webkit-scrollbar": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#aaa",
                            borderRadius: "4px",
                        },
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
                                }}
                                image={request.imageUrl}
                                alt={request.title}
                            />
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6">{request.title}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Solicitado por: {request.renter?.username}
                                </Typography>
                                <Typography variant="body2">
                                    Inicio: {new Date(request.start_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                    Fin: {new Date(request.end_date).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleResponse(request, "accepted")}
                                    >
                                        Aceptar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleResponse(request, "rejected")}
                                    >
                                        Rechazar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default RentRequestBoard;