import { Box, Button, Card, CardContent, CardMedia, Typography, Tooltip, CardActions, Chip, Alert, Snackbar } from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";


const RequestCardsContainer = ({ requests, openConfirmModal, isOwner= true }) => {

    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] =  useState({ open: false, message: "", severity: "success" });
    const statusTranslations = {
        requested: "Solicitada",
        accepted: "Aceptada",
        booked: "Reservada",
        picked_up: "Recogida",
        returned: "Devuelta",
        rated: "Valorada",
        cancelled: "Cancelada",
    };
    const paymentStatusTranslations = {
        pending: "Pendiente",
        processing: "Procesando",
        cancelled: "Cancelado",
        paid: "Pagado",
    }

    useEffect(() => {
        const checkPayment = async () => {
            const params = new URLSearchParams(location.search);
            const sessionId = params.get("session_id");
            if(sessionId){
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/pagos/confirm-rent/${sessionId}/`)
                    if(response.data.status === "success"){
                        window.history.replaceState({}, "", "/rental_requests");
                        setNotification({
                          open: true,
                          message: "¡Pago completado con éxito!",
                          severity: "success"
                        });
          
                        setTimeout(() => {
                          setNotification({ ...notification, open: false });
                        }
                        , 5000);
                    }
                    checkPayment();

                } catch (error) {
                    console.error(error);   
                    setNotification({
                        open: true,
                        message: "Ha ocurrido un error al procesar el pago",
                        severity: "error",
                    });
                    setTimeout(() => 
                        setNotification(null),5000);
                    } 
                }
            };
            checkPayment();
        }, [location.search]);

        const handleCloseNotification = () => {
            setNotification({ ...notification, open: false });
          };


    const handlePayment = async (rentId, precio) => {
        if (!user || !rentId) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/pagos/create-rent-checkout/`, {
                rent_id: rentId,
                price: parseInt(precio*100),
                user_id: user.id,
            },{
                headers: {
                    "Content-Type": "application/json",
                },
            

            });
            const stripe = await loadStripe(`${import.meta.env.VITE_STRIPE_PUBLIC_KEY}`);
            const { error } = await stripe.redirectToCheckout({ sessionId: response.data.id });
            if (error) {
                setNotification({ open: true, message: "Ha ocurrido un error al procesar el pago", severity: "error" });
            }
        } catch (error) {
            setNotification({ open: true, message: "Ha ocurrido un error al procesar el pago" +  error, severity: "error" });
        }
    }


    
    return (
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
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }} >
                        <a
                            href={`show-item/${request.item.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            {request.item.title}
                        </a>
                        {(
                            <Chip
                                label={statusTranslations[request.rent_status] || request.rent_status} // Si no hay traducción, se muestra el estado tal cual
                                size="small"
                                sx={{
                                    ml: 2,
                                    backgroundColor: request.rent_status === "cancelled" ? "red" : "default",
                                    color: request.rent_status === "cancelled" ? "white" : "inherit",
                                }}
                            />

                            )}
                        {(
                            <Chip
                            label={paymentStatusTranslations[request.payment_status] || request.payment_status} // Si no hay traducción, se muestra el estado tal cual
                            size="small"
                            sx={{
                                ml: 2,
                                backgroundColor: request.payment_status === "cancelled" ? "red" :
                                    request.payment_status === "paid" ? "green" : 
                                    request.payment_status === "pending" ? "#FCB454" : "default", // "#FCB454" es naranja
                                color: request.payment_status === "cancelled"  || request.payment_status === "paid" ? "white" : "inherit",
                            }}
                        />
                        )}
                    </Typography>
                    {isOwner && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            <strong> Solicitado por: </strong>
                            <Tooltip
                                title={
                                    <Card sx={{ width: 250 }}>
                                        <CardContent>
                                            <Typography variant="body2">
                                                <strong>Nombre:</strong> {request.renter.name} {request.renter.surname}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Email:</strong> {request.renter.email}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-end" }}>
                                            {/* Botón para enviar mensaje al usuario, TODO implementar el chat */}
                                            <Button size="small" onClick={() => alert("Enviando mensaje...")}>
                                                Enviar Mensaje
                                            </Button>
                                        </CardActions>
                                    </Card>
                                }
                                arrow
                            >
                                <a
                                    href={`/perfil/${request.renter.username}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "#1976d2",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {request.renter.name} {request.renter.surname}
                                    {/* TODO añadir en el modelo de la renta el campo owner para poder serializarlo
                                    y poner "solicitado a", de momento se deja así */}
                                </a>
                            </Tooltip>
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong> Inicio: </strong> {new Date(request.start_date).toLocaleString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong> Fin: </strong> {new Date(request.end_date).toLocaleString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                        {/* Si el estatus es 'aceptado' y el pago está pendiente, mostramos el botón de pago */}
                        {!isOwner && request.rent_status === "accepted" && request.payment_status === "pending" && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handlePayment(request.id, request.item.price)}
                                disabled={loading} 
                            >
                                Pagar
                            </Button>
                        )}
                        { isOwner && request.rent_status === "requested" && (<Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => openConfirmModal(request, "accepted")}
                        >
                            Aceptar
                        </Button>) }
                        { isOwner && request.rent_status === "requested" && <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => openConfirmModal(request, "rejected")}
                        >
                            Rechazar
                        </Button> }
                             <Snackbar 
                                    open={notification.open} 
                                    autoHideDuration={6000} 
                                    onClose={handleCloseNotification}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                  >
                                    <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                                      {notification.message}
                                    </Alert>
                                  </Snackbar>
                    </Box>

                </CardContent>
            </Card>
        ))}
        </Box>
    );
};

RequestCardsContainer.propTypes = {
    requests: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            imageUrl: PropTypes.string.isRequired,
            title: PropTypes.string,
            item: PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                title: PropTypes.string.isRequired,
            }).isRequired,
            renter: PropTypes.shape({
                name: PropTypes.string.isRequired,
                surname: PropTypes.string.isRequired,
                email: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
            }).isRequired,
            start_date: PropTypes.string.isRequired,
            end_date: PropTypes.string.isRequired,
            rent_status: PropTypes.string.isRequired,
            payment_status: PropTypes.string.isRequired,
        })
    ).isRequired,
    openConfirmModal: PropTypes.func.isRequired,
    isOwner: PropTypes.bool,
};


export default RequestCardsContainer;