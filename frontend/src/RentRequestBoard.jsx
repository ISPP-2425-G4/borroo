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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Navbar />
            {requests.length === 0 ? (
                <p>No hay solicitudes de alquiler disponibles.</p>
            ) : (
                <Box>
                    {requests.map((request) => (
                        <Box
                        key={request.id} xs={12} sm={6} md={4} lg={3} sx={{ mt: 2 }}>
                        <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={request.imageUrl}
                                    alt={request.title}
                                    sx={{ objectFit: "cover" }}
                                />
                                <CardContent>
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
                                            onClick={() => handleResponse(request, "accepted")}
                                        >
                                            Aceptar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleResponse(request, "rejected")}
                                        >
                                            Rechazar
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default RentRequestBoard;