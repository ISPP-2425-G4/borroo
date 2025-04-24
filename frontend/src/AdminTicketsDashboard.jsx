import { Container, Box, Typography, Paper, Divider, Chip, CircularProgress, Alert, Button } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, 
  InputLabel, Select, MenuItem, TextField, Stack, IconButton, Tooltip
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

const AdminTicketsDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [ticketData, setTicketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, startDateFilter, endDateFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/incidencias/full`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Incluye el token JWT
          },
        }
      );
      console.log(response.data.results);

      if (response.status !== 200) {
        throw new Error("Error al obtener los tickets.");
      }

      const fetchedTickets = response.data.results;
      setTickets(fetchedTickets);
      setFilteredTickets(fetchedTickets);

      const userIds = new Set();
      fetchedTickets.forEach(ticket => {
        userIds.add(ticket.reporter);
      });

      const userData = {};
      await Promise.all(
        [...userIds].map(async (userId) => {
          try {
            const userResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${userId}`,
              { headers: { "Content-Type": "application/json" } }
            );
              if (userResponse.data) {
                userData[userId] = userResponse.data;
              }
            
          } catch (err) {
            console.error(`Error al obtener el usuario ${userId}:`, err);
          }
        })
      );

      setTicketData(userData);
    } catch (err) {
      setError(err.message);
      console.error("Error al buscar los tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tickets];

    if (statusFilter !== 'all') {
      result = result.filter(ticket => 
        ticket.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(ticket => 
        new Date(ticket.created_at) >= startDate
      );
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(ticket => 
        new Date(ticket.created_at) <= endDate
      );
    }

    setFilteredTickets(result);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const handleStatusChange = async () => {
    if (!editingTicketId || !newStatus) return;
    const ticketId = editingTicketId;
    const ticket = tickets.find((ticket) => ticket.id === ticketId);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/tickets/full/${ticketId}/`, {
        status: newStatus,
        userId: localStorage.getItem("user")?.id,
        ticketId: ticketId,
        description: ticket.description,
        user: ticket.reporter,
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.status === 200) {
        const updatedTickets = tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        );
        setTickets(updatedTickets);
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error al actualizar el estado del ticket:", error);
      setError("Error al actualizar el estado del ticket.");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleOpenFilterDialog = () => {
    setShowFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setShowFilterDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return '#ff9800'; // Orange
      case 'en revisión':
        return '#2196f3'; // Blue
      case 'resuelto':
        return '#4caf50'; // Green
      default:
        return '#9e9e9e'; // Grey
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFilterDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f7f9fc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="500" color="primary">
              Gestión de las Incidencias
            </Typography>
            <Box>
              <Tooltip title="Filtros">
                <IconButton color="primary" onClick={handleOpenFilterDialog} sx={{ mr: 1 }}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualizar tickets">
                <IconButton color="primary" onClick={fetchTickets}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Revisión y gestión de incidencias de usuarios
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {statusFilter !== 'all' && (
              <Chip 
                label={`Estado: ${statusFilter}`} 
                color="primary" 
                variant="outlined"
                onDelete={() => setStatusFilter('all')}
                size="small"
              />
            )}
            {startDateFilter && (
              <Chip 
                label={`Desde: ${formatFilterDate(startDateFilter)}`} 
                color="primary" 
                variant="outlined"
                onDelete={() => setStartDateFilter('')}
                size="small"
              />
            )}
            {endDateFilter && (
              <Chip 
                label={`Hasta: ${formatFilterDate(endDateFilter)}`} 
                color="primary" 
                variant="outlined"
                onDelete={() => setEndDateFilter('')}
                size="small"
              />
            )}
            {(statusFilter !== 'all' || startDateFilter || endDateFilter) && (
              <Chip 
                label="Resetear Filtros" 
                color="secondary" 
                onClick={resetFilters}
                size="small"
              />
            )}
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          ) : filteredTickets.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              {tickets.length === 0 ? 'No hay incidencias que mostrar' : 'No se encontraron incidencias que coincidan con los filtros aplicados'}
            </Alert>
          ) : (
            filteredTickets.map((ticket) => {
              console.log(ticket.reporter, ticketData);
              const user = ticketData[ticket.reporter];
              
              return (
                <Paper 
                  key={ticket.id} 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    borderLeft: `4px solid ${getStatusColor(ticket.status.toLowerCase())}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3" fontWeight="500">
                      Ticket #{ticket.id}
                    </Typography>
                    <Chip 
                      label={ticket.status} 
                      sx={{ 
                        backgroundColor: getStatusColor(ticket.status.toLowerCase()),
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
                    <Typography variant="body1" fontWeight="500">
                    {user ? `${user.name} ${user.surname}` : 'Unknown User'}
                  </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                    <Typography variant="body1" sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(0,0,0,0.02)', 
                      borderRadius: 1,
                      borderLeft: '2px solid rgba(0,0,0,0.1)'
                    }}>
                      {ticket.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                      <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Enviado: {formatDate(ticket.created_at)}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => {
                        setShowDialog(true);
                        setEditingTicketId(ticket.id);
                        setNewStatus(ticket.status);
                      }}
                      sx={{ fontWeight: 500, textTransform: 'none' }}
                    >
                      Actualizar estado
                    </Button>
                  </Box>
                </Paper>
              );
            })
          )}
        </Paper>
      </Container>

      {/* Dialogs for updating status and filters remain unchanged */}
    </Box>
  );
};

export default AdminTicketsDashboard;