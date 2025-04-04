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
  Tooltip,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Button,
  FormControl,
  alpha,
  FormControlLabel,
  Switch
} from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
// import AdSenseComponent from "./components/AdSense";
import AdSenseMock from "./components/AdSenseMock";
import PersonIcon from '@mui/icons-material/Person';

const currentUser = JSON.parse(localStorage.getItem("user"));

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

  const accessToken = localStorage.getItem("access_token");


  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState([0, 99999]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [mostrarSoloLiked, setMostrarSoloLiked] = useState(false);



  const manejarCambioBusqueda = (e) => setTerminoBusqueda(e.target.value);
  const manejarCambioCategoria = (e) => { 
    setCategoria(e.target.value);
    setSubcategoria("")
  }

  const manejarCambioPrecio = (e, index) => {
    let nuevoValor = parseInt(e.target.value, 10);
      if (isNaN(nuevoValor) || nuevoValor < 0) {
      nuevoValor = 0;
    }
      if (index === 0) {
      setRangoPrecio([nuevoValor, Math.max(nuevoValor, rangoPrecio[1])]);
    } else {
      setRangoPrecio([Math.min(nuevoValor, rangoPrecio[0]), nuevoValor]);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)
  
  const reiniciarFiltros = () => {
    setTerminoBusqueda("");
    setCategoria("");
    setSubcategoria("");
    setRangoPrecio([0, 99999]);
    setMostrarSoloLiked(false);
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


  const handleSubcategoriaChange = (e) => {
    setSubcategoria(e.target.value);
  };

  useEffect(() => {
    const obtenerProductos = async () => {
      setCargando(true);
      let nextUrl = `${import.meta.env.VITE_API_BASE_URL}/objetos/list_published_items`;
      let allResults = [];
  
      try {
        while (nextUrl) {
          const respuesta = await axios.get(nextUrl, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true 
          });
          console.log("Página cargada:", respuesta.data);
          allResults = [...allResults, ...respuesta.data.results];
          nextUrl = respuesta.data.next; // avanza a la siguiente página
        }
  
        const productosConImagenesYLikeStatus = await Promise.all(
          allResults.map(async (producto) => {
            const urlImagen = producto.images && producto.images.length > 0
              ? await obtenerUrlImagen(producto.images[0])
              : IMAGEN_PREDETERMINADA;
  
            const accessToken = localStorage.getItem("access_token");
            let isLiked = false;
            if (accessToken) {
              try {
                const likedResponse = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/objetos/like-status/${producto.id}/`,
                  { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                isLiked = likedResponse.data.is_liked || false;
              } catch (error) {
                console.error("Error al obtener el estado de like:", error);
              }
            }
            return { ...producto, urlImagen, isLiked };
          })
        );
  
        setProductos(productosConImagenesYLikeStatus);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los productos.");
      } finally {
        setCargando(false);
      }
    };
  
    obtenerProductos();
  }, [obtenerUrlImagen]);

  const normalizarTexto = (texto) => 
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  useEffect(() => {
    const filtrados = productos.filter((producto) => {
      const esLiked = mostrarSoloLiked ? producto.isLiked : true;
  
      return (
        esLiked &&
        (categoria === "" || producto.category_display === categoria) &&
        (subcategoria === "" || producto.subcategory_display === subcategoria) &&
        (producto.price >= rangoPrecio[0] && producto.price <= rangoPrecio[1]) &&
        (terminoBusqueda === "" || normalizarTexto(producto.title).includes(normalizarTexto(terminoBusqueda)))
      );
    });
    setProductosFiltrados(filtrados);

    if (categoria || subcategoria || terminoBusqueda || mostrarSoloLiked || 
      rangoPrecio[0] !== 0 || rangoPrecio[1] !== 99999) {
      setCurrentPage(1);
    }
  }, [productos, categoria, subcategoria, rangoPrecio, terminoBusqueda, mostrarSoloLiked]);


  const hayFiltrosActivos = useMemo(() => 
    terminoBusqueda !== "" || categoria !== "" || subcategoria !== "" || rangoPrecio[0] > 0 || rangoPrecio[1] < 99999 || mostrarSoloLiked, 
  [terminoBusqueda, categoria, subcategoria, rangoPrecio, mostrarSoloLiked]);

  const obtenerDetallesCategoria = (nombreCategoria) => {
    return CATEGORIAS[nombreCategoria] || { icono: "•", color: "#607d8b" };
  };

useEffect(() => {
  const obtenerProductosDestacados = async () => {
    setCargando(true);
    let nextUrl = `${import.meta.env.VITE_API_BASE_URL}/objetos/full/?featured=true`;
    let allResults = [];

    try {
      while (nextUrl) {
        const respuesta = await axios.get(nextUrl, {
          headers: { "Content-Type": "application/json" }
        });
        console.log("Página cargada:", respuesta.data);
        allResults = [...allResults, ...respuesta.data.results];
        nextUrl = respuesta.data.next; // avanza a la siguiente página
      }

      const productosConImagenesYLikeStatus = await Promise.all(
        allResults.map(async (producto) => {
          const urlImagen = producto.images && producto.images.length > 0
            ? await obtenerUrlImagen(producto.images[0])
            : IMAGEN_PREDETERMINADA;

          const accessToken = localStorage.getItem("access_token");
          let isLiked = false;
          if (accessToken) {
            try {
              const likedResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/objetos/like-status/${producto.id}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              isLiked = likedResponse.data.is_liked || false;
            } catch (error) {
              console.error("Error al obtener el estado de like:", error);
            }
          }
          return { ...producto, urlImagen, isLiked };
        })
      );
      setFeaturedItems(productosConImagenesYLikeStatus);

    } catch (error) {
      console.error(error);
      setError("Error al cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  obtenerProductosDestacados();
}, [obtenerUrlImagen]);

const toggleLike = async (productoId) => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/objetos/like/${productoId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id === productoId
            ? { ...producto, 
              isLiked: !producto.isLiked,
              num_likes: producto.isLiked ? producto.num_likes - 1 : producto.num_likes + 1 
            }
            : producto
        )
      );

      setFeaturedItems((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id === productoId
            ? { ...producto,
              isLiked: !producto.isLiked,
              num_likes: producto.isLiked ? producto.num_likes - 1 : producto.num_likes + 1 
            }  
            : producto
        )
      );

      setCurrentPage((prevPage) => prevPage);

    } catch (error) {
      console.error("Error al cambiar el estado de like:", error);
    }
  }
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
         <div>
         <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              Productos Destacados
            </Typography>
            <div>
                {featuredItems.length > 0 ? (
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 2, md: 3 },
                    }}>
                      {featuredItems.map((producto, indice) => {
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
                                  
                                  {accessToken &&
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
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggleLike(producto.id);
                                      }}
                                    >
                                      {producto.isLiked ? (
                                        <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                                      ) : (
                                        <FavoriteBorderIcon fontSize="small" sx={{ color: 'red' }} />
                                      )}
                                    </IconButton>
                                  }
                                  
                                  <Chip
                                    size="small"
                                    label={producto.category_display}
                                    sx={{
                                      position: 'absolute',
                                      bottom: 40,
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
                                  <Chip
                                    size="small"
                                    label={producto.subcategory_display}
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
                                      <p>Ubicación: {producto.user_location || "No disponible"}</p>
                                    </Typography>
                                    
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                      <StarIcon sx={{ fontSize: '0.875rem', color: '#FFB400' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', ml: 0.5 }}>
                                      <p>Valoración: {producto.user_rating ? producto.user_rating.toFixed(1) : "No disponible"}</p>
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
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {producto.num_likes}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Link>
                          </Box>
                        );
                      })}
                    </Box>
                ) : (
                    <p>No hay objetos destacados.</p>
                )}
            </div>
        </div>
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
                  {categoria &&
                <Typography variant="subtitle2" sx={{ mt: 2,mb: 1, fontWeight: 600 }}>
                  Subcategoría
                </Typography>}
                  {categoria === "Tecnología" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px" }}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Ordenadores">💻 Ordenadores</MenuItem>
                    <MenuItem value="Accesorios de ordenador">🖥️ Accesorios de ordenador</MenuItem>
                    <MenuItem value="Smartphones">📱 Smartphones</MenuItem>
                    <MenuItem value="Tablets">📱 Tablets</MenuItem>
                    <MenuItem value="Cámaras">📸 Cámaras</MenuItem>
                    <MenuItem value="Consolas">🎮 Consolas</MenuItem>
                    <MenuItem value="Televisores">📺 Televisores</MenuItem>
                    <MenuItem value="Monitores">🖥️ Monitores</MenuItem>
                    <MenuItem value="Hogar inteligente">🏠 Hogar inteligente</MenuItem>
                    <MenuItem value="Audio">🔊 Audio</MenuItem>
                    <MenuItem value="Smartwatches">⌚ Smartwatches</MenuItem>
                    <MenuItem value="Impresoras y escáneres">🖨️ Impresoras y escáneres</MenuItem>
                    <MenuItem value="Drones">🚁 Drones</MenuItem>
                    <MenuItem value="Proyectores">📽️ Proyectores</MenuItem>
                    <MenuItem value="Otros (Tecnología)">🔧 Otros</MenuItem>

                  </Select>)}
                  {categoria === "Deporte" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px"}}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Ciclismo">🚴‍♂️ Ciclismo</MenuItem>
                    <MenuItem value="Gimnasio">🏋️‍♂️ Gimnasio</MenuItem>
                    <MenuItem value="Calistenia">🤸‍♂️ Calistenia</MenuItem>
                    <MenuItem value="Running">🏃‍♂️ Running</MenuItem>
                    <MenuItem value="Deportes de pelota">⚽ Deportes de pelota</MenuItem>
                    <MenuItem value="Deportes de raqueta">🎾 Deportes de raqueta</MenuItem>
                    <MenuItem value="Deportes de remo">🛶 Deportes de remo</MenuItem>
                    <MenuItem value="Artes marciales">🥋 Artes marciales</MenuItem>
                    <MenuItem value="Deportes de nieve">🏂 Deportes de nieve</MenuItem>
                    <MenuItem value="Skate">🛹 Skate</MenuItem>
                    <MenuItem value="Deportes de playa">🏖️ Deportes de playa</MenuItem>
                    <MenuItem value="Deportes de piscina">🏊‍♂️ Deportes de piscina</MenuItem>
                    <MenuItem value="Deportes de río">🚣‍♂️ Deportes de río</MenuItem>
                    <MenuItem value="Deportes de montaña">🏞️ Deportes de montaña</MenuItem>
                    <MenuItem value="Deportes extremos">🏄‍♂️ Deportes extremos</MenuItem>
                    <MenuItem value="Otros (Deporte)">🔧 Otros</MenuItem>

                  </Select>
                )}
                {categoria === "Bricolaje" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px" }}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Herramientas eléctricas">🔌 Herramientas eléctricas</MenuItem>
                    <MenuItem value="Herramientas manuales">🔧 Herramientas manuales</MenuItem>
                    <MenuItem value="Máquinas">🔩 Máquinas</MenuItem>
                    <MenuItem value="Electricidad">⚡ Electricidad</MenuItem>
                    <MenuItem value="Fontanería">🚰 Fontanería</MenuItem>
                    <MenuItem value="Carpintería">🪚 Carpintería</MenuItem>
                    <MenuItem value="Pintura">🎨 Pintura</MenuItem>
                    <MenuItem value="Jardinería">🌱 Jardinería</MenuItem>
                    <MenuItem value="Decoración">🖼️ Decoración</MenuItem>
                    <MenuItem value="Otros (Bricolaje)">🔧 Otros</MenuItem>
                  </Select>
                )}
        
                {categoria === "Ropa" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px" }}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Ropa de verano">🌞 Ropa de verano</MenuItem>
                    <MenuItem value="Ropa de invierno">❄️ Ropa de invierno</MenuItem>
                    <MenuItem value="Ropa de evento para hombre">🎩 Ropa de evento para hombre</MenuItem>
                    <MenuItem value="Ropa de evento para mujer">👗 Ropa de evento para mujer</MenuItem>
                    <MenuItem value="Ropa de evento deportivo">⚽ Ropa de evento deportivo</MenuItem>
                    <MenuItem value="Zapatos para hombre">👟 Zapatos para hombre</MenuItem>
                    <MenuItem value="Zapatos para mujer">👠 Zapatos para mujer</MenuItem>
                    <MenuItem value="Trajes">👔 Trajes</MenuItem>
                    <MenuItem value="Vestidos">👗 Vestidos</MenuItem>
                    <MenuItem value="Joyería">💍 Joyería</MenuItem>
                    <MenuItem value="Relojes">⌚ Relojes</MenuItem>
                    <MenuItem value="Bolsos">👜 Bolsos</MenuItem>
                    <MenuItem value="Gafas de sol">🕶️ Gafas de sol</MenuItem>
                    <MenuItem value="Sombreros">👒 Sombreros</MenuItem>
                    <MenuItem value="Otros (Ropa)">🔧 Otros</MenuItem>
                  </Select>
                )}
        
                {categoria === "Mobiliario y logística" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px" }}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Muebles de hogar">🛋️ Muebles de hogar</MenuItem>
                    <MenuItem value="Electrodomésticos">🏠 Electrodomésticos</MenuItem>
                    <MenuItem value="Equipamiento para eventos">🎪 Equipamiento para eventos</MenuItem>
                    <MenuItem value="Muebles para niños">🛏️ Muebles para niños</MenuItem>
                    <MenuItem value="Muebles de oficina">💼 Muebles de oficina</MenuItem>
                    <MenuItem value="Cocina">🍽️ Cocina</MenuItem>
                    <MenuItem value="Baño">🚿 Baño</MenuItem>
                    <MenuItem value="Muebles de jardín">🌳 Muebles de jardín</MenuItem>
                    <MenuItem value="Decoración y ambiente">🕯️ Decoración y ambiente</MenuItem>
                    <MenuItem value="Otros (Mobiliario y logística)">🔧 Otros</MenuItem>
                  </Select>
                )}
        
                {categoria === "Entretenimiento" && (
                  <Select
                    value={subcategoria}
                    onChange={handleSubcategoriaChange}
                    displayEmpty
                    variant="outlined"
                    sx={{ minWidth: "250px" }}
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    <MenuItem value="Videojuegos">🎮 Videojuegos</MenuItem>
                    <MenuItem value="Juegos de mesa">🎲 Juegos de mesa</MenuItem>
                    <MenuItem value="Libros">📚 Libros</MenuItem>
                    <MenuItem value="Películas">🎬 Películas</MenuItem>
                    <MenuItem value="Música">🎶 Música</MenuItem>
                    <MenuItem value="Instrumentos">🎸 Instrumentos</MenuItem>
                    <MenuItem value="Fiesta">🎉 Fiesta</MenuItem>
                    <MenuItem value="Camping">🏕️ Camping</MenuItem>
                    <MenuItem value="Viaje">✈️ Viaje</MenuItem>
                    <MenuItem value="Otros (Entretenimiento)">🔧 Otros</MenuItem>
                  </Select>
                  )}
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
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 2
                }}>
                  <TextField
                    size="small"
                    label="Mín"
                    value={rangoPrecio[0]}
                    onChange={(e) => manejarCambioPrecio(e, 0)} // 0 para el campo mínimo
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      readOnly: false
                    }}
                    sx={{ width: '45%' }}
                  />
                  <TextField
                    size="small"
                    label="Máx"
                    value={rangoPrecio[1]}
                    onChange={(e) => manejarCambioPrecio(e, 1)} // 1 para el campo máximo
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      readOnly: false
                    }}
                    sx={{ width: '45%' }}
                  />

                </Box>
                {accessToken &&
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Favoritos
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mostrarSoloLiked} 
                        onChange={() => setMostrarSoloLiked(!mostrarSoloLiked)}
                        name="mostrarSoloLiked"
                        color="primary"
                      />
                    }
                    label="Favoritos ❤️"
                    labelPlacement="start"
                  />
                </Box>
                }
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
                      onDelete={() => {
                        setCategoria("");
                        setSubcategoria("");
                      }}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                  {subcategoria && (
                    <Chip
                      label={`Subcategoría: ${subcategoria}`}
                      size="small"
                      onDelete={() => setSubcategoria("")}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                  
                  {(rangoPrecio[0] > 0 || rangoPrecio[1] < 99999) && (
                    <Chip
                      label={`Precio: ${rangoPrecio[0]}€ - ${rangoPrecio[1]}€`}
                      size="small"
                      onDelete={() => setRangoPrecio([0, 99999])}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
  
                  {mostrarSoloLiked && (
                    <Chip
                      label="Tus favoritos"
                      size="small"
                      onDelete={() => setMostrarSoloLiked(false)}
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
                    {currentItems.map((producto, indice) => {
                    const { icono, color } = obtenerDetallesCategoria(producto.category_display);
                    
                    // Insertar el anuncio cada 4 productos (puedes cambiar el número según sea necesario)
                    const mostrarAnuncio = (indice + 1) % 4 === 0 && currentUser?.pricing_plan !== "premium";

                    return (
                      <React.Fragment key={indice}>
                        {/* Si debe mostrar el anuncio en este lugar, se inserta aquí */}
                        {mostrarAnuncio && <AdSenseMock />}

                        <Box
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
                                {accessToken &&
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
                                        e.stopPropagation();
                                      e.preventDefault();
                                        toggleLike(producto.id);
                                    }}
                                  >
                                      {producto.isLiked ? (
                                        <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                                      ) : (
                                      <FavoriteBorderIcon fontSize="small" sx={{ color: 'red' }} />
                                      )}
                                  </IconButton>
                                }
                                <Chip
                                  size="small"
                                  label={producto.category_display}
                                  sx={{
                                    position: 'absolute',
                                    bottom: 40,
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
                                <Chip
                                  size="small"
                                  label={producto.subcategory_display}
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
                                      height: '2.6em',
                                      minWidth: 0,
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
                                  <p>Ubicación: {producto.user_location || "No disponible"}</p>
                                  </Typography>
                                  
                                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                    <StarIcon sx={{ fontSize: '0.875rem', color: '#FFB400' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', ml: 0.5 }}>
                                    <p>Valoración: {producto.user_rating ? producto.user_rating.toFixed(1) : "No disponible"}</p>
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
                                <Link to={`/perfil/${producto.user_username}`} style={{ textDecoration: 'none' }}>
                                    <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      '&:hover': {
                                          cursor: 'pointer',
                                        },
                                     }}>
                                      <IconButton
                                        sx={{
                                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': {
                                            bgcolor: 'white',
                                          },
                                          zIndex: 1,
                                          marginRight: 1,
                                        }}
                                      >
                                        <PersonIcon fontSize="small" sx={{ color: 'blue' }} />
                                      </IconButton>
                                      <Typography 
                                        sx={{
                                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': {
                                            bgcolor: 'white',
                                            textDecoration: 'underline',
                                          },
                                          zIndex: 1,
                                        }}
                                      >
                                        {producto.user_name} {producto.user_surname}
                                      </Typography>
                                    </Box>
                                  </Link>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <IconButton
                                          sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            '&:hover': {
                                              bgcolor: 'white',
                                            },
                                            zIndex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                          }}
                                        >
                                    <FavoriteIcon fontSize="small" sx={{ color: 'red', marginRight: 0.5 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {producto.num_likes}
                                    </Typography>
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Link>
                        </Box>
                      </React.Fragment>
                    );
                  })}

                    </Box>

                  )}{totalPages > 1 && ( 
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                      <Button 
                        variant="contained" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Anterior
                      </Button>
                      <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                        Página {currentPage} de {totalPages}
                      </Typography>
                      <Button 
                        variant="contained" 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Siguiente
                      </Button>
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