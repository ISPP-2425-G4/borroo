import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from "./Navbar";
import AdminItemDashboard from "./AdminItemDashboard";
import AdminRentDashboard from "./AdminRentDashboard";
import PropTypes from 'prop-types';


const UserList = ({ users, handleEditUser, handleDeleteUser, editUserData, setEditUserData, handleUpdateUser }) => {

    return (
        <Box sx={{ mt: 4 }}>
            <TableContainer component={Paper}>
                <Typography variant="h5" sx={{ m: 2 }}>
                    Lista de usuarios
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Username</strong></TableCell>
                            <TableCell><strong>Nombre</strong></TableCell>
                            <TableCell><strong>Apellidos</strong></TableCell>
                            <TableCell><strong>DNI / NIF</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Teléfono</strong></TableCell>
                            <TableCell><strong>Ciudad</strong></TableCell>
                            <TableCell><strong>País</strong></TableCell>
                            <TableCell><strong>Dirección</strong></TableCell>
                            <TableCell><strong>CP</strong></TableCell>
                            <TableCell><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">No hay usuarios registrados.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.username}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.surname}</TableCell>
                                    <TableCell>{user.dni}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone_number}</TableCell>
                                    <TableCell>{user.city}</TableCell>
                                    <TableCell>{user.country}</TableCell>
                                    <TableCell>{user.address}</TableCell>
                                    <TableCell>{user.postal_code}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditUser(user)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        {!user.is_admin && (
                                            <IconButton onClick={() => handleDeleteUser(user.id, user.is_admin)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {editUserData && (
                <Dialog open={true} onClose={() => setEditUserData(null)}>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            {["name", "surname", "email", "phone_number", "city", "country", "address", "postal_code", "dni"]
                                .map((field) => (
                                    <Grid item xs={12} sm={6} key={field}>
                                        <TextField
                                            fullWidth
                                            label={field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                                            value={editUserData[field] || ""}
                                            onChange={(e) =>
                                                setEditUserData((prev) => ({
                                                    ...prev,
                                                    [field]: e.target.value,
                                                }))
                                            }
                                            variant="outlined"
                                        />
                                    </Grid>
                                ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditUserData(null)}>Cancelar</Button>
                        <Button onClick={handleUpdateUser} variant="contained" color="primary">Guardar</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

UserList.propTypes = {
    users: PropTypes.array.isRequired,
    handleEditUser: PropTypes.func.isRequired,
    handleDeleteUser: PropTypes.func.isRequired,
    editUserData: PropTypes.object,
    setEditUserData: PropTypes.func.isRequired,
    handleUpdateUser: PropTypes.func.isRequired,
};

const AdminDashboard = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [showRents, setShowRents] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        surname: "",
        email: "",
        phone_number: "",
        city: "",
        country: "",
        address: "",
        postal_code: "",
        dni: "",
    });
    const [users, setUsers] = useState([]);
    const [editUserData, setEditUserData] = useState(null);



    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.is_admin) {
            alert("No tienes permisos para acceder al panel de administrador.");
            window.location.href = "/";
        }
    }, []);

    const validateDni = (dni) => {
        const dniPattern = /^\d{8}[A-Z]$/;
        const nifPattern = /^[A-Z]\d{7}[A-Z0-9]$/;
        return dniPattern.test(dni) || nifPattern.test(dni);
    };

    const handleCreateUser = async () => {
        const token = localStorage.getItem("access_token");

        if (formData.dni && !validateDni(formData.dni)) {
            alert("El DNI/NIF no tiene un formato válido.");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/create/`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("✅ Usuario creado correctamente");
            setFormData({
                username: "",
                password: "",
                name: "",
                surname: "",
                email: "",
                phone_number: "",
                city: "",
                country: "",
                address: "",
                postal_code: "",
                dni: "",
            });
            fetchUsers();
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Error al crear usuario";
            alert("❌ " + errorMsg);
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch {
            alert("No autorizado. Asegúrate de estar logueado como admin.");
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("access_token");
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/delete/${userId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Usuario eliminado correctamente.");
            fetchUsers();
        } catch {
            alert("No se pudo eliminar el usuario.");
        }
    };

    const handleEditUser = (user) => {
        setEditUserData({ ...user, originalDni: user.dni });
    };

    const handleUpdateUser = async () => {
        const token = localStorage.getItem("access_token");

        if (editUserData.dni && !validateDni(editUserData.dni)) {
            alert("El DNI/NIF no tiene un formato válido.");
            setEditUserData((prev) => ({
                ...prev,
                dni: prev.originalDni || "",
            }));
            return;
        }

        const dataToSend = { ...editUserData };
        delete dataToSend.originalDni;

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/adminCustome/users/update/${editUserData.id}/`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Usuario actualizado correctamente.");
            setEditUserData(null);
            fetchUsers();
        } catch {
            alert("Error al actualizar usuario.");
        }
    };

    return (
        <>
            <Navbar />
            <Box sx={{ px: 4, py: 4, pt:10 }} className="dashboard">
                <Box 
                    component= "img"
                    src= "/logo.png"
                    alt="Logo de la App"
                    sx={{
                        display: "block",
                        margin: "0 auto",
                        maxWidth: 150,
                        height: "auto",
                        mb: 2,
                    }}
                    />
                {/* TÍTULO PRINCIPAL */}
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
                    Panel de Administración
                </Typography>

                {/* BOTONES PRINCIPALES */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        mb: 3,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowCreate(false);
                            setShowUsers(true);
                            setShowItems(false);
                            setShowRents(false);
                            fetchUsers();
                        }}
                    >
                        GESTIÓN DE USUARIOS
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowCreate(false);
                            setShowUsers(false);
                            setShowItems(true);
                            setShowRents(false);
                        }}
                    >
                        Gestión de Ítems
                    </Button>
                    <Button variant="outlined" onClick={() => {
                        setShowCreate(false); setShowUsers(false); setShowItems(false); setShowRents(true);
                    }}>
                        Gestión de Rentas
                    </Button>
                </Box>


                {/* BOTÓN VOLVER */}
                {(showCreate || showUsers || showItems || showRents) && (
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Button variant="text" onClick={() => {
                            setShowCreate(false);
                            setShowUsers(false);
                            setShowItems(false);
                            setShowRents(false);
                        }}>
                            ← Volver al Dashboard
                        </Button>
                    </Box>
                )}


                {/* FORMULARIO DE CREACIÓN */}
                {showCreate && (
                    <Box
                        sx={{
                            maxWidth: 700,
                            mx: "auto",
                            p: 4,
                            border: "1px solid #ddd",
                            borderRadius: 3,
                            bgcolor: "#fdfdfd",
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            Crear nuevo usuario
                        </Typography>

                        <Grid container spacing={2}>
                            {[
                                "username",
                                "password",
                                "name",
                                "surname",
                                "email",
                                "phone_number",
                                "city",
                                "country",
                                "address",
                                "postal_code",
                                "dni",
                            ].map((field) => (
                                <Grid item xs={12} sm={6} key={field}>
                                    <TextField
                                        fullWidth
                                        label={
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1).replace("_", " ")
                                        }
                                        value={formData[field]}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [field]: e.target.value,
                                            })
                                        }
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 3, textAlign: "right" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateUser}
                            >
                                Guardar usuario
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* LISTA DE USUARIOS */}
                {showUsers && (
                    <>
                        <Box sx={{ textAlign: "center", mb: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setShowCreate(true);
                                }}
                            >
                                Crear Usuario
                            </Button>
                        </Box>

                        <UserList
                            users={users}
                            handleEditUser={handleEditUser}
                            handleDeleteUser={handleDeleteUser}
                            editUserData={editUserData}
                            setEditUserData={setEditUserData}
                            handleUpdateUser={handleUpdateUser}
                        />
                    </>
                )}
                {/* DASHBOARD DE ÍTEMS */}
                {showItems && <AdminItemDashboard />}
                {showRents && <AdminRentDashboard />}
            </Box>
        </>

    );
};

export default AdminDashboard;
