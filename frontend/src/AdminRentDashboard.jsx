import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    TextField,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "./Navbar";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";

const rentStatusTranslation = {
    accepted: "Aceptado",
    requested: "Solicitado",
    booked: "Reservado",
    picked_up: "Recogido",
    returned: "Devuelto",
    rated: "Calificado",
    cancelled: "Cancelado",
};

const paymentStatusTranslation = {
    pending: "Pendiente",
    processing: "Procesando",
    cancelled: "Cancelado",
    paid: "Pagado",
};


const AdminRentDashboard = () => {
    const [rents, setRents] = useState([]);
    const [editRentData, setEditRentData] = useState(null);
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        item: "",
        total_price: "",
        commission: "",
        rent_status: "requested",
        payment_status: "pending",
    });

    const token = localStorage.getItem("access_token");

    const fetchRents = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/rent/list/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Eliminar el campo item antes de guardar
            const sanitizedRents = response.data.map(({ ...rest }) => rest);

            setRents(sanitizedRents);
        } catch (err) {
            console.error("Error al obtener rentas", err);
        }
    };


    useEffect(() => {
        fetchRents();
    });
    const handleDeleteRent = async (rentId) => {
        const confirm = window.confirm("¿Eliminar esta renta?");
        if (!confirm) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/rent/${rentId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` },
                "Content-Type": "application/json",
            });
            alert("Renta eliminada.");
            fetchRents();
        } catch {
            alert("Error al eliminar renta.");
        }
    };

    const handleUpdateRent = async () => {
        try {
            const { id, ...data } = editRentData;

            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/rent/${id}/update/`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            alert("Renta actualizada.");

            setRents(prevRents => prevRents.map(rent => rent.id === id ? { ...rent, ...data } : rent));
            setEditRentData(null);
        } catch (err) {
            if (err.response && err.response.data) {
                alert(`Error al actualizar renta: ${err.response.data.detail || 'La duración no es correcta'}`);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const updatedData = { ...editRentData, [name]: value };

        // Solo calcular si ambas fechas están presentes
        if (updatedData.start_date && updatedData.end_date) {
            const start = new Date(updatedData.start_date);
            const end = new Date(updatedData.end_date);

            const diffInDays = (end - start) / (1000 * 60 * 60 * 24); // Diferencia en días
            if (diffInDays > 0) {
                const pricePerDay = 100; // 🔁 Aquí deberías traer el precio real del ítem si puedes
                const newTotal = pricePerDay * diffInDays;
                const newCommission = newTotal * 0.14;

                updatedData.total_price = newTotal.toFixed(2);
                updatedData.commission = newCommission.toFixed(2);
            }
        }

        setEditRentData(updatedData);
    };

    const translateRentStatus = (status) => rentStatusTranslation[status] || status;
    const translatePaymentStatus = (status) => paymentStatusTranslation[status] || status;

    return (
        <>
            <Navbar />
            <Box sx={{ p: 4 }}>
                {(
                    <Box
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            p: 3,
                            maxWidth: 600,
                            mx: "auto",
                            mb: 4,
                            bgcolor: "#fafafa",
                        }}
                    >
                        
                    </Box>
                )}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Inicio</TableCell>
                                <TableCell>Fin</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Pago</TableCell>
                                <TableCell>Total (€)</TableCell>
                                <TableCell>Comisión (€)</TableCell>
                                <TableCell>Arrendador</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No hay rentas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rents.map((rent) => (
                                    <TableRow key={rent.id}>
                                        <TableCell>{new Date(rent.start_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(rent.end_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{translateRentStatus(rent.rent_status)}</TableCell>
                                        <TableCell>{translatePaymentStatus(rent.payment_status)}</TableCell>
                                        <TableCell>{rent.total_price}</TableCell>
                                        <TableCell>{rent.commission}</TableCell>
                                        <TableCell>{rent.renter_name}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => setEditRentData(rent)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteRent(rent.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {editRentData && (
                    <Dialog open={true} onClose={() => setEditRentData(null)}>
                        <DialogTitle>Editar Renta</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {[
                                    { name: "start_date", label: "Fecha de inicio", type: "date" },
                                    { name: "end_date", label: "Fecha de fin", type: "date" },
                                    // { name: "item", label: "ID del Ítem", type: "number" },
                                    { name: "total_price", label: "Precio Total", type: "number", disabled: true },
                                    { name: "commission", label: "Comisión", type: "number", disabled: true },
                                ].map(({ name, label, type, disabled }) => (
                                    <Grid item xs={12} key={name}>
                                        <TextField
                                            fullWidth
                                            name={name}
                                            label={label}
                                            type={type}
                                            value={editRentData[name]}
                                            onChange={(e) => handleInputChange(e, true)}
                                            disabled={disabled || false}
                                            InputLabelProps={{
                                                shrink: true,  // Esto asegura que la etiqueta se mantenga fuera del campo
                                            }}
                                            sx={{
                                                marginBottom: 2,  // Añadir margen inferior para espaciar los campos
                                                "& input[type='date']": {
                                                    padding: "10px 12px", // Ajuste de padding para mejorar la visibilidad
                                                },
                                            }}
                                        />
                                    </Grid>
                                ))}

                                {/* Estado de la renta */}
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado de la renta</InputLabel>
                                        <Select
                                            name="rent_status"
                                            value={formData.rent_status}
                                            label="Estado de la renta"
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, rent_status: e.target.value }))
                                            }
                                        >
                                            {[
                                                "aceptado",
                                                "solicitado",
                                                "reservado",
                                                "recogido",
                                                "devuelto",
                                                "calificado",
                                                "cancelado",
                                            ].map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado del pago</InputLabel>
                                        <Select
                                            name="payment_status"
                                            value={formData.payment_status}
                                            label="Estado del pago"
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, payment_status: e.target.value }))
                                            }
                                        >
                                            {["pendiente", "procesando", "cancelado", "pagado"].map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>



                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditRentData(null)}>Cancelar</Button>
                            <Button onClick={handleUpdateRent} variant="contained">
                                Guardar
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Box>
        </>
    );
};

export default AdminRentDashboard;
