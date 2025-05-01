import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Navbar from "./Navbar";
import { loadStripe } from "@stripe/stripe-js";

const PlanCard = styled(Card)(({ theme, active }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  border: active ? `2px solid ${theme.palette.primary.main}` : "1px solid #e0e0e0",
  boxShadow: active ? theme.shadows[8] : theme.shadows[1],
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[10],
  }
}));

const PlanPrice = styled(Typography)(({ theme }) => ({
  fontSize: "1.8rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const SubscriptionScreen = () => {
  const [currentPlan, setCurrentPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  // const [user, setUser] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      if (storedUser) {
        
        if (accessToken) {
          obtenerSaldoUsuario(user.id, accessToken);
       
        
        }
      }
    }, []);

    const handlePayWithSaldo = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/pagos/pay_with_saldo/${user.id}/`,
          { amount: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          setNotification({
            open: true,
            message: "¡Pago realizado con saldo correctamente!",
            severity: "success",
          });
        }
          
      } catch (err) {
        console.error("Error al pagar con saldo:", err);
        setNotification({
          open: true,
          message: "Hubo un error al pagar con saldo.",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setDialogOpen(false); 
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    const obtenerSaldoUsuario = async (userId, accessToken) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${userId}/get_saldo/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSaldo(response.data.saldo);
      } catch (error) {
        console.error("Error al obtener el saldo del usuario:", error);
      }
    };


  useEffect(() => {
    if (user) {
      setCurrentPlan(user.pricing_plan);
      console.log("Plan actual:", user.pricing_plan);
    }
    checkPlan();
  }, [user, token]);

  useEffect(() => {
    const checkPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
    
      if (!sessionId) return;
    
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/pagos/confirm-subscription/${sessionId}/`
        );
    
        if (response.data.status === "success") {
          // ✅ Limpia la URL del session_id
          window.history.replaceState({}, "", "/pricing-plan");
    
          // 🔁 Actualiza el usuario desde el backend
          const userResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${user.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          const updatedUser = userResponse.data;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setCurrentPlan(updatedUser.pricing_plan);
    
          // ✅ Solo si el usuario sigue siendo FREE, haz el upgrade
          if (updatedUser.pricing_plan === "free") {
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${user.id}/upgrade_to_premium/`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        
          // 🔁 Recarga la página para refrescar Navbar y demás

    
          setNotification({
            open: true,
            message: "¡Pago confirmado y suscripción gestionada!",
            severity: "success",
          });
    
          setTimeout(() => {
            setNotification({ ...notification, open: false });
          }, 5000);
        }
      } catch (err) {
        console.error("Error al confirmar el pago:", err);
        if (err.response) {
          console.error("Mensaje del backend:", err.response.data);
        }
        setNotification({
          open: true,
          message: "Hubo un error al confirmar el pago.",
          severity: "error",
        });
      }
    };
    
    
    
      checkPayment();
      
    }, [location.search]);

    const handlePlanChange = async (targetPlan) => {
      if (!user || currentPlan === targetPlan) return;
      if (targetPlan !== 'premium') return; // ❌ Solo permitimos upgrade a Premium
    
      if (saldo >= 5) {
        setDialogOpen(true); 
        return;
      }
      processStripePayment();
    };

    const processStripePayment = async () => {
      setLoading(true);
      setDialogOpen(false); 
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/pagos/create-subscription-checkout/`,
          {
            price: 5,
            currency: "eur",
            user_id: user.id
          },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
    
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        const { error } = await stripe.redirectToCheckout({ sessionId: response.data.id });
    
        if (error) {
          throw new Error(error.message);
        }
    
      } catch (err) {
        console.error("Error al cambiar el plan:", err);
        let errorMessage = "Hubo un error al cambiar el plan";
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
    
        setNotification({
          open: true,
          message: errorMessage,
          severity: "error"
        });
    
      } finally {
        setLoading(false);
      }
    };
    

  const checkPlan = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${user.id}/`);
      const updatedUser = {
        ...user,
        pricing_plan: response.data.pricing_plan,
        subscription_start_date: response.data.subscription_start_date,
        subscription_end_date: response.data.subscription_end_date,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentPlan(response.data.pricing_plan);
    } catch (err) {
      console.error("Error al obtener el plan actual:", err);
    }
  };
  

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold", mb: 4 }}>
            Gestión de Suscripción
          </Typography>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4} 
            justifyContent="center"
            alignItems="stretch"
          >


            <Box flex="1" maxWidth={{ xs: '100%', md: '500px' }}>
              <PlanCard active={currentPlan === 'free'}>
                <CardHeader
                  title={
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Typography variant="h5" sx={{ mb: 1 }}>Plan</Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>Gratis</Typography>
                    </Box>
                  }
                  sx={{ textAlign: "center", pb: 0 }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                  <PlanPrice align="center">0 € / mes</PlanPrice>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Límite de 10 productos activos" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Hasta 15 borradores" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Incluye anuncios" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CancelIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Sin productos destacados" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", p: 3 }}>
                  {currentPlan === 'free' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      disabled
                      fullWidth
                    >
                      Plan Actual
                    </Button>
                  )}
                </CardActions>
              </PlanCard>
            </Box>

            <Box flex="1" maxWidth={{ xs: '100%', md: '500px' }}>
              <PlanCard active={currentPlan === 'premium'}>
                <CardHeader
                  title={
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Typography variant="h5" sx={{ mb: 1 }}>Plan</Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                        Premium <StarIcon sx={{ ml: 1, color: "#FFD700" }} />
                      </Typography>
                    </Box>
                  }
                  sx={{ textAlign: "center", pb: 0 }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                  <PlanPrice align="center">5 € / mes</PlanPrice>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon sx={{ color: "#FFD700" }} />
                      </ListItemIcon>
                      <ListItemText primary="Productos destacados" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BlockIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Sin anuncios" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LockOpenIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Sin límite de productos activos" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LockOpenIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Sin límite de borradores" />
                    </ListItem>
                  </List>
                  {currentPlan === 'premium' && user.subscription_start_date && user.subscription_end_date && (
    <Box textAlign="center" mt={2}>
      <Typography variant="body1" color="text.secondary">
        <strong>Activo desde:</strong>{" "}
        {new Date(user.subscription_start_date).toLocaleDateString("es-ES")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        <strong>Válido hasta:</strong>{" "}
        {new Date(user.subscription_end_date).toLocaleDateString("es-ES")}
      </Typography>
    </Box>
  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "center", p: 3 }}>
                  {token && currentPlan !== 'premium' && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => handlePlanChange('premium')}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? <CircularProgress size={24} /> : "Mejorar a Premium"}
                    </Button>
                  )}
                  {currentPlan === 'premium' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      disabled
                      fullWidth
                    >
                      Plan Actual
                    </Button>
                  )}
                </CardActions>
              </PlanCard>
            </Box>
          </Stack>
        </Paper>
      </Container>

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
      <Dialog 
  open={dialogOpen} 
  onClose={() => setDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      padding: '8px',
      maxWidth: '450px',
      width: '100%'
    }
  }}
>
  <DialogTitle sx={{ 
    fontSize: '1.5rem', 
    fontWeight: 600, 
    color: '#2C3E50',
    borderBottom: '1px solid #f0f0f0',
    padding: '16px 24px'
  }}>
    Confirmar Pago
  </DialogTitle>
  <DialogContent sx={{ padding: '20px 24px' }}>
    <DialogContentText sx={{ 
      color: '#5D6D7E',
      fontSize: '1rem',
      marginBottom: '8px',
      mt:2
    }}>
      Tienes suficiente saldo para pagar este plan. ¿Cómo quieres proceder?
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ 
    padding: '16px 24px', 
    justifyContent: 'flex-end',
    gap: '12px'
  }}>
    <Button 
      onClick={processStripePayment} 
      variant="outlined"
      sx={{
        color: '#5D6D7E',
        borderColor: '#CBD5E0',
        '&:hover': {
          backgroundColor: '#F7FAFC',
          borderColor: '#A0AEC0'
        },
        padding: '8px 16px',
        textTransform: 'none',
        fontWeight: 500
      }}
      disabled={loading}
    >
      {loading ? <CircularProgress size={20} sx={{ color: '#5D6D7E' }} /> : "Pagar con Tarjeta"}
    </Button>
    <Button 
      onClick={handlePayWithSaldo} 
      variant="contained"
      sx={{
        backgroundColor: '#3182CE',
        color: 'white',
        '&:hover': {
          backgroundColor: '#2B6CB0'
        },
        padding: '8px 16px',
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      disabled={loading}
    >
      {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Pagar con Saldo"}
    </Button>
  </DialogActions>
</Dialog>

    </>
    
  );
};

export default SubscriptionScreen;