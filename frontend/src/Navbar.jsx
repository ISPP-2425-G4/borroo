import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiHeart, FiShoppingCart, FiMenu } from "react-icons/fi";
import ArticleIcon from '@mui/icons-material/Article';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  Button,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
  Tooltip
} from "@mui/material";
import axios from 'axios';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loginAnchorEl, setLoginAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLoginClick = (event) => {
    setLoginAnchorEl(event.currentTarget);
  };

  const handleLoginClose = () => {
    setLoginAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/logout",
        { user_id: user?.id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      handleLoginClose();
      navigate('/');
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navItems = [
    { title: "Inicio", path: "/" },
    { title: "Poner en alquiler", path: "/create-item" },
    { title: "Plan de suscripción", path: "/pricing-plan" },
    { title: "Tablón de rentas", path: "/rental_requests" },
  ];

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#2563eb" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: "64px", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              letterSpacing: "0.5px",
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            BORROO
          </Typography>

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ display: { md: 'none' } }}
            >
              <FiMenu />
            </IconButton>
          )}

          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'center',
            flexGrow: 1,
            gap: 4
          }}>
            {navItems.map((item) => (
              <Button
                key={item.title}
                component={Link}
                to={item.path}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    color: '#fbbf24',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                {item.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            {user && (
              <Chip
                avatar={user?.avatar ? 
                  <Avatar src={user.avatar} alt={user.name} /> : 
                  <Avatar>{user.name.charAt(0)}</Avatar>
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {user.name}
                    {user.pricing_plan === 'premium' && (
                      <Box 
                        component="img" 
                        src="/premium.png" 
                        alt="Premium" 
                        sx={{ width: 16, height: 16 }} 
                      />
                    )}
                  </Box>
                }
                variant="outlined"
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
            )}

            <Tooltip title={user ? "Mi cuenta" : "Iniciar sesión"}>
              <IconButton onClick={handleLoginClick} color="inherit">
                <FiUser />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={loginAnchorEl}
              open={Boolean(loginAnchorEl)}
              onClose={handleLoginClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {user ? (
                <MenuItem onClick={handleLogout}>
                  Cerrar sesión
                </MenuItem>
              ) : (
                <>
                  <MenuItem onClick={() => {handleLoginClose(); navigate('/login');}}>
                    Iniciar sesión
                  </MenuItem>
                  <MenuItem onClick={() => {handleLoginClose(); navigate('/signup');}}>
                    Registrarse
                  </MenuItem>
                </>
              )}
            </Menu>

            <Tooltip title="Favoritos">
              <IconButton color="inherit">
                <Badge badgeContent={0} color="error">
                  <FiHeart />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Borradores">
            <IconButton color="inherit" component={Link} to="/drafts">
              <Badge badgeContent={0} color="error">
              <ArticleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

            <Tooltip title="Carrito">
              <IconButton color="inherit">
                <Badge badgeContent={0} color="error">
                  <FiShoppingCart />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" component="div" sx={{ color: '#2563eb', fontWeight: 'bold' }}>
                  BORROO
                </Typography>
                {user && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0)}</Avatar>
                    <Typography variant="body2">
                      {user.name}
                      {user.pricing_plan === 'premium' && (
                        <Box 
                          component="img" 
                          src="/premium.png" 
                          alt="Premium" 
                          sx={{ width: 14, height: 14, ml: 0.5, verticalAlign: 'middle' }} 
                        />
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
              <List>
                {navItems.map((item) => (
                  <ListItem 
                    button 
                    key={item.title} 
                    component={Link} 
                    to={item.path}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    <ListItemText primary={item.title} />
                  </ListItem>
                ))}
                {!user && (
                  <>
                    <ListItem 
                      button 
                      component={Link} 
                      to="/login"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.1)'
                        }
                      }}
                    >
                      <ListItemText primary="Iniciar sesión" />
                    </ListItem>
                    <ListItem 
                      button 
                      component={Link} 
                      to="/signup"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.1)'
                        }
                      }}
                    >
                      <ListItemText primary="Registrarse" />
                    </ListItem>
                  </>
                )}
                {user && (
                  <ListItem 
                    button 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    <ListItemText primary="Cerrar sesión" />
                  </ListItem>
                )}
              </List>
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;