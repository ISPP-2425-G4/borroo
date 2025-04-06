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

const AdminReportsDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, statusFilter, startDateFilter, endDateFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/usuarios/reportes`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error("Error al obtener los reportes.");
      }

      const fetchedReports = response.data.results;
      setReports(fetchedReports);
      setFilteredReports(fetchedReports);

      const userIds = new Set();
      fetchedReports.forEach(report => {
        userIds.add(report.reported_user);
        userIds.add(report.reporter);
      });

      const userData = {};
      await Promise.all(
        [...userIds].map(async (userId) => {
          try {
            const userResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${userId}`,
              { headers: { "Content-Type": "application/json" } }
            );
            if (typeof userId === 'string' && /^[a-zA-Z0-9_-]+$/.test(userId)) {
              userData[userId] = userResponse.data;
            } else {
            console.error(`ID de usuario no válido: ${userId}`);
            throw new Error('ID de usuario no válido');
          }
          } catch (err) {
            console.error(`Error al obtener el usuario ${userId}:`, err);
          }
        })
      );

      setReportData(userData);
    } catch (err) {
      setError(err.message);
      console.error("Error al buscar los reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...reports];

    if (statusFilter !== 'all') {
      result = result.filter(report => 
        report.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(report => 
        new Date(report.created_at) >= startDate
      );
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(report => 
        new Date(report.created_at) <= endDate
      );
    }

    setFilteredReports(result);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const handleStatusChange = async () => {
    if (!editingReportId || !newStatus) return;
    const reportId = editingReportId;
    const reporte = reports.find((report) => report.id === reportId);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/reportes/${reportId}/`, {
        status: newStatus,
        userId: localStorage.getItem("user")?.id,
        reportId: reportId,
        category: reporte.category,
        description: reporte.description,
        reported_user: reporte.reported_user,
        reporter: reporte.reporter,
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.status === 200) {
        const updatedReports = reports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        );
        setReports(updatedReports);
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error al actualizar el estado del reporte:", error);
      setError("Error al actualizar el estado del reporte.");
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
              Gestión de los reportes
            </Typography>
            <Box>
              <Tooltip title="Filtros">
                <IconButton color="primary" onClick={handleOpenFilterDialog} sx={{ mr: 1 }}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualizar reportes">
                <IconButton color="primary" onClick={fetchReports}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Revisión y gestión de reportes de usuarios
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
          ) : filteredReports.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              {reports.length === 0 ? 'No hay reportes que mostrar' : 'No se encontraron reportes que coincidan con los filtros aplicados'}
            </Alert>
          ) : (
            filteredReports.map((report) => {
              const reporter = reportData[report.reporter];
              const reportedUser = reportData[report.reported_user];
              
              return (
                <Paper 
                  key={report.id} 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    borderLeft: `4px solid ${getStatusColor(report.status.toLowerCase())}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3" fontWeight="500">
                      Report #{report.id}
                    </Typography>
                    <Chip 
                      label={report.status} 
                      sx={{ 
                        backgroundColor: getStatusColor(report.status.toLowerCase()),
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
                    <Box sx={{ minWidth: '45%' }}>
                      <Typography variant="subtitle2" color="text.secondary">Usuario que reporta</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {reporter?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ minWidth: '45%' }}>
                      <Typography variant="subtitle2" color="text.secondary">Usuario reportado</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {reportedUser?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Categoria</Typography>
                    <Typography variant="body1">
                      {report.category}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Descripcion</Typography>
                    <Typography variant="body1" sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(0,0,0,0.02)', 
                      borderRadius: 1,
                      borderLeft: '2px solid rgba(0,0,0,0.1)'
                    }}>
                      {report.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                      <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Enviado: {formatDate(report.created_at)}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => {
                        setShowDialog(true);
                        setEditingReportId(report.id);
                        setNewStatus(report.status);
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

      <Dialog
        maxWidth="sm"
        fullWidth
        open={showDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            pb: 2,
            pt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Actualizar estado del reporte</span>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseDialog} 
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
            Selecciona el nuevo estado de este reporte:
          </Typography>
          
          <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="Pendiente">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9800', mr: 1.5 }} />
                  Pendiente
                </Box>
              </MenuItem>
              <MenuItem value="En revisión">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196F3', mr: 1.5 }} />
                  En Revisión
                </Box>
              </MenuItem>
              <MenuItem value="Resuelto">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50', mr: 1.5 }} />
                  Resuelto
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            size="medium"
            sx={{ 
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleStatusChange} 
            color="primary"
            variant="contained"
            size="medium"
            disableElevation
            sx={{ 
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth="sm"
        fullWidth
        open={showFilterDialog}
        onClose={handleCloseFilterDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            pb: 2,
            pt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Filtros</span>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseFilterDialog} 
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{  mt:4 }}>
  <Stack spacing={4} mt={1} mb={1}>
    <FormControl fullWidth variant="outlined">
    <InputLabel id="filter-status-label">Estado</InputLabel>

      <Select
        labelId="filter-status-label"
        id="filter-status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        label="Estado"
        size="medium"
      >
        <MenuItem value="all">
          <Typography variant="body1" sx={{ fontWeight: 500 }}>Todos los Estados</Typography>
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem value="pendiente">
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: '#FF9800', 
                mr: 2,
                boxShadow: '0 0 4px rgba(255, 152, 0, 0.5)'
              }} 
            />
            <Typography variant="body1">Pendiente</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem value="en revisión">
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: '#2196F3', 
                mr: 2,
                boxShadow: '0 0 4px rgba(33, 150, 243, 0.5)'
              }} 
            />
            <Typography variant="body1">En revisión</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem value="resuelto">
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: '#4CAF50', 
                mr: 2,
                boxShadow: '0 0 4px rgba(76, 175, 80, 0.5)'
              }} 
            />
            <Typography variant="body1">Resuelto</Typography>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
    
    <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
      <Typography 
        variant="subtitle1" 
        color="text.primary" 
        sx={{ mb: 2, fontWeight: 500 }}
      >
        Rango de Fecha
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Desde"
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          InputLabelProps={{ 
            shrink: true,
            sx: { fontWeight: 500 }
          }}
          fullWidth
          sx={{ 
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#2196F3',
              }
            }
          }}
        />
        
        <TextField
          label="Hasta"
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          InputLabelProps={{ 
            shrink: true,
            sx: { fontWeight: 500 }
          }}
          fullWidth
          sx={{ 
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#2196F3',
              }
            }
          }}
        />
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
      <Button 
        variant="outlined" 
        onClick={() => {
          setStatusFilter('all');
          setStartDateFilter('');
          setEndDateFilter('');
        }}
      >
        Limpiar
      </Button>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() =>setShowFilterDialog(false)}
      >
        Aplicar Filtros
      </Button>
    </Box>
  </Stack>
</DialogContent>
        
        
      </Dialog>
    </Box>
  );
};

export default AdminReportsDashboard;