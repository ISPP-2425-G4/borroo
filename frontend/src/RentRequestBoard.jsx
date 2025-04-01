import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Navbar from "./Navbar";
import { Box, Button, Card, CardContent, Typography, Skeleton, Tab, Tabs } from "@mui/material";
import Modal from "./Modal";
import { useNavigate } from 'react-router-dom';
import RequestCardsContainer from "./components/RequestCardsContainer";

const DEFAULT_IMAGE = "../public/default_image.png";

const RentRequestBoard = () => {
    const [receivedRequests, setReceivedRequests] = useState([]); // Solicitudes recibidas
    const [sentRequests, setSentRequests] = useState([]); // Solicitudes enviadas
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseType, setResponseType] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0); // Estado para controlar la pestaña seleccionada
    const navigate = useNavigate();

    useEffect(() => {
        const enrichRequests = async (requests) => {
            return Promise.all(
                requests.map(async (request) => {
                    const [userResponse, itemResponse] = await Promise.all([
                        axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${request.renter}/`),
                        axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/full/${request.item}/`)
                    ]);
    
                    const user = userResponse.data;
                    const item = itemResponse.data;
                    const imageUrl = item.images?.length > 0 ? await obtenerImagen(item.images[0]) : DEFAULT_IMAGE;
    
                    return { ...request, renter: user, item: item, imageUrl };
                })
            );
        };

        const fetchRequests = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const urlParams = new URLSearchParams(window.location.search);
                const queryUserId = urlParams.get("user");

                if (!user || !user.id) {
                    alert("No se encontró el usuario. Asegúrate de haber iniciado sesión.");
                    navigate("/login");
                    return;
                }
                // Validación de acceso a su propio tablón
                if (queryUserId && parseInt(queryUserId) !== user.id) {
                    alert("No tienes permiso para ver este tablón.");
                    navigate("/login"); 
                    return;
                }

                // Peticiones para obtener solicitudes recibidas y enviadas
                const [receivedResponse, sentResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/rentas/full/rental_requests/`, { params: { user: user.id } }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/rentas/full/my_requests/`, { params: { user: user.id } })
                ]);

                // Procesamos las solicitudes recibidas
                const receivedData = receivedResponse.data.results ?? receivedResponse.data;
                const receivedEnriched = await enrichRequests(receivedData);
                setReceivedRequests(receivedEnriched);

                // Procesamos las solicitudes enviadas
                const sentData = sentResponse.data.results ?? sentResponse.data;
                const sentEnriched = await enrichRequests(sentData);
                setSentRequests(sentEnriched);

                setLoading(false);
            } catch (error) {
                console.error("Error al obtener solicitudes de alquiler:", error);
            }
        };

        fetchRequests();
    }, [navigate]);

    const obtenerImagen = async (imgId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`);
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
                    rent: renta.id,
                    user_id: user.id
                }
            );
            console.log(response.data);
    
            
            setReceivedRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === renta.id
                        ? { ...request, rent_status: responseType, payment_status: "pending" }
                        : request
                )
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

    const closeModal = () => setOpenModal(false);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };


    const RequestActions = ({ request, openConfirmModal }) => {
        return (
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                {request.rent_status === "requested" && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => openConfirmModal(request, "accepted")}
                    >
                        Aceptar
                    </Button>
                )}
                {request.rent_status === "requested" && (
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => openConfirmModal(request, "rejected")}
                    >
                        Rechazar
                    </Button>
                )}
            </Box>
        );
    };

    RequestActions.propTypes = {
        request: PropTypes.shape({
            rent_status: PropTypes.string.isRequired,
        }).isRequired,
        openConfirmModal: PropTypes.func.isRequired,
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 10, p: 2 }}>
            <Navbar />

            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Solicitudes de Alquiler
            </Typography>

            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="Solicitudes Tab" sx={{ mb: 3 }}>
                <Tab label="Solicitudes Recibidas" />
                <Tab label="Solicitudes Enviadas" />
            </Tabs>

            {loading ? (
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
                        overflowX: "hidden",
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
            ) : (
                <>
                    {selectedTab === 0 && (
                        <>
                            {receivedRequests.length === 0 ? (
                                <Typography>No has recibido solicitudes de alquiler.</Typography>
                            ) : (
                                <RequestCardsContainer requests={receivedRequests} openConfirmModal={openConfirmModal} isOwner={true}/>
                            )}
                        </>
                    )}

                    {selectedTab === 1 && (
                        <>
                            {sentRequests.length === 0 ? (
                                <Typography>No has enviado solicitudes de alquiler.</Typography>
                            ) : (
                                <RequestCardsContainer requests={sentRequests} isOwner={false} />
                            )}
                        </>
                    )}
                </>
            )}

            {openModal && (
                <Modal
                    title="Confirmar solicitud"
                    message={`¿Estás seguro de que quieres ${responseType === "accepted" ? "aceptar" : "rechazar"} esta solicitud?`}
                    onCancel={closeModal}
                    onConfirm={() => handleResponse(selectedRequest, responseType)}
                />
            )}
        </Box>
    );
};

export default RentRequestBoard;
