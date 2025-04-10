import Navbar from "./Navbar";
import {
  Card,
  Container,
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Button,
  FormControl,
  alpha
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

const IMAGEN_PREDETERMINADA = "../public/default_image.png";

const CATEGORIAS = {
  "Tecnología": { icono: "💻", color: "#3f51b5" },
  "Deporte": { icono: "⚽", color: "#4caf50" },
  "Bricolaje": { icono: "🛠️", color: "#ff9800" },
  "Ropa": { icono: "👕", color: "#e91e63" },
  "Mobiliario y logística": { icono: "📦", color: "#795548" },
  "Entretenimiento": { icono: "🎮", color: "#9c27b0" }
};

const ListItemRequestsView = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState([0, 99999]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(true);

  const manejarCambioBusqueda = (e) => setTerminoBusqueda(e.target.value);
  const manejarCambioCategoria = (e) => { 
    setCategoria(e.target.value);
    setSubcategoria("")
    setRangoPrecio([0, 99999]);
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
const itemsPerPage = 5;
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)
  
  const reiniciarFiltros = () => {
    setTerminoBusqueda("");
    setCategoria("");
    setSubcategoria("");
    setRangoPrecio([0, 99999]);
  };

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
      let nextUrl = `${import.meta.env.VITE_API_BASE_URL}/objetos/list_item_requests`;
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
  
        const productosConImagenes = await Promise.all(
          allResults.map(async (producto) => {
            const urlImagen = producto.images && producto.images.length > 0
              ? await obtenerUrlImagen(producto.images[0])
              : IMAGEN_PREDETERMINADA;
            return { ...producto, urlImagen };
          })
        );
  
        setProductos(productosConImagenes);
      } catch (error) {
        console.error(error);
        setError("Error al cargar los productos.");
      } finally {
        setCargando(false);
      }
    };
  
    obtenerProductos();
  }, [obtenerUrlImagen]);

  useEffect(() => {
    const filtrados = productos.filter((producto) => (
      (categoria === "" || producto.category_display === categoria) &&
      (subcategoria === "" || producto.subcategory_display === subcategoria) &&
      (producto.price >= rangoPrecio[0] && producto.price <= rangoPrecio[1]) &&
      (terminoBusqueda === "" || producto.title.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    ));
    setProductosFiltrados(filtrados);

    if (categoria || subcategoria || terminoBusqueda || 
      rangoPrecio[0] !== 0 || rangoPrecio[1] !== 99999) {
      setCurrentPage(1);
    }

  }, [productos, categoria, subcategoria, rangoPrecio, terminoBusqueda]);

  const hayFiltrosActivos = useMemo(() => 
    terminoBusqueda !== "" || categoria !== "" || subcategoria !== "" || rangoPrecio[0] > 0 || rangoPrecio[1] < 100,
  [terminoBusqueda, categoria, subcategoria, rangoPrecio]);


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
              Productos Solicitados
            </Typography>

            <Button component={Link} to="/create_item_request" variant="contained" color="primary">
              Crear un anuncio
            </Button>
            
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
              placeholder="Buscar anuncios..."
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
                  placeholder="Buscar anuncios..."
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
                        No se encontraron anuncios
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Parece que nadie busca un producto de las características que has seleccionado. 
                      </Typography>
                    </Paper>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr", // Una tarjeta por fila en pantallas pequeñas
                          sm: "1fr 1fr", // Dos tarjetas por fila en pantallas medianas
                        },
                        gap: 3, // Espaciado entre las tarjetas
                      }}
                    >
                      {currentItems.map((producto, indice) => (
                        <Card
                          key={indice}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            border: "1px solid #e0e0e0",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                            },
                          }}
                        >
                          <Box sx={{ flex: 1, p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: "1.2rem",
                                  color: "#1E40AF",
                                }}
                              >
                                {producto.title}
                              </Typography>
                              <Box
                                component={Link}
                                to={`/perfil/${producto.user_username}`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  textDecoration: "none",
                                  color: "inherit",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                <PersonIcon sx={{ fontSize: "1.2rem", color: "#2563eb" }} />
                                <Typography variant="body2" sx={{ fontWeight: "normal" }}>
                                  {producto.user_name} {producto.user_surname}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                mb: 2,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              }}
                            >
                              {producto.description}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold", color: "#1E40AF" }}
                                >
                                  {producto.category_display}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {producto.subcategory_display}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#1E40AF",
                                    fontSize: "1rem",
                                    textAlign: "right",
                                  }}
                                >
                                  {producto.price}€/{producto.price_category_display}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  textAlign="right">
                                  Fianza: {producto.deposit}€
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  textAlign="right">
                                  Política de cancelación: {producto.cancel_type_display}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))}
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

export default ListItemRequestsView;