import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    TextField,
    Typography,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "./Navbar";

const AdminItemDashboard = () => {
    const [items, setItems] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editItemData, setEditItemData] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        price_category: "",
    });

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get("http://localhost:8000/usuarios/adminCustome/items/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (err) {
            alert("Error al obtener ítems.");
        }
    };

    const handleCreateItem = async () => {
        try {
            await axios.post(
                "http://localhost:8000/usuarios/adminCustome/item/create/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Ítem creado correctamente.");
            setShowCreateForm(false);
            setFormData({ title: "", description: "", price: "", price_category: "" });
            fetchItems();
        } catch (err) {
            alert("Error al crear ítem.");
        }
    };

    const handleDeleteItem = async (itemId) => {
        const confirm = window.confirm("¿Eliminar este ítem?");
        if (!confirm) return;

        try {
            await axios.delete(`http://localhost:8000/usuarios/adminCustome/item/${itemId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Ítem eliminado.");
            fetchItems();
        } catch (err) {
            alert("Error al eliminar ítem.");
        }
    };

    const handleUpdateItem = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const {
                id,
                images,
                user,
                price_category_display,
                category_display,
                subcategory_display,
                cancel_type_display,
                ...cleanedData
            } = editItemData;

            // No eliminar el id
            cleanedData.id = id;

            await axios.put(
                `http://localhost:8000/usuarios/adminCustome/item/${id}/update/`,
                cleanedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Ítem actualizado.");
            setEditItemData(null);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error al actualizar ítem.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditItemData({ ...editItemData, [name]: value });
    };

    return (
        <>
            <Navbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
                    Gestión de Ítems (Admin)
                </Typography>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
                    <Button variant="outlined" onClick={fetchItems}>
                        Refrescar Lista
                    </Button>
                </Box>

                {/* FORMULARIO DE CREACIÓN */}
                {showCreateForm && (
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
                        <Typography variant="h6" gutterBottom>
                            Nuevo Ítem
                        </Typography>
                        <Grid container spacing={2}>
                            {["title", "description", "price"].map((field) => (
                                <Grid item xs={12} key={field}>
                                    <TextField
                                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                                        fullWidth
                                        name={field}
                                        value={formData[field]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [e.target.name]: e.target.value })
                                        }
                                    />
                                </Grid>
                            ))}
                            {/* Desplegable para price_category */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Selecciona una categoría de precio</InputLabel>
                                    <Select
                                        label="Selecciona una categoría de precio"
                                        name="price_category"
                                        value={formData.price_category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [e.target.name]: e.target.value })
                                        }
                                    >
                                        <MenuItem value="hour">Hora</MenuItem>
                                        <MenuItem value="day">Día</MenuItem>
                                        <MenuItem value="week">Semana</MenuItem>
                                        <MenuItem value="month">Mes</MenuItem>
                                        <MenuItem value="year">Año</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{ textAlign: "right", mt: 2 }}>
                            <Button onClick={handleCreateItem} variant="contained">
                                Guardar
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* TABLA DE ÍTEMS */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Título</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Precio</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay ítems.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.price} €</TableCell>
                                        <TableCell>{item.price_category}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => setEditItemData(item)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteItem(item.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* MODAL DE EDICIÓN */}
                {editItemData && (
                    <Dialog open={true} onClose={() => setEditItemData(null)}>
                        <DialogTitle>Editar Ítem</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {["title", "description", "price"].map((field) => (
                                    <Grid item xs={12} key={field}>
                                        <TextField
                                            fullWidth
                                            name={field}
                                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                                            value={editItemData[field]}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                ))}
                                {/* Desplegable para price_category en el modal de edición */}
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Selecciona una categoría de precio</InputLabel>
                                        <Select
                                            label="Selecciona una categoría de precio"
                                            name="price_category"
                                            value={editItemData.price_category}
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="hour">Hora</MenuItem>
                                            <MenuItem value="day">Día</MenuItem>
                                            <MenuItem value="week">Semana</MenuItem>
                                            <MenuItem value="month">Mes</MenuItem>
                                            <MenuItem value="year">Año</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditItemData(null)}>Cancelar</Button>
                            <Button onClick={handleUpdateItem} variant="contained">
                                Guardar
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Box>
        </>
    );
};

export default AdminItemDashboard;
