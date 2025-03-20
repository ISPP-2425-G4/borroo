import Navbar from "./Navbar";
import {
  Container,
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  Card,
  CardContent,
  Slider,
  Tooltip,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Button,
  FormControl,
  alpha
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';

const IMAGEN_PREDETERMINADA = "../public/default_image.png";

const CATEGORIAS = {
  "Tecnología": { icono: "💻", color: "#3f51b5" },
  "Deporte": { icono: "⚽", color: "#4caf50" },
  "Bricolaje": { icono: "🛠️", color: "#ff9800" },
  "Ropa": { icono: "👕", color: "#e91e63" },
  "Mobiliario y logística": { icono: "📦", color: "#795548" },
  "Entretenimiento": { icono: "🎮", color: "#9c27b0" }
};

const Layout = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState([0, 100]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(true);

  const manejarCambioBusqueda = (e) => setTerminoBusqueda(e.target.value);
  const manejarCambioCategoria = (e) => setCategoria(e.target.value);
  const manejarCambioPrecio = (_, nuevoValor) => setRangoPrecio(nuevoValor);
  
  const reiniciarFiltros = () => {
    setTerminoBusqueda("");
    setCategoria("");
    setRangoPrecio([0, 100]);
  };

  const truncarDescripcion = useCallback((descripcion, longitud = 100) => {
    if (!descripcion) return "";
    return descripcion.length > longitud 
      ? `${descripcion.substring(0, longitud)}...`
      : descripcion;
  }, []);

  const obtenerUrlImagen = useCallback(async (imgId) => {
    try {
      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/item-images/${imgId}/`
      );
      return respuesta.data.image;
    } catch (error) {
      console.error(`Error al cargar la imagen ${imgId}:`, error);
      return IMAGEN_PREDETERMINADA;
    }
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      setCargando(true);
      try {
        const respuesta = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/full`, {
          headers: { "Content-Type": "application/json" }
        });

        const datos = respuesta.data;
        if (datos.results) {
          const productosConImagenes = await Promise.all(
            datos.results.map(async (producto) => {
              const urlImagen = producto.images && producto.images.length > 0
                ? await obtenerUrlImagen(producto.images[0])
                : IMAGEN_PREDETERMINADA;
              return { ...producto, urlImagen };
            })
          );
          setProductos(productosConImagenes);
        } else {
          setError("No hay productos disponibles.");
        }
      } catch (error) {
        setError("Error al cargar los productos. Por favor, inténtelo de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, [obtenerUrlImagen]);

  useEffect(() => {
    const filtrados = productos.filter((producto) => (
      (categoria === "" || producto.category_display === categoria) &&
      (producto.price >= rangoPrecio[0] && producto.price <= rangoPrecio[1]) &&
      (terminoBusqueda === "" || producto.title.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    ));
    setProductosFiltrados(filtrados);
  }, [productos, categoria, rangoPrecio, terminoBusqueda]);

  const hayFiltrosActivos = useMemo(() => 
    terminoBusqueda !== "" || categoria !== "" || rangoPrecio[0] > 0 || rangoPrecio[1] < 100,
  [terminoBusqueda, categoria, rangoPrecio]);

  const obtenerDetallesCategoria = (nombreCategoria) => {
    return CATEGORIAS[nombreCategoria] || { icono: "•", color: "#607d8b" };
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: '#f9fafb'
    }}>
      <Navbar />
      <Container 
        maxWidth={false} 
        sx={{ 
          flexGrow: 1,
          py: { xs: 2, md: 4 }, 
          px: { xs: 2, sm: 3, md: 4 },
          mt: "48px",
          overflow: "auto",
          maxWidth: 1400,
          mx: 'auto'
        }}
      >
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              Productos Disponibles
            </Typography>
            
            <Button 
              startIcon={<FilterListIcon />}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              variant={mostrarFiltros ? "contained" : "outlined"}
              color="red"
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                borderRadius: 2
              }}
            >
              {mostrarFiltros ? "Ocultar Filtros" : "Filtros"}
            </Button>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            width: '100%'
          }}>
            <TextField
              placeholder="Buscar productos..."
              value={terminoBusqueda}
              onChange={manejarCambioBusqueda}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: terminoBusqueda && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setTerminoBusqueda("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }}
              sx={{ 
                display: { xs: 'flex', md: 'none' }
              }}
            />

            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                width: { xs: '100%', md: 280 },
                display: { xs: mostrarFiltros ? 'block' : 'none', md: 'block' },
                height: 'fit-content',
                position: { md: 'sticky' },
                top: { md: 70 }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filtros
                </Typography>
                {hayFiltrosActivos && (
                  <Button 
                    size="small" 
                    onClick={reiniciarFiltros}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    Limpiar Todo
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ 
                display: { xs: 'none', md: 'block' },
                mb: 3
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Búsqueda
                </Typography>
                <TextField
                  placeholder="Buscar productos..."
                  value={terminoBusqueda}
                  onChange={manejarCambioBusqueda}
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: terminoBusqueda && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTerminoBusqueda("")}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                      }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Categoría
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={categoria}
                    onChange={manejarCambioCategoria}
                    displayEmpty
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 0.5,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Todas las Categorías</em>
                    </MenuItem>
                    {Object.entries(CATEGORIAS).map(([nombre, { icono }]) => (
                      <MenuItem key={nombre} value={nombre}>
                        {icono} {nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Precio
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {rangoPrecio[0]}€ - {rangoPrecio[1]}€
                  </Typography>
                </Box>
                
                <Slider
                  value={rangoPrecio}
                  onChange={manejarCambioPrecio}
                  min={0}
                  max={100}
                  step={5}
                  valueLabelDisplay="off"
                  sx={{
                    '& .MuiSlider-thumb': {
                      height: 16,
                      width: 16,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(63, 81, 181, 0.16)'
                      }
                    },
                    '& .MuiSlider-track': {
                      height: 5
                    },
                    '& .MuiSlider-rail': {
                      height: 5,
                      opacity: 0.2
                    }
                  }}
                />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 2
                }}>
                  <TextField
                    size="small"
                    label="Mín"
                    value={rangoPrecio[0]}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      readOnly: true
                    }}
                    sx={{ width: '45%' }}
                  />
                  <TextField
                    size="small"
                    label="Máx"
                    value={rangoPrecio[1]}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      readOnly: true
                    }}
                    sx={{ width: '45%' }}
                  />
                </Box>
              </Box>
            </Paper>

            <Box sx={{ flexGrow: 1 }}>
              {hayFiltrosActivos && (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    mr: 1
                  }}>
                    Filtros aplicados:
                  </Typography>
                  
                  {terminoBusqueda && (
                    <Chip
                      label={`Búsqueda: ${terminoBusqueda}`}
                      size="small"
                      onDelete={() => setTerminoBusqueda("")}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                  
                  {categoria && (
                    <Chip
                      label={`Categoría: ${categoria}`}
                      size="small"
                      onDelete={() => setCategoria("")}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                  
                  {(rangoPrecio[0] > 0 || rangoPrecio[1] < 100) && (
                    <Chip
                      label={`Precio: ${rangoPrecio[0]}€ - ${rangoPrecio[1]}€`}
                      size="small"
                      onDelete={() => setRangoPrecio([0, 100])}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {cargando ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Cargando productos...
                  </Typography>
                </Box>
              ) : error ? (
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha('#f44336', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#f44336', 0.1)
                }}>
                  <Typography color="error" variant="h6">
                    {error}
                  </Typography>
                </Paper>
              ) : (
                <>
                  {productosFiltrados.length === 0 ? (
                    <Paper sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      width: '100%',
                      borderRadius: 2,
                      bgcolor: alpha('#2196f3', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#2196f3', 0.1)
                    }}>
                      <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        No se encontraron productos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pruebe con diferentes filtros o categorías para encontrar lo que está buscando.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 2, md: 3 },
                    }}>
                      {productosFiltrados.map((producto, indice) => {
                        const { icono, color } = obtenerDetallesCategoria(producto.category_display);
                        
                        return (
                          <Box
                            key={indice}
                            sx={{
                              flex: { 
                                xs: '1 0 100%',
                                sm: '1 0 calc(50% - 16px)', 
                                md: '1 0 calc(33.333% - 16px)', 
                                lg: '1 0 calc(25% - 18px)' 
                              },
                              maxWidth: { 
                                xs: '100%',
                                sm: 'calc(50% - 16px)', 
                                md: 'calc(33.333% - 16px)', 
                                lg: 'calc(25% - 18px)' 
                              }
                            }}
                          >
                            <Link 
                              to={`/show-item/${producto.id}`}
                              style={{ 
                                textDecoration: 'none',
                                display: 'block', 
                                height: '100%' 
                              }}
                            >
                              <Card
                                sx={{
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                  boxShadow: '0px 2px 8px rgba(0,0,0,0.07)',
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
                                    "& .producto-imagen": {
                                      transform: "scale(1.08)"
                                    }
                                  }
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    position: "relative",
                                    pt: "75%", // Relación de aspecto 4:3
                                    overflow: "hidden",
                                    bgcolor: '#f5f5f5'
                                  }}
                                >
                                  <img 
                                    className="producto-imagen"
                                    src={producto.urlImagen} 
                                    alt={producto.title}
                                    style={{ 
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%", 
                                      height: "100%", 
                                      objectFit: "cover",
                                      transition: "transform 0.5s ease",
                                    }} 
                                  />
                                  
                                  <IconButton
                                    aria-label="favorito"
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        bgcolor: 'white',
                                      },
                                      zIndex: 1
                                    }}
                                    size="small"
                                    onClick={(e) => {
                                      e.preventDefault();
                                    }}
                                  >
                                    <FavoriteBorderIcon fontSize="small" />
                                  </IconButton>
                                  
                                  <Chip
                                    size="small"
                                    label={producto.category_display}
                                    sx={{
                                      position: 'absolute',
                                      bottom: 12,
                                      left: 12,
                                      borderRadius: '4px',
                                      fontWeight: 500,
                                      bgcolor: alpha(color, 0.9),
                                      color: 'white',
                                      px: 1,
                                      py: 0.5,
                                      fontSize: '0.75rem',
                                      zIndex: 1
                                    }}
                                    icon={
                                      <Box component="span" sx={{ color: 'white', mr: -0.5 }}>
                                        {icono}
                                      </Box>
                                    }
                                  />
                                </Box>
                                
                                <CardContent
                                  sx={{
                                    flexGrow: 1,
                                    p: 2.5,
                                    "&:last-child": { pb: 3 }
                                  }}
                                >
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600,
                                      mb: 1,
                                      fontSize: '1rem',
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      lineHeight: 1.3,
                                      height: '2.6em'
                                    }}
                                  >
                                    {producto.title}
                                  </Typography>
                                  
                                  <Box sx={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "flex-end",
                                    mb: 1.5
                                  }}>
                                    <Typography 
                                      variant="h5" 
                                      sx={{ 
                                        fontWeight: 700,
                                        color: 'primary.dark',
                                        fontSize: '1.25rem'
                                      }}
                                    >
                                      {producto.price}€
                                    </Typography>
                                    
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: "text.secondary",
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {producto.price_category_display}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', mb: 1, alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnOutlinedIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                      Madrid
                                    </Typography>
                                    
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                      <StarIcon sx={{ fontSize: '0.875rem', color: '#FFB400' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', ml: 0.5 }}>
                                        4.8
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Tooltip
                                    title={producto.description || "No hay descripción disponible"}
                                    arrow
                                    placement="top"
                                  >
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: "text.secondary",
                                        fontSize: '0.8125rem',
                                        lineHeight: 1.5,
                                        height: "3em",
                                        overflow: "hidden",
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                      }}
                                    >
                                      {truncarDescripcion(producto.description, 80)}
                                    </Typography>
                                  </Tooltip>
                                </CardContent>
                              </Card>
                            </Link>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;