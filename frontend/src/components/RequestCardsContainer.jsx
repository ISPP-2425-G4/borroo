import { Box, Button, Card, CardContent, CardMedia, Typography, Tooltip, CardActions, Chip } from "@mui/material";
import PropTypes from "prop-types";

const StatusChip = ({ status, translations }) => {
    const translatedStatus = translations && typeof translations === 'object' && status in translations
        ? translations[status]
        : status; // Fallback a 'status' si la clave no existe

    return (
        <Chip
            label={translatedStatus}
            size="small"
            sx={{ ml: 2 }}
        />
    );
};

StatusChip.propTypes = {
    status: PropTypes.string.isRequired,
    translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

const RequestDetails = ({ request }) => {
    return (
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
                <Button size="small" onClick={() => alert("Enviando mensaje...")}>Enviar Mensaje</Button>
            </CardActions>
        </Card>
    );
};

RequestDetails.propTypes = {
    request: PropTypes.shape({
        renter: PropTypes.shape({
            name: PropTypes.string.isRequired,
            surname: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
};

const ActionButtons = ({ request, openConfirmModal, isOwner }) => {
    return (
        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
            {request.rent_status === "accepted" && request.payment_status === "pending" && (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => alert("Iniciando proceso de pago...")} //TODO: Implementar el pago con Stripe
                >
                    Pagar
                </Button>
            )}
            {isOwner && request.rent_status === "requested" && (
                <>
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
                </>
            )}
        </Box>
    );
};

ActionButtons.propTypes = {
    request: PropTypes.shape({
        rent_status: PropTypes.string.isRequired,
        payment_status: PropTypes.string.isRequired,
    }).isRequired,
    openConfirmModal: PropTypes.func.isRequired,
    isOwner: PropTypes.bool.isRequired,
};

const RequestCard = ({ request, statusTranslations, openConfirmModal, isOwner }) => {
    return (
        <Card key={request.id} sx={{ display: "flex", flexDirection: "row", alignItems: "center", boxShadow: 3, p: 2,
            width: "100%", maxWidth: "750px", minHeight: "150px", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia
                component="img"
                sx={{ width: 150, height: 150, objectFit: "cover", borderRadius: "2px", mr: 2, boxShadow: 1 }}
                image={request.imageUrl}
                alt={request.title}
            />
            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    <a href={`show-item/${request.item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {request.item.title}
                    </a>
                    {!isOwner && <StatusChip status={request.rent_status} translations={statusTranslations} />}
                </Typography>
                {isOwner && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>Solicitado por: </strong>
                        <Tooltip title={<RequestDetails request={request} />} arrow>
                            <a href={`/perfil/${request.renter.username}`} style={{ textDecoration: "none", color: "#1976d2", fontWeight: "bold" }}>
                                {request.renter.name} {request.renter.surname}
                            </a>
                        </Tooltip>
                    </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Inicio:</strong> {new Date(request.start_date).toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fin:</strong> {new Date(request.end_date).toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <ActionButtons request={request} openConfirmModal={openConfirmModal} isOwner={isOwner} />
            </CardContent>
        </Card>
    );
};


RequestCard.propTypes = {
    request: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        imageUrl: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
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
    }).isRequired,
    statusTranslations: PropTypes.object.isRequired,
    openConfirmModal: PropTypes.func.isRequired,
    isOwner: PropTypes.bool.isRequired,
};

const RequestCardsContainer = ({ requests, openConfirmModal, isOwner = true }) => {
    const statusTranslations = {
        requested: "Solicitada",
        accepted: "Aceptada",
        booked: "Reservada",
        pickedUp: "Recogida",
        returned: "Devuelta",
        rated: "Valorada"
    };

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
                <RequestCard
                    key={request.id}
                    request={request}
                    statusTranslations={statusTranslations}
                    openConfirmModal={openConfirmModal}
                    isOwner={isOwner}
                />
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