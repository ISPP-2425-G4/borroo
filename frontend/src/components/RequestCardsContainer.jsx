import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Tooltip,
    CardActions,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert,
    IconButton,
  } from "@mui/material";
  
  import ThumbUpIcon from "@mui/icons-material/ThumbUp";
  import ThumbDownIcon from "@mui/icons-material/ThumbDown";
  
  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import PropTypes from "prop-types";
  import axios from "axios";
  import { loadStripe } from "@stripe/stripe-js";
  
  import ConfirmModal from "./ConfirmModal";
  import SendMessageButton from "./SendMessageButton";
  


const RequestCardsContainer = ({ requests, openConfirmModal, isOwner= true }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(false);
    const [processedSessionId, setProcessedSessionId] = useState(null); // Estado para rastrear el sessionId procesado
    const [notification, setNotification] =  useState({ open: false, message: "", severity: "success" });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
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
            if(sessionId && sessionId !== processedSessionId){
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/pagos/confirm-rent/${sessionId}/`)
                    if(response.data.status === "success"){
                        const rentId = response.data.rent_id;

                        await axios.put(
                            `${import.meta.env.VITE_API_BASE_URL}/rentas/full/${rentId}/change_status/`,
                            { response: "accepted" },
                            { headers: 
                                { 
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                                } 
                            }
                          );

                        window.history.replaceState({}, "", "/rental_requests");
                        window.location.reload();
                        setNotification({
                          open: true,
                          message: "¡Pago completado con éxito!",
                          severity: "success"
                        });
          
                        setTimeout(() => {
                          setNotification({ ...notification, open: false });
                        }
                        , 5000);
                        setProcessedSessionId(sessionId);
                    }

                } catch (error) {
                    console.error(error);   
                    setNotification({
                        open: true,
                        message: "Ha ocurrido un error al procesar el pago",
                        severity: "error",
                    });
                    setTimeout(() => 
                        setNotification({ ...notification, open: false }), 5000);
                    } 
                }
            };
            checkPayment();
        }, [location.search, processedSessionId]);


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
    };
    const handleConfirmRental = async (rentId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/pagos/set-renter-confirmation/`, {
                rent_id: rentId,
                user_id: user.id,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (response.data.status === "success") {
                setNotification({
                    open: true,
                    message: "¡Gracias por confirmar el alquiler!",
                    severity: "success",
                });
    
                // Recargar la página después de un breve retraso
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Espera 1 segundos antes de recargar
            }
        } catch (error) {
            console.error(error);
            setNotification({
                open: true,
                message: "Error al confirmar el alquiler.",
                severity: "error",
            });
        }
    };

    const handleCancelRequest = async (rentId) => {
        const token = localStorage.getItem("access_token");
        console.log("Token:", token);
        try {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/rentas/full/${rentId}/cancel_rent/`,
            {},
            { headers: { "Content-Type": "application/json" ,
                        "Authorization": `Bearer ${token}`
            } }
          );
          console.log("Solicitud cancelada:", response.data);
          setShowCancelModal(false);

          setNotification({
          open: true,
          message: response.data.notification_message,
          severity: "success"
        });

        setTimeout(() => {
            window.location.reload();
        }, 2000); // Espera 2 segundos antes de recargar

        } catch (error) {
          console.error("Error al cancelar la solicitud:", error.response?.data || error.message);
        }
      };

    const handleOpenPaymentModal = (request) => {
        setSelectedRequest(request);
        setOpenPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setOpenPaymentModal(false);
        setSelectedRequest(null);
    };

    const handlePaymentWithBalance = async (rentId, price) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/pagos/pay-with-balance/`, {
                rent_id: rentId,
                user_id: user.id,
                price: parseInt(price * 100),
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status === "success") {
                setNotification({
                    open: true,
                    message: "¡Pago realizado con saldo exitosamente!",
                    severity: "success",
                });
                handleClosePaymentModal();
                window.location.reload();
            } else {
                setNotification({
                    open: true,
                    message: response.data.error || "Error al procesar el pago con saldo.",
                    severity: "error",
                });
            }
        } catch (error) {
            setNotification({
                open: true,
                message: error.response?.data?.error || "Error al procesar el pago con saldo.",
                severity: "error",
            });
        }
    };

    const handleOpenIncidentForm = (rentId) => {
        navigate(`/incidencias/nueva/${rentId}`);
      };
    
    return (
<Box
    sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden", // 💡 evita scroll lateral ocultando el borde
    }}
>

        {requests.map((request) => (   
            <Card
    key={request.id}
    sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "flex-start",
        boxShadow: 3,
        p: 2,
        width: "100%",
        maxWidth: "100%", // 💡 Asegura que no exceda
        borderRadius: 2,
        overflow: "hidden", // 👈 O visible si hay tooltip, pero nunca default
        boxSizing: "border-box", // 👌 Importante para evitar desbordes
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
                <CardContent
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >

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
                                            <SendMessageButton userId={request.renter.id} />
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

                    {/* Pregunta si el alquiler ha ido bien si la fecha de fin ya pasó */}
                {new Date(request.end_date) < new Date() &&
                    !request.incident_reported && request.payment_status === 'paid'  &&
                    ((user.id === request.renter.id && !request.paid_pending_confirmation?.is_confirmed_by_renter && !request.renter_reported)  || 
                    (user.id === request.item.user && !request.paid_pending_confirmation?.is_confirmed_by_owner && !request.owner_reported)) && (
                        <Box sx={{ mt: 2 }}>
  <Typography variant="body2" sx={{ mb: 1 }}>
    ¿El alquiler ha ido bien?
  </Typography>
  <Box sx={{ display: "flex", gap: 2 }}>
    <IconButton
      color="success"
      onClick={() => handleConfirmRental(request.id)}
      sx={{
        backgroundColor: "#e8f5e9",
        borderRadius: "8px",
        '&:hover': { backgroundColor: "#c8e6c9" },
      }}
    >
      <ThumbUpIcon />
    </IconButton>
    <IconButton
      color="error"
      onClick={() => handleOpenIncidentForm(request.id)}
      sx={{
        backgroundColor: "#ffebee",
        borderRadius: "8px",
        '&:hover': { backgroundColor: "#ffcdd2" },
      }}
    >
      <ThumbDownIcon />
    </IconButton>
  </Box>
</Box>

                    )}
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                        {/* Si el estatus es 'aceptado' y el pago está pendiente, mostramos el botón de pago */}
                        {!isOwner && request.rent_status === "accepted" && request.payment_status === "pending" && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenPaymentModal(request)}
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
                    </Box>
                    {request.rent_status != "cancelled" && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                        {user.id === request.renter.id && new Date(request.end_date) > new Date() && (
                            <Button
                                variant="contained"
                                color="grey"
                                size="small"
                                onClick={() => setShowCancelModal(true)}
                                disabled={loading} 
                            >
                                Cancelar
                            </Button>)}
                            { isOwner && request.rent_status != "requested" && new Date(request.end_date) > new Date() && (
                            <Button
                                variant="contained"
                                color="grey"
                                size="small"
                                onClick={() => setShowCancelModal(true)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            )}
                            {showCancelModal && (
                            <ConfirmModal
                                title="Confirmar Cancelación"
                                message={`¿Estás seguro de que quieres cancelar el alquiler del objeto "${request.item.title}"?`}
                                onCancel={() => setShowCancelModal(false)}
                                onConfirm={() => handleCancelRequest(request.id)}
                            />
                            )}

                        <Snackbar
                            open={notification.open}
                            onClose={() => setNotification({ ...notification, open: false })}
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                            >
                            <Alert
                                onClose={() => setNotification({ ...notification, open: false })}
                                severity={notification.severity}
                                sx={{ width: "100%", fontSize: "18px" }}
                            >
                                {notification.message}
                            </Alert>
                            </Snackbar>
                        </Box>
                    )}
                    {/* Modal de opciones de pago */}
                    <Dialog open={openPaymentModal} onClose={handleClosePaymentModal}>
                        <DialogTitle>Elige un método de pago</DialogTitle>
                        <DialogContent>
                            <Typography variant="body1">
                                ¿Cómo deseas realizar el pago?
                            </Typography>
                            {selectedRequest && (
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: -1, mt: 0, ml: 0 }}>
                                    Precio: {selectedRequest.total_price} €
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    handlePayment(selectedRequest.id, selectedRequest.total_price);
                                    handleClosePaymentModal();
                                }}
                            >
                                Pagar con tarjeta
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => {
                                    handlePaymentWithBalance(selectedRequest.id, selectedRequest.total_price);
                                }}
                            >
                                Pagar con saldo
                            </Button>
                        </DialogActions>
                        <Snackbar
                            open={notification.open}
                            onClose={() => setNotification({ ...notification, open: false })}
                            anchorOrigin={{ vertical: "top", horizontal: "center" }} // Centrado en la parte superior
                        >
                            <Alert
                                onClose={() => setNotification({ ...notification, open: false })}
                                severity={notification.severity}
                                sx={{
                                    width: "100%",
                                    fontSize: "18px", // Tamaño de fuente más grande
                                }}
                            >
                                {notification.message}
                            </Alert>
                        </Snackbar>
                    </Dialog>
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