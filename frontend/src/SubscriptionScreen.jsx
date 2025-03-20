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
  Stack
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Navbar from "./Navbar";

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
  
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");

  const planLabels = {
    free: "Gratis",
    premium: "Premium",
  };

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.pricing_plan);
    }
  }, [user, token]);

  const handlePlanChange = async (targetPlan) => {
    if (!user || currentPlan === targetPlan) return;

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/usuarios/full/${user.id}/${
        targetPlan === 'premium' ? 'upgrade_to_premium' : 'downgrade_to_free'
      }/`;

      await axios.post(url, null, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = { ...user, pricing_plan: targetPlan };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentPlan(targetPlan);
      
      setNotification({
        open: true,
        message: `¡Plan actualizado a ${planLabels[targetPlan]}!`,
        severity: "success"
      });
    } catch (err) {
      console.error("Error al cambiar el plan:", err);
      setNotification({
        open: true,
        message: "Hubo un error al cambiar el plan.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
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
                  {token && currentPlan !== 'free' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={() => handlePlanChange('free')}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? <CircularProgress size={24} /> : "Cambiar a Gratis"}
                    </Button>
                  )}
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
    </>
  );
};

export default SubscriptionScreen;